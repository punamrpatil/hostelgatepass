import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Calendar, ArrowLeft, Clock, Search, HelpCircle, Loader2 } from 'lucide-react';
import { studentService } from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const data = await studentService.getHistory();
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let result = [...history];
    if (filter === 'Pending') {
      result = result.filter(p => p.status.includes('Pending'));
    } else if (filter === 'Approved') {
      result = result.filter(p => p.status === 'Approved_Warden');
    } else if (filter === 'Rejected') {
      result = result.filter(p => p.status.includes('Rejected'));
    }
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      result = result.filter(p => regex.test(p.reason));
    }
    setFilteredHistory(result);
  }, [filter, searchTerm, history]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending_TG':
        return <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">Pending TG</span>;
      case 'Approved_TG':
        return <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">TG Approved</span>;
      case 'Approved_Warden':
        return <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">Approved</span>;
      case 'Rejected_TG':
      case 'Rejected_Warden':
        return <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">Rejected</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student')}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 transition-colors hover:bg-white/[0.08]"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <HistoryIcon size={22} className="text-brand-400" /> Outing Records Log
          </h1>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
            All submitted applications
          </span>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row rounded-2xl glass">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-[#030712] py-2 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center w-full gap-2 overflow-x-auto sm:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === opt
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      <div className="p-6 rounded-3xl glass">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-400">No records matching your filters</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((pass, idx) => (
              <div key={idx} className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4 transition-all hover:bg-white/[0.02]">

                <div className="flex flex-col items-start justify-between gap-2 pb-3 border-b sm:flex-row sm:items-center border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Outing Reason</span>
                    <h3 className="mt-1 text-sm font-bold text-slate-200">{pass.reason}</h3>
                  </div>
                  {getStatusBadge(pass.status)}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Requested Start</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-1">
                      <Calendar size={13} className="text-brand-400" />
                      {new Date(pass.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Requested End</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 mt-1">
                      <Calendar size={13} className="text-rose-400" />
                      {new Date(pass.endDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gate Checkout</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-1">
                      <Clock size={13} className="text-slate-500" />
                      {pass.actualExitTime
                        ? new Date(pass.actualExitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Not Checked Out'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gate Checkin</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-1">
                      <Clock size={13} className="text-slate-500" />
                      {pass.actualEntryTime
                        ? new Date(pass.actualEntryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Not Checked In'}
                    </span>
                  </div>
                </div>

                {(pass.tgRemarks || pass.wardenRemarks) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.01] border border-white/5 rounded-xl p-3 text-[11px] font-medium leading-normal">
                    {pass.tgRemarks && (
                      <div>
                        <span className="block text-[9px] text-brand-400 font-bold uppercase tracking-wider">TG Remarks</span>
                        <p className="mt-1 text-slate-400">{pass.tgRemarks}</p>
                      </div>
                    )}
                    {pass.wardenRemarks && (
                      <div>
                        <span className="block text-[9px] text-amber-400 font-bold uppercase tracking-wider">Warden Remarks</span>
                        <p className="mt-1 text-slate-400">{pass.wardenRemarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;