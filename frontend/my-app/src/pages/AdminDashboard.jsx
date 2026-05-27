import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Users,
  Search,
  FileText,
  UserCheck,
  AlertTriangle,
  Loader2,
  Table,
  Plus,
  X
} from 'lucide-react';
import { adminService } from '../services/api';
import StatCard from '../components/StatCard';

const AdminDashboard = () => {
  const [usersList, setUsersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  // ✅ FIXED: tgsList now holds TG objects from /admin/tgs (has tgName, _id, userId)
  const [tgsList, setTgsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [studentFile, setStudentFile] = useState(null);
  const [tgFile, setTgFile] = useState(null);
  const [uploadingStudent, setUploadingStudent] = useState(false);
  const [uploadingTG, setUploadingTG] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTGId, setSelectedTGId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [allUsers, allStudents, allTGs] = await Promise.all([
        adminService.getAllUsers(),
        adminService.searchStudents(''),
        // ✅ FIXED: use getAllTGs which returns proper TG objects with tgName
        adminService.getAllTGs()
      ]);
      setUsersList(allUsers);
      setStudentsList(allStudents);
      setTgsList(allTGs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    try {
      const filtered = await adminService.searchStudents(val);
      setStudentsList(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentUpload = async (e) => {
    e.preventDefault();
    if (!studentFile) return;
    setUploadingStudent(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', studentFile);
    try {
      const res = await adminService.uploadStudents(formData);
      setUploadResult({ type: 'Student', ...res });
      setStudentFile(null);
      await fetchAdminData();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingStudent(false);
    }
  };

  const handleTGUpload = async (e) => {
    e.preventDefault();
    if (!tgFile) return;
    setUploadingTG(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', tgFile);
    try {
      const res = await adminService.uploadTGs(formData);
      setUploadResult({ type: 'TG', ...res });
      setTgFile(null);
      await fetchAdminData();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingTG(false);
    }
  };

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    // ✅ FIXED: tgId on student is a TG object, its _id is what we send
    setSelectedTGId(student.tgId?._id || '');
    setShowAssignModal(true);
  };

  const handleAssignTG = async () => {
    if (!selectedStudent || !selectedTGId) {
      alert('Please select a TG');
      return;
    }
    setAssigning(true);
    try {
      const response = await adminService.assignTG(selectedStudent._id, selectedTGId);
      if (response.success) {
        setShowAssignModal(false);
        await fetchAdminData();
      } else {
        alert(response.message || 'Failed to assign TG');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign TG');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const totalUsers   = usersList.length;
  const studentsCount = usersList.filter(u => u.role === 'Student').length;
  const tgsCount     = usersList.filter(u => u.role === 'TG').length;
  const wardensCount = usersList.filter(u => u.role === 'Warden').length;

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="relative p-6 overflow-hidden rounded-3xl glass">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-brand-500/10 blur-[80px]" />
        <h1 className="text-2xl font-black text-white">Administrative Control Panel</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Upload spreadsheets, audit users, search the student database, and assign Tutor Guardians.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Registered Users"    value={totalUsers}    icon={Users}     colorClass="from-brand-500 to-cyan-500" />
        <StatCard title="Active Students"           value={studentsCount} icon={UserCheck} colorClass="from-blue-500 to-indigo-500" />
        <StatCard title="Active Tutor Guardians"    value={tgsCount}      icon={Users}     colorClass="from-amber-500 to-yellow-500" />
        <StatCard title="Active Wardens"            value={wardensCount}  icon={Table}     colorClass="from-purple-500 to-violet-500" />
      </div>

      {/* Upload Zones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Upload Students */}
        <div className="p-6 space-y-4 rounded-3xl glass">
          <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
            Import Students via Excel
          </h2>
          <form onSubmit={handleStudentUpload} className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer border-white/10 bg-white/[0.01] hover:bg-white/[0.03] py-8 transition-colors">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                <p className="text-xs font-semibold text-slate-400">
                  {studentFile ? studentFile.name : 'Click to select .xlsx / .xls file'}
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setStudentFile(e.target.files[0])}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={uploadingStudent || !studentFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-40 disabled:pointer-events-none"
            >
              {uploadingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud size={16} />}
              {uploadingStudent ? 'Uploading...' : 'Upload Students Sheet'}
            </button>
          </form>
        </div>

        {/* Upload TGs */}
        <div className="p-6 space-y-4 rounded-3xl glass">
          <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
            Import Tutor Guardians via Excel
          </h2>
          <form onSubmit={handleTGUpload} className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer border-white/10 bg-white/[0.01] hover:bg-white/[0.03] py-8 transition-colors">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                <p className="text-xs font-semibold text-slate-400">
                  {tgFile ? tgFile.name : 'Click to select .xlsx / .xls file'}
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setTgFile(e.target.files[0])}
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={uploadingTG || !tgFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none"
            >
              {uploadingTG ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud size={16} />}
              {uploadingTG ? 'Uploading...' : 'Upload TGs Sheet'}
            </button>
          </form>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="p-6 space-y-4 rounded-3xl glass border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400">
              ✅ {uploadResult.type} Upload Result
            </h3>
            <button onClick={() => setUploadResult(null)} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex justify-between">
              <span className="text-slate-400">Successfully Imported</span>
              <span className="text-emerald-400">{uploadResult.successCount}</span>
            </div>
            <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex justify-between">
              <span className="text-slate-400">Rows Skipped</span>
              <span className="text-amber-400">{uploadResult.skippedCount}</span>
            </div>
          </div>
          {uploadResult.errors?.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-amber-500" /> Skipped Logs ({uploadResult.errors.length})
              </span>
              <div className="max-h-32 overflow-y-auto border border-white/5 bg-slateDark-950 p-2.5 rounded-xl text-[10px] font-mono text-slate-400 space-y-1">
                {uploadResult.errors.map((err, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-bold text-rose-400">●</span>
                    <span>{err.email || err.rollNo || 'unknown'} — {err.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Excel Templates Reference */}
      <div className="p-6 space-y-4 rounded-3xl glass">
        <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
          Spreadsheet Headers Reference
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] font-mono text-slate-400">
          <div>
            <span className="block text-brand-400 font-bold mb-1.5 uppercase">Students Excel (10 columns):</span>
            <div className="p-3 overflow-x-auto leading-normal border bg-slateDark-950 rounded-xl border-white/5">
              name | rollNo | branch | division | gender | studentPhone | parentPhone | roomNo | email | tgName
            </div>
          </div>
          <div>
            <span className="block text-amber-400 font-bold mb-1.5 uppercase">TGs Excel (5 columns):</span>
            <div className="p-3 overflow-x-auto leading-normal border bg-slateDark-950 rounded-xl border-white/5">
              tgName | branch | division | email | phone
            </div>
          </div>
        </div>
      </div>

      {/* Students Database */}
      <div className="p-6 space-y-6 rounded-3xl glass">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Users size={20} className="text-brand-400" /> Students Database
          </h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by roll, name, division..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-white/5 bg-[#030712] py-2.5 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-2xl border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                {['Student Name','Roll Number','Division & Branch','Room No','Assigned TG','Email','Action'].map(h => (
                  <th key={h} className="p-4 text-xs font-bold tracking-wider uppercase text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-xs font-semibold text-center text-slate-500">
                    No students registered in system.
                  </td>
                </tr>
              ) : (
                studentsList.map((student, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-white/[0.01]">
                    <td className="p-4 text-xs font-bold text-slate-100">{student.userId?.name}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.rollNo}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.branch} - {student.division}</td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.roomNo}</td>
                    <td className="p-4 text-xs font-semibold">
                      {student.tgId?.tgName ? (
                        <span className="text-emerald-400">{student.tgId.tgName}</span>
                      ) : (
                        <span className="italic text-amber-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-400">{student.userId?.email}</td>
                    <td className="p-4">
                      <button
                        onClick={() => openAssignModal(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
                      >
                        <Plus size={12} /> Assign TG
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign TG Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 space-y-4 bg-slateDark-950 border border-white/10 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Assign Tutor Guardian</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-3 border border-white/10 rounded-xl bg-white/[0.02]">
              <p className="text-xs text-slate-400">Student</p>
              <p className="text-sm font-semibold text-white">{selectedStudent.userId?.name}</p>
              <p className="mt-1 text-xs text-slate-400">Roll: {selectedStudent.rollNo} | Room: {selectedStudent.roomNo}</p>
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold text-slate-400">Select Tutor Guardian</label>
              <select
                value={selectedTGId}
                onChange={(e) => setSelectedTGId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slateDark-900 py-2.5 px-3 text-sm font-semibold text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">-- Select TG --</option>
                {/* ✅ FIXED: tgsList holds TG objects, use _id as value, tgName as label */}
                {tgsList.map((tg) => (
                  <option key={tg._id} value={tg._id}>
                    {tg.tgName} — {tg.branch} / {tg.division}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-bold text-slate-300 hover:bg-white/[0.07]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTG}
                disabled={assigning || !selectedTGId}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {assigning ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Assign TG'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;