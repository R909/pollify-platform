import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo, Btn, COLORS as C } from './ui';
import { LogOut, Plus, BarChart2, Home } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicPollPage = location.pathname.startsWith('/poll/');
  const showPublicPollGuestNav = !user && isPublicPollPage;
  return (
    <div>
    <nav style={{ background: 'rgba(255,250,245,0.86)', borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(12px)' }}
      className="sticky top-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <Link to={user ? '/dashboard' : '/'}><Logo /></Link>
      {user ? (
        <div className="flex items-center gap-3">
          <Btn variant="primary" size="sm" onClick={() => navigate('/polls/new')}>
            <Plus size={14} /> New Poll
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <Home size={14} /> Dashboard
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
            <BarChart2 size={14} /> Analytics
          </Btn>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: C.cardLight, border: `1px solid ${C.border}` }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: C.amber, color: '#2e1706' }}>
              {user.name[0].toUpperCase()}
            </div>
            <span style={{ color: C.cream, fontSize: 13 }}>{user.name}</span>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }} title="Logout">
            <LogOut size={14} />
          </Btn>
        </div>
      ) : showPublicPollGuestNav ? (
        <div className="flex items-center gap-2">
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 border ${
                isActive
                  ? 'bg-[#7a5c3e] text-white border-[#7a5c3e] shadow-md'
                  : 'bg-[#fff4e6] text-[#2e1706] border-[#ead8c0] hover:bg-[#f7e7d3]'
              }`
            }
          >
            Sign Up
          </NavLink>
        </div>
      ) : (
        <div className="flex items-center gap-2">
         <NavLink
  to="/login"
  className={({ isActive }) =>
    `px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 border ${
      isActive
        ? 'bg-[#7a5c3e] text-white border-[#7a5c3e] shadow-md'
        : 'bg-[#fff4e6] text-[#2e1706] border-[#ead8c0] hover:bg-[#f7e7d3]'
    }`
  }
>
  Login
</NavLink>

<NavLink
  to="/register"
  className={({ isActive }) =>
    `px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 border ${
      isActive
        ? 'bg-[#7a5c3e] text-white border-[#7a5c3e] shadow-md'
        : 'bg-[#fff4e6] text-[#2e1706] border-[#ead8c0] hover:bg-[#f7e7d3]'
    }`
  }
>
  Register
</NavLink>
        </div>
      )}
    </nav>
     
      </div>
  );
}
