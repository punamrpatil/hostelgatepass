import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, Phone, Hash, BookOpen, Layers, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/api';
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNo: '',
    branch: '',
    division: '',
    gender: 'Male',
    parentPhone: '',
    roomNo: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Field Validation
    const { name, email, password, phone, rollNo, branch, division, parentPhone, roomNo } = formData;
    if (!name || !email || !password || !phone || !rollNo || !branch || !division || !parentPhone || !roomNo) {
      return setError('Please fill in all mandatory fields');
    }
    setLoading(true);
    try {
      await authService.register({
        name,
        email,
        password,
        phone,
        role: 'Student', // Registered manually always defaults to Student
        rollNo,
        branch,
        division,
        gender: formData.gender,
        studentPhone: phone,
        parentPhone,
        roomNo
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.message || 'Registration failed. Check details and try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#030712] px-4 py-12">
      {/* visual glowing decorations */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="relative w-full max-w-2xl p-8 shadow-2xl rounded-3xl glass">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 text-white shadow-xl rounded-2xl bg-brand-500">
            <Shield size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">Student Registration</h1>
          <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-slate-400">
            Create Hostel Gate Pass Account
          </p>
        </div>
        {error && (
          <div className="p-3 mt-6 text-xs font-bold text-center border rounded-xl border-rose-500/25 bg-rose-500/10 text-rose-400">
            {error}
          </div>
        )}
        {success ? (
          <div className="flex flex-col items-center justify-center p-6 mt-8 text-center border bg-emerald-500/10 border-emerald-500/25 rounded-2xl">
            <CheckCircle className="h-14 w-14 text-emerald-400 animate-bounce" />
            <h3 className="mt-4 text-lg font-bold text-emerald-400">Account Created Successfully!</h3>
            <p className="mt-1.5 text-xs text-slate-400 font-semibold">
              Redirecting you to the Login terminal...
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Split layout: Base Info & College Info */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              
              {/* Left Column: Account Details */}
              <div className="space-y-4">
                <h3 className="pb-1 text-xs font-bold tracking-wider uppercase border-b text-brand-400 border-white/5">
                  1. Account Details
                </h3>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="johndoe@college.edu"
                      className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              {/* Right Column: College Hostel Info */}
              <div className="space-y-4">
                <h3 className="pb-1 text-xs font-bold tracking-wider uppercase border-b text-brand-400 border-white/5">
                  2. Academic & Hostel Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Roll Number</label>
                    <div className="relative mt-1.5">
                      <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="rollNo"
                        required
                        value={formData.rollNo}
                        onChange={handleChange}
                        placeholder="20CO45"
                        className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-8.5 pr-2.5 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hostel Room</label>
                    <div className="relative mt-1.5">
                      <Layers className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="roomNo"
                        required
                        value={formData.roomNo}
                        onChange={handleChange}
                        placeholder="B-304"
                        className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-8.5 pr-2.5 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Branch</label>
                    <div className="relative mt-1.5">
                      <BookOpen className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="branch"
                        required
                        value={formData.branch}
                        onChange={handleChange}
                        placeholder="CSE"
                        className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-8.5 pr-2.5 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Division</label>
                    <div className="relative mt-1.5">
                      <Layers className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        name="division"
                        required
                        value={formData.division}
                        onChange={handleChange}
                        placeholder="A"
                        className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-8.5 pr-2.5 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full mt-1.5 rounded-xl border border-white/5 bg-slateDark-900 py-2.5 px-3 text-xs font-semibold text-white focus:border-brand-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parent Phone</label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        name="parentPhone"
                        required
                        value={formData.parentPhone}
                        onChange={handleChange}
                        placeholder="9012345678"
                        className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-8.5 pr-2.5 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Register Account'
              )}
            </button>
          </form>
        )}
        <div className="mt-6 text-xs font-medium text-center text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold transition-colors text-brand-400 hover:text-brand-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
