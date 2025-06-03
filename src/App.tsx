import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user?.user_metadata?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;