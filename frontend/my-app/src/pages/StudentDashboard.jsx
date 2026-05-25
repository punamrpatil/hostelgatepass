import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Send,
  Loader2,
  HelpCircle,
  ArrowRight,
  QrCode 
} from 'lucide-react';
import { studentService } from '../services/api';
import StatCard from '../components/StatCard';
const StudentDashboard = () => {
  const [activePass, setActivePass] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchDashboardData = async () => {
    try {
      const activeData = await studentService.getActivePass();
      setActivePass(activeData);
      const historyData = await studentService.getHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch student dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const handleDownloadQR = () => {
    if (!activePass?.qrCode) return;
    const link = document.createElement('a');
    link.href = activePass.qrCode;
    link.download = `GatePass-${activePass._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Status helper styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending_TG':
        return <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">Pending TG</span>;
      case 'Approved_TG':
        return <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">TG Approved</span>;
      case 'Approved_Warden':
        return <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">Approved (Warden)</span>;
      case 'Rejected_TG':
      case 'Rejected_Warden':
        return <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">Rejected</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };
  // Calculate stats from history
  const totalApplied = history.length;
  const approvedPassesCount = history.filter(p => p.status === 'Approved_Warden').length;
  const rejectedPassesCount = history.filter(p => p.status.includes('Rejected')).length;
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }
  return (
    <div className="p-6 space-y-8">
      
      {/* Visual Header */}
      <div className="relative p-6 overflow-hidden rounded-3xl glass">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-brand-500/10 blur-[80px]" />
        <h1 className="text-2xl font-black text-white">Student Gatepass Terminal</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Apply, track, and download hostel outing passes.
        </p>
      </div>
      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard
          title="Total Applications"
          value={totalApplied}
          icon={Send}
          colorClass="from-brand-500 to-cyan-500"
        />
        <StatCard
          title="Approved Outings"
          value={approvedPassesCount}
          icon={CheckCircle2}
          colorClass="from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Rejected Outings"
          value={rejectedPassesCount}
          icon={AlertCircle}
          colorClass="from-rose-500 to-pink-500"
        />
      </div>
      {/* Main Grid: Active Pass Tracking & Visuals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left/Middle Columns: Active Pass Status or Call-To-Action */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 space-y-6 rounded-3xl glass">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Clock size={20} className="text-brand-400" /> Active Outing Status
            </h2>
            {activePass ? (
              <div className="space-y-6">
                
                {/* Visual Outing details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Outing Reason</span>
                    <p className="mt-1 text-sm font-semibold text-white">{activePass.reason}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Verification Status</span>
                    <div className="mt-1">{getStatusBadge(activePass.status)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Outing Begins</span>
                    <p className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-brand-400" />
                      {new Date(activePass.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Outing Closes</span>
                    <p className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-rose-400" />
                      {new Date(activePass.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                {/* Step Progress Tracker */}
                <div className="relative flex flex-col items-start justify-between gap-6 px-2 py-4 md:flex-row md:items-center md:gap-4">
                  {/* Process Stepper Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
                  {/* Step 1: applied */}
                  <div className="relative z-10 flex items-center w-full gap-3 text-left md:flex-col md:gap-2 md:text-center md:w-auto">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-bold border-4 border-[#030712]">
                      1
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-200">Pass Applied</span>
                      <span className="block text-[10px] text-slate-400">Sent to TG</span>
                    </div>
                  </div>
                  {/* Step 2: TG approved */}
                  {(() => {
                    const isPassed = activePass.status !== 'Pending_TG';
                    return (
                      <div className="relative z-10 flex items-center w-full gap-3 text-left md:flex-col md:gap-2 md:text-center md:w-auto">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold border-4 border-[#030712] ${
                          isPassed ? 'bg-brand-500 text-white' : 'bg-slateDark-800 text-slate-500'
                        }`}>
                          2
                        </div>
                        <div>
                          <span className={`block text-xs font-bold ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>TG Approved</span>
                          <span className="block text-[10px] text-slate-400">Forwarded to Warden</span>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Step 3: Warden Approved */}
                  {(() => {
                    const isPassed = activePass.status === 'Approved_Warden';
                    return (
                      <div className="relative z-10 flex items-center w-full gap-3 text-left md:flex-col md:gap-2 md:text-center md:w-auto">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold border-4 border-[#030712] ${
                          isPassed ? 'bg-emerald-500 text-white' : 'bg-slateDark-800 text-slate-500'
                        }`}>
                          3
                        </div>
                        <div>
                          <span className={`block text-xs font-bold ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>Warden Approved</span>
                          <span className="block text-[10px] text-slate-400">QR generated</span>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Step 4: Out of Gate */}
                  {(() => {
                    const isPassed = activePass.actualExitTime !== null;
                    return (
                      <div className="relative z-10 flex items-center w-full gap-3 text-left md:flex-col md:gap-2 md:text-center md:w-auto">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold border-4 border-[#030712] ${
                          isPassed ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slateDark-800 text-slate-500'
                        }`}>
                          4
                        </div>
                        <div>
                          <span className={`block text-xs font-bold ${isPassed ? 'text-slate-200' : 'text-slate-500'}`}>Exited Hostel</span>
                          <span className="block text-[10px] text-slate-400">Security scanned</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/5">
                <HelpCircle className="w-12 h-12 text-slate-500" />
                <h3 className="mt-3 text-sm font-bold text-slate-300">No Active Outing Passes</h3>
                <p className="mt-1.5 text-xs text-slate-400 leading-normal max-w-sm">
                  You do not have any pending or active gate pass applications. Need to exit the hostel premises?
                </p>
                <Link
                  to="/student/apply"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/10 transition-all hover:bg-brand-600"
                >
                  Apply Gate Pass <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Right Column: QR Code Visualizer Block */}
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center rounded-3xl glass">
            <h2 className="w-full pb-2 text-sm font-bold tracking-wider text-center text-white uppercase border-b border-white/5">
              Outing QR Pass
            </h2>
            {activePass && activePass.status === 'Approved_Warden' && activePass.qrCode ? (
              <div className="flex flex-col items-center space-y-5">
                {/* QR Code Container with nice visual shadow */}
                <div className="p-3 bg-white rounded-2xl shadow-xl shadow-brand-500/5 max-w-[200px]">
                  <img
                    src={activePass.qrCode}
                    alt="Outing Gatepass QR Code"
                    className="w-full h-auto"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Scan at Security</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Present this QR at the main entrance gate.
                  </p>
                </div>
                <button
                  onClick={handleDownloadQR}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slateDark-800 border border-white/5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slateDark-750"
                >
                  <Download size={14} /> Download Pass
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-12">
                <div className="h-28 w-28 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-600 mb-4">
                  <QrCode size={48} className="opacity-40" />
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-normal max-w-[200px]">
                  QR Pass generates instantly once the Warden grants final approval.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Recent Activity Logs */}
      <div className="p-6 rounded-3xl glass">
        <h2 className="mb-6 text-lg font-bold text-white">Recent Outings History</h2>
        <div className="overflow-x-auto border rounded-2xl border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Outing Reason</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Start Date</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">End Date</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-xs font-semibold text-center text-slate-500">
                    No gatepass records found.
                  </td>
                </tr>
              ) : (
                history.map((pass, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-white/[0.01]">
                    <td className="p-4 text-xs font-bold text-slate-200">{pass.reason}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">
                      {new Date(pass.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-400">
                      {new Date(pass.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4">{getStatusBadge(pass.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default StudentDashboard;
