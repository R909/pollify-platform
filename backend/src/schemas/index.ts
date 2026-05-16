import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const OptionSchema = z.object({
  text: z.string().min(1).max(500),
});

export const QuestionSchema = z.object({
  text: z.string().min(1).max(1000),
  is_mandatory: z.boolean().default(true),
  options: z.array(OptionSchema).min(2, 'Each question needs at least 2 options'),
});

export const CreatePollSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  is_anonymous: z.boolean().default(true),
  expires_at: z.string().datetime().optional().nullable(),
  questions: z.array(QuestionSchema).min(1, 'At least one question required'),
});

export const SubmitResponseSchema = z.object({
  answers: z.array(z.object({
    question_id: z.string().uuid(),
    option_id: z.string().uuid(),
  })),
});
