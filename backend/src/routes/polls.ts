import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CreatePollSchema } from '../schemas';
import { Server as SocketServer } from 'socket.io';

export function pollRouter(io: SocketServer) {
  const router = Router();

  // Create poll
  router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const data = CreatePollSchema.parse(req.body);
      const shareToken = uuidv4().replace(/-/g, '').substring(0, 12);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const pollRes = await client.query(
          `INSERT INTO polls (creator_id, title, description, is_anonymous, expires_at, share_token)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [req.user!.id, data.title, data.description || null, data.is_anonymous, data.expires_at || null, shareToken]
        );
        const poll = pollRes.rows[0];

        for (let qi = 0; qi < data.questions.length; qi++) {
          const q = data.questions[qi];
          const qRes = await client.query(
            `INSERT INTO questions (poll_id, text, is_mandatory, order_index) VALUES ($1,$2,$3,$4) RETURNING id`,
            [poll.id, q.text, q.is_mandatory, qi]
          );
          const qId = qRes.rows[0].id;
          for (let oi = 0; oi < q.options.length; oi++) {
            await client.query(
              `INSERT INTO options (question_id, text, order_index) VALUES ($1,$2,$3)`,
              [qId, q.options[oi].text, oi]
            );
          }
        }
        await client.query('COMMIT');
        return res.status(201).json({ poll: { ...poll, share_url: `/poll/${shareToken}` } });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Get my polls
  router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT p.*, 
          (SELECT COUNT(*) FROM responses r WHERE r.poll_id = p.id) as response_count,
          CASE WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW() THEN true ELSE p.is_closed END as is_expired
         FROM polls p WHERE p.creator_id = $1 ORDER BY p.created_at DESC`,
        [req.user!.id]
      );
      return res.json({ polls: result.rows });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Get poll by share token (public)
  router.get('/share/:token', async (req: AuthRequest, res: Response) => {
    try {
      const { token } = req.params;
      const pollRes = await pool.query(
        `SELECT p.*, u.name as creator_name,
          CASE WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW() THEN true ELSE p.is_closed END as is_expired
         FROM polls p JOIN users u ON u.id = p.creator_id WHERE p.share_token = $1`,
        [token]
      );
      if (!pollRes.rows[0]) return res.status(404).json({ error: 'Poll not found' });
      const poll = pollRes.rows[0];

      // If published, return results
      if (poll.is_published) {
        const analytics = await getAnalytics(poll.id);
        return res.json({ poll, mode: 'results', analytics });
      }

      // If expired, return closed
      if (poll.is_expired) {
        return res.json({ poll, mode: 'closed' });
      }

      // Return poll with questions
      const questions = await pool.query(
        `SELECT q.*, json_agg(json_build_object('id', o.id, 'text', o.text, 'order_index', o.order_index) ORDER BY o.order_index) as options
         FROM questions q JOIN options o ON o.question_id = q.id
         WHERE q.poll_id = $1 GROUP BY q.id ORDER BY q.order_index`,
        [poll.id]
      );
      return res.json({ poll, mode: 'respond', questions: questions.rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Submit response
  router.post('/share/:token/respond', async (req: AuthRequest, res: Response) => {
    try {
      const { token } = req.params;
      const pollRes = await pool.query(
        `SELECT * FROM polls WHERE share_token = $1`,
        [token]
      );
      if (!pollRes.rows[0]) return res.status(404).json({ error: 'Poll not found' });
      const poll = pollRes.rows[0];

      // Check expiry
      if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
        return res.status(410).json({ error: 'Poll has expired' });
      }
      if (poll.is_closed || poll.is_published) {
        return res.status(410).json({ error: 'Poll is closed' });
      }

      const { answers, respondent_name } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers required' });
      }

      // Validate mandatory questions
      const mandatoryQs = await pool.query(
        `SELECT id FROM questions WHERE poll_id = $1 AND is_mandatory = true`,
        [poll.id]
      );
      const answeredIds = new Set(answers.map((a: any) => a.question_id));
      for (const q of mandatoryQs.rows) {
        if (!answeredIds.has(q.id)) {
          return res.status(400).json({ error: `Question ${q.id} is mandatory` });
        }
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const respRes = await client.query(
          `INSERT INTO responses (poll_id, respondent_name) VALUES ($1,$2) RETURNING id`,
          [poll.id, respondent_name || 'Anonymous']
        );
        const responseId = respRes.rows[0].id;
        for (const ans of answers) {
          await client.query(
            `INSERT INTO answers (response_id, question_id, option_id) VALUES ($1,$2,$3)`,
            [responseId, ans.question_id, ans.option_id]
          );
        }
        await client.query('COMMIT');

        // Get live count and emit
        const countRes = await pool.query(
          `SELECT COUNT(*) as count FROM responses WHERE poll_id = $1`,
          [poll.id]
        );
        const liveCount = parseInt(countRes.rows[0].count);
        io.to(`poll:${poll.id}`).emit('response_count', { count: liveCount });

        // Emit full analytics update
        const analytics = await getAnalytics(poll.id);
        io.to(`poll:${poll.id}`).emit('analytics_update', analytics);

        return res.status(201).json({ message: 'Response submitted', response_id: responseId });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Get analytics (creator only)
  router.get('/:id/analytics', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const pollRes = await pool.query(`SELECT * FROM polls WHERE id = $1 AND creator_id = $2`, [req.params.id, req.user!.id]);
      if (!pollRes.rows[0]) return res.status(404).json({ error: 'Poll not found' });
      const analytics = await getAnalytics(req.params.id as string);
      return res.json(analytics);
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Publish poll results
  router.post('/:id/publish', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `UPDATE polls SET is_published = true, is_closed = true WHERE id = $1 AND creator_id = $2 RETURNING *`,
        [req.params.id, req.user!.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Poll not found' });
      io.to(`poll:${req.params.id}`).emit('poll_published', { poll_id: req.params.id });
      return res.json({ poll: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Close poll (stop accepting responses)
  router.post('/:id/close', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `UPDATE polls SET is_closed = true WHERE id = $1 AND creator_id = $2 RETURNING *`,
        [req.params.id, req.user!.id]
      );
      if (!result.rows[0]) return res.status(404).json({ error: 'Poll not found' });
      return res.json({ poll: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete poll
  router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      await pool.query(`DELETE FROM polls WHERE id = $1 AND creator_id = $2`, [req.params.id, req.user!.id]);
      return res.json({ message: 'Deleted' });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

async function getAnalytics(pollId: string) {
  const totalRes = await pool.query(`SELECT COUNT(*) as total FROM responses WHERE poll_id = $1`, [pollId]);
  const total = parseInt(totalRes.rows[0].total);

  const questions = await pool.query(
    `SELECT q.id, q.text, q.is_mandatory, q.order_index,
      json_agg(
        json_build_object('id', o.id, 'text', o.text, 'order_index', o.order_index,
          'count', (SELECT COUNT(*) FROM answers a WHERE a.option_id = o.id))
        ORDER BY o.order_index
      ) as options
     FROM questions q JOIN options o ON o.question_id = q.id
     WHERE q.poll_id = $1 GROUP BY q.id ORDER BY q.order_index`,
    [pollId]
  );

  return {
    total_responses: total,
    questions: questions.rows.map((q: any) => ({
      ...q,
      options: q.options.map((o: any) => ({
        ...o,
        count: parseInt(o.count),
        percentage: total > 0 ? Math.round((parseInt(o.count) / total) * 100) : 0,
      })),
    })),
  };
}
