import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Mail, Loader2, ArrowRight } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return setError('Please provide both email and password');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Response:', response.status, data);
      
      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      
      // Save credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id || data.user?._id,
        id: data._id || data.user?._id,
        name: data.name || data.user?.name,
        email: data.email || data.user?.email,
        role: data.role || data.user?.role,
        phone: data.phone || data.user?.phone,
      }));
      
      if (onLoginSuccess) onLoginSuccess();
      
      // Redirect based on role
      const userRole = data.role || data.user?.role;
      const rolePath = userRole === 'Admin' ? '/admin' :
                      userRole === 'Student' ? '/student' :
                      userRole === 'TG' ? '/tg' :
                      userRole === 'Warden' ? '/warden' :
                      userRole === 'Security' ? '/security/scanner' :
                      userRole === 'HOD' ? '/hod' : '/';
      navigate(rolePath);
      
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#030712] px-4 py-12">
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="relative w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center text-white shadow-xl h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600">
            <Shield size={28} />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white">Welcome Back</h1>
          <p className="mt-2 text-xs font-semibold tracking-widest uppercase text-slate-400">Smart Gate Pass Terminal</p>
        </div>

        {error && (
          <div className="p-3 mt-6 text-xs font-semibold text-center border rounded-xl border-rose-500/25 bg-rose-500/10 text-rose-400">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase text-slate-400">Email Address</label>
            <div className="relative mt-2">
              <Mail className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 transition-colors focus:border-brand-500 focus:bg-white/[0.04] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-400">Password</label>
            </div>
            <div className="relative mt-2">
              <Key className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 transition-colors focus:border-brand-500 focus:bg-white/[0.04] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 font-bold text-white shadow-lg shadow-brand-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/30 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-xs font-medium text-center text-slate-400">
          First time student?{' '}
          <Link to="/register" className="font-bold transition-colors text-brand-400 hover:text-brand-300">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;