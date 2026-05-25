import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  UserCheck,
  UserMinus,
  Loader2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Search,
  BookOpen
} from 'lucide-react';
import { hodService } from '../services/api';
import StatCard from '../components/StatCard';
const HODDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const fetchHODData = async () => {
    try {
      const data = await hodService.getAnalytics();
      setAnalytics(data);
      setFilteredStudents(data.outsideStudents || []);
    } catch (err) {
      console.error('Failed to load HOD analytics:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHODData();
  }, []);
  // Search logic for outside students list
  useEffect(() => {
    if (!analytics) return;
    let list = [...analytics.outsideStudents];
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      list = list.filter(
        student =>
          regex.test(student.name) ||
          regex.test(student.rollNo) ||
          regex.test(student.branch)
      );
    }
    setFilteredStudents(list);
  }, [searchTerm, analytics]);
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }
  // Visual counts
  const totalOutside = analytics?.totalOutside || 0;
  const boysCount = analytics?.boysOutside || 0;
  const girlsCount = analytics?.girlsOutside || 0;
  const stats = analytics?.overallStats || {};
  const branches = analytics?.branchBreakdown || {};
  return (
    <div className="p-6 space-y-8">
      
      {/* Visual Header */}
      <div className="relative p-6 overflow-hidden rounded-3xl glass">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-brand-500/10 blur-[80px]" />
        <h1 className="text-2xl font-black text-white">HOD Analytics Terminal</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Monitor hostel occupancy statistics, branch outing ratios, and live gate status reports.
        </p>
      </div>
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Students Outside"
          value={totalOutside}
          icon={UserMinus}
          colorClass="from-brand-500 to-cyan-500"
          glowClass="glow-cyan"
        />
        <StatCard
          title="Boys Outside"
          value={boysCount}
          icon={Users}
          colorClass="from-blue-500 to-indigo-500"
        />
        <StatCard
          title="Girls Outside"
          value={girlsCount}
          icon={Users}
          colorClass="from-rose-500 to-pink-500"
        />
        <StatCard
          title="Total Gatepasses"
          value={stats.totalRequests || 0}
          icon={Activity}
          colorClass="from-purple-500 to-violet-500"
        />
      </div>
      {/* Split grid: Custom HTML charts & Branch metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Columns: Branch Outing custom visual chart */}
        <div className="p-6 space-y-6 lg:col-span-2 rounded-3xl glass">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <BookOpen size={20} className="text-brand-400" /> Outings Ratio By Branch
          </h2>
          <div className="space-y-5">
            {Object.keys(branches).length === 0 ? (
              <div className="py-12 text-xs font-semibold text-center text-slate-550">
                No active outing data to construct branch metrics.
              </div>
            ) : (
              Object.entries(branches).map(([branch, count], idx) => {
                const percentage = totalOutside > 0 ? (count / totalOutside) * 100 : 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{branch} Branch</span>
                      <span className="text-slate-400">{count} Outings ({percentage.toFixed(0)}%)</span>
                    </div>
                    {/* HTML Chart Bar */}
                    <div className="h-2.5 w-full bg-slateDark-800 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Right Column: Status metrics overview */}
        <div className="p-6 space-y-6 rounded-3xl glass">
          <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
            System Pass Status Split
          </h2>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending TG Review
              </span>
              <span className="text-white">{stats.pendingTG || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Forwarded to Warden
              </span>
              <span className="text-white">{stats.approvedTG || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Warden Approved
              </span>
              <span className="text-white">{stats.approvedWarden || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-3 rounded-xl">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Total Outings Rejected
              </span>
              <span className="text-white">{stats.rejected || 0}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Live Outside Outing Table */}
      <div className="p-6 space-y-6 rounded-3xl glass">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock size={20} className="text-rose-400" /> Live Outings Register
          </h2>
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, roll, branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#030712] py-2 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-650 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto border rounded-2xl border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Student</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Roll Number</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Branch & Div</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Hostel Room</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Checkout Time</th>
                <th className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">Outing Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-xs font-semibold text-center text-slate-500">
                    No students currently outside.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-white/[0.01]">
                    <td className="p-4 text-xs font-bold text-slate-100">{student.name}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.rollNo}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.branch} - {student.division}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.roomNo}</td>
                    <td className="p-4 text-xs font-semibold text-slate-350">
                      {student.exitTime ? new Date(student.exitTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending Checkout'}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.reason}</td>
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
export default HODDashboard;
