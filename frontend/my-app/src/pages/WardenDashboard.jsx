import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckSquare,
  Clock,
  Loader2,
  XCircle,
  QrCode,
  MessageSquare,
  Download
} from 'lucide-react';
import { wardenService } from '../services/api';
import StatCard from '../components/StatCard';
const WardenDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [approvedPasses, setApprovedPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [modalAction, setModalAction] = useState(''); // 'Approve' or 'Reject'
  const fetchWardenData = async () => {
    try {
      const requestsData = await wardenService.getGatePassRequests();
      setRequests(requestsData);
      const approvedData = await wardenService.getAllApproved();
      setApprovedPasses(approvedData);
    } catch (error) {
      console.error('Failed to load Warden dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWardenData();
  }, []);
  const openActionModal = (request, action) => {
    setActiveRequest(request);
    setModalAction(action);
    setRemarks(action === 'Approve' ? 'Approved by Warden' : 'Rejected by Warden');
  };
  const closeActionModal = () => {
    setActiveRequest(null);
    setModalAction('');
    setRemarks('');
  };
  const handleProcessAction = async () => {
    if (!activeRequest) return;
    setActionLoading(true);
    try {
      if (modalAction === 'Approve') {
        await wardenService.finalApprove(activeRequest._id, remarks);
      } else {
        await wardenService.rejectRequest(activeRequest._id, remarks);
      }
      await fetchWardenData();
      closeActionModal();
    } catch (error) {
      console.error('Action failed:', error);
      alert('Failed to process request: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };
  const handleDownloadQR = (pass) => {
    if (!pass.qrCode) return;
    const link = document.createElement('a');
    link.href = pass.qrCode;
    link.download = `Pass-${pass.studentId?.rollNo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
        <h1 className="text-2xl font-black text-white">Hostel Warden Terminal</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Issue secure signed QR codes and review student outing clearances.
        </p>
      </div>
      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <StatCard
          title="Awaiting Review"
          value={requests.length}
          icon={ShieldAlert}
          colorClass="from-amber-500 to-yellow-500"
          glowClass={requests.length > 0 ? 'glow-cyan ring-1 ring-amber-500/20 animate-pulse' : ''}
        />
        <StatCard
          title="Active QR passes"
          value={approvedPasses.length}
          icon={ShieldCheck}
          colorClass="from-emerald-500 to-teal-500"
        />
      </div>
      {/* Main Grid: Pending reviews & Issued Passes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Columns: Warden Queue */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 rounded-3xl glass">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-bold text-white">
              <Clock size={20} className="text-amber-500 animate-pulse" /> Pending Warden Signature Queue
            </h2>
            {requests.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 font-semibold bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                No outstanding student gatepasses awaiting final signature.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4 transition-all hover:bg-white/[0.02]">
                    
                    {/* Header */}
                    <div className="flex flex-col items-start justify-between gap-3 pb-3 border-b sm:flex-row sm:items-center border-white/5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">{req.studentId?.userId?.name}</h3>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          Roll: {req.studentId?.rollNo} | Room: {req.studentId?.roomNo} | Division: {req.studentId?.branch}-{req.studentId?.division}
                        </span>
                      </div>
                      <div className="flex items-center w-full gap-2 sm:w-auto">
                        <button
                          onClick={() => openActionModal(req, 'Reject')}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => openActionModal(req, 'Approve')}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/10"
                        >
                          <QrCode size={14} /> Final Approve & Sign
                        </button>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Outing Reason</span>
                        <p className="mt-1 font-semibold text-slate-350">{req.reason}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">TG Remarks</span>
                          <p className="mt-1 italic font-semibold text-slate-450">"{req.tgRemarks}"</p>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Outing Dates</span>
                          <p className="mt-1 font-semibold text-slate-400">
                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right Column: Issued Passes & QR Previews */}
        <div className="space-y-6">
          <div className="p-6 space-y-6 rounded-3xl glass">
            <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
              Recently Signed Passes
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {approvedPasses.length === 0 ? (
                <div className="py-8 text-xs font-semibold text-center text-slate-550">
                  No active gatepasses issued yet.
                </div>
              ) : (
                approvedPasses.map((pass, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-2xl p-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex items-center justify-center flex-shrink-0 font-bold border h-9 w-9 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-xl">
                        {pass.studentId?.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold truncate text-slate-200">{pass.studentId?.userId?.name}</h4>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          Roll: {pass.studentId?.rollNo}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadQR(pass)}
                      className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white flex items-center justify-center"
                      title="Download QR Code image"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Action modal for comments */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-slateDark-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 space-y-4 duration-200 border shadow-2xl rounded-2xl border-white/5 bg-slateDark-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="font-bold text-slate-200">
                Warden Final Review
              </h3>
              <span className="text-[10px] bg-slateDark-800 border border-white/10 px-2 py-0.5 rounded-full font-bold text-slate-400 uppercase">
                {activeRequest.studentId?.userId?.name}
              </span>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Warden Clearance Remarks / Instructions
              </label>
              <div className="relative">
                <MessageSquare className="absolute w-4 h-4 pointer-events-none left-3 top-3 text-slate-550" />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-9 pr-3 text-xs font-semibold text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Enter Warden instructions..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-white/[0.02] border border-white/5 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessAction}
                disabled={actionLoading}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-lg ${
                  modalAction === 'Approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  modalAction === 'Approve' ? <QrCode size={14} /> : <XCircle size={14} />
                )}
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WardenDashboard;
