import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Calendar, HelpCircle, Loader2, ArrowLeft } from 'lucide-react';
import { studentService } from '../services/api';
import toast from 'react-hot-toast';

const ApplyGatePass = () => {
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const navigate = useNavigate();

  // Get student ID from localStorage on component mount
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const id = user.id || user.studentId || user._id;
      if (id) {
        setStudentId(id);
      } else {
        setError('Student ID not found. Please login again.');
      }
    } catch (err) {
      console.error('Error getting student ID:', err);
      setError('Session error. Please login again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!reason || !startDate || !endDate) {
      setError('Please provide outing reason, start date, and end date');
      toast.error('Please provide outing reason, start date, and end date');
      return;
    }
    
    if (!studentId) {
      setError('Student ID not found. Please login again.');
      toast.error('Please login again');
      navigate('/login');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (start < now) {
      setError('Start date must be set in the future!');
      toast.error('Start date must be set in the future!');
      return;
    }
    
    if (end <= start) {
      setError('End date must represent a time after the start date!');
      toast.error('End date must be after the start date');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format data for backend - try both common formats
      const requestData = {
        studentId: studentId,
        reason: reason,
        fromDate: startDate,
        toDate: endDate,
        startDate: startDate,  // include both in case backend expects different name
        endDate: endDate       // include both in case backend expects different name
      };
      
      console.log('Submitting gate pass request:', requestData);
      
      await studentService.applyGatePass(requestData);
      
      toast.success('Gate pass request submitted successfully!');
      navigate('/student');
      
    } catch (err) {
      console.error('Apply GatePass Error:', err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        console.error('Server error response:', err.response.data);
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error || 
                            err.response.data?.errors?.join(', ') ||
                            'Failed to submit request. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err.request) {
        // Request was made but no response
        setError('No response from server. Please check your connection.');
        toast.error('Server connection error');
      } else {
        // Something else happened
        setError(err.message || 'An error occurred. Please try again.');
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto space-y-6">
      
      {/* Header and Back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 transition-colors hover:bg-white/[0.08]"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Apply Gate Pass</h1>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
            New Outing Application
          </span>
        </div>
      </div>
      
      {/* Main Form container */}
      <div className="relative p-6 overflow-hidden shadow-2xl rounded-3xl glass">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-brand-500/10 blur-[50px]" />
        
        {error && (
          <div className="p-3 mb-6 text-xs font-bold text-center border rounded-xl border-rose-500/25 bg-rose-500/10 text-rose-400 animate-pulse">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason */}
          <div>
            <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">
              Reason for Outing / Leave
            </label>
            <div className="relative">
              <HelpCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <textarea
                required
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief description (e.g., Going home for weekend, Medical checkup, Purchase textbooks...)"
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-3.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-650 transition-colors focus:border-brand-500 focus:bg-white/[0.04] focus:outline-none"
              />
            </div>
          </div>
          
          {/* Dates split grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Start Date */}
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">
                Outing Begins
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            
            {/* End Date */}
            <div>
              <label className="block mb-2 text-xs font-bold tracking-wider uppercase text-slate-400">
                Outing Closes
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-500/60 pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Info note */}
          <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4 text-[10px] text-slate-500 font-semibold leading-normal">
            Note: Submitting this application forwards it instantly to your mapped Tutor Guardian (TG). Once approved by TG, it will go to the Warden for final signing and QR generation.
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="flex-1 rounded-xl bg-white/[0.02] border border-white/5 py-3 text-xs font-bold text-slate-300 transition-colors hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 py-3 text-xs font-bold text-white transition-all shadow-lg rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request <Send size={13} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyGatePass;