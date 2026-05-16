import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SiteFooter from './components/SiteFooter';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePoll from './pages/CreatePoll';
import Analytics from './pages/Analytics';
import PublicPoll from './pages/PublicPoll';
import PublishResults from './pages/PublishResults';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPublicPollPage = location.pathname.startsWith('/poll/');

  if (isPublicPollPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#fffaf5', color: '#2e1706', border: '1px solid #ead8c0', fontFamily: 'DM Sans, sans-serif' },
          success: { iconTheme: { primary: '#d89a57', secondary: '#fffaf5' } },
          error: { iconTheme: { primary: '#d05050', secondary: '#fff' } },
        }} />
        <Routes>
          <Route path="/poll/:token" element={<Layout><PublicPoll /></Layout>} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/dashboard" element={<Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>} />
          <Route path="/polls/new" element={<Layout><ProtectedRoute><CreatePoll /></ProtectedRoute></Layout>} />
          <Route path="/analytics" element={<Layout><ProtectedRoute><Analytics /></ProtectedRoute></Layout>} />
          <Route path="/polls/:id/analytics" element={<Layout><ProtectedRoute><Analytics /></ProtectedRoute></Layout>} />
          <Route path="/polls/:id/publish" element={<Layout><ProtectedRoute><PublishResults /></ProtectedRoute></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
