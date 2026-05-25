import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { tgService } from '../services/api';
import StatCard from '../components/StatCard';
const TGDashboard = () => {
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [modalAction, setModalAction] = useState(''); // 'Approve' or 'Reject'
  const fetchTGData = async () => {
    try {
      const studentData = await tgService.getAssignedStudents();
      setStudents(studentData);
      const requestData = await tgService.getGatePassRequests();
      setRequests(requestData);
    } catch (error) {
      console.error('Failed to load TG dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTGData();
  }, []);
  const openActionModal = (request, action) => {
    setActiveRequest(request);
    setModalAction(action);
    setRemarks(action === 'Approve' ? 'Approved by TG' : 'Outing rejected by TG');
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
        await tgService.approveRequest(activeRequest._id, remarks);
      } else {
        await tgService.rejectRequest(activeRequest._id, remarks);
      }
      // Refetch
      await fetchTGData();
      closeActionModal();
    } catch (error) {
      console.error('Action failed:', error);
      alert('Failed to process request: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
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
        <h1 className="text-2xl font-black text-white">Tutor Guardian Dashboard</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Review gatepass applications and monitor assigned student statuses.
        </p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <StatCard
          title="Assigned Students"
          value={students.length}
          icon={Users}
          colorClass="from-brand-500 to-cyan-500"
        />
        <StatCard
          title="Pending Approvals"
          value={requests.length}
          icon={Clock}
          colorClass="from-amber-500 to-yellow-500"
          glowClass={requests.length > 0 ? 'glow-cyan ring-1 ring-amber-500/20' : ''}
        />
      </div>
      {/* Main Grid: Pending Approvals Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left/Middle Column: Requests Queue */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 rounded-3xl glass">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-bold text-white">
              <Clock size={20} className="text-amber-500" /> Outing Requests Queue
            </h2>
            {requests.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500 font-semibold bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                No pending gatepass requests in queue.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4 transition-all hover:bg-white/[0.02]">
                    
                    {/* Student profile summary */}
                    <div className="flex flex-col items-start justify-between gap-3 pb-3 border-b sm:flex-row sm:items-center border-white/5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">{req.studentId?.userId?.name}</h3>
                        <span className="block text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                          Roll: {req.studentId?.rollNo} | Room: {req.studentId?.roomNo} | Branch: {req.studentId?.branch}-{req.studentId?.division}
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
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-bold text-white hover:bg-brand-600 shadow-md shadow-brand-500/10"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      </div>
                    </div>
                    {/* Application details */}
                    <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reason</span>
                        <p className="mt-1 font-semibold text-slate-300">{req.reason}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Start Date</span>
                          <p className="mt-1 font-semibold text-slate-400">
                            {new Date(req.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">End Date</span>
                          <p className="mt-1 font-semibold text-slate-400">
                            {new Date(req.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
        {/* Right Column: Assigned Students List */}
        <div className="space-y-6">
          <div className="p-6 space-y-6 rounded-3xl glass">
            <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
              Assigned Students List
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {students.length === 0 ? (
                <div className="py-8 text-xs font-semibold text-center text-slate-500">
                  No students assigned under your division.
                </div>
              ) : (
                students.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-3">
                    <div className="flex items-center justify-center font-bold border h-9 w-9 bg-brand-500/10 border-brand-500/20 text-brand-400 rounded-xl">
                      {student.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold truncate text-slate-200">{student.userId?.name}</h4>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Roll: {student.rollNo} | Room: {student.roomNo}
                      </span>
                    </div>
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
                {modalAction} Gate Pass Request
              </h3>
              <span className="text-[10px] bg-slateDark-800 border border-white/10 px-2 py-0.5 rounded-full font-bold text-slate-400 uppercase">
                {activeRequest.studentId?.userId?.name}
              </span>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Approval Remarks / Comments
              </label>
              <div className="relative">
                <MessageSquare className="absolute w-4 h-4 left-3 top-3 text-slate-550" />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-2.5 pl-9 pr-3 text-xs font-semibold text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Leave institutional remarks..."
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
                  modalAction === 'Approve' ? 'bg-brand-500 hover:bg-brand-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  modalAction === 'Approve' ? <UserCheck size={14} /> : <XCircle size={14} />
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
export default TGDashboard;
