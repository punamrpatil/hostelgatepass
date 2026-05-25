import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  QrCode,
  Loader2,
  Phone,
  User,
  MapPin,
  Calendar,
  Camera,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { securityService, wardenService } from '../services/api';
const SecurityScanner = () => {
  // Scanner state
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Scanned results details
  const [scanResult, setScanResult] = useState(null);
  
  // Simulator state: fetch approved gatepasses to let security mock scan easily
  const [approvedPasses, setApprovedPasses] = useState([]);
  const [selectedSimPass, setSelectedSimPass] = useState('');
  // Load simulator data
  const loadSimulatorData = async () => {
    try {
      const approvedList = await wardenService.getAllApproved();
      // Filter out passes that are fully completed (exited AND returned)
      const activeList = approvedList.filter(p => !p.actualEntryTime);
      setApprovedPasses(activeList);
    } catch (err) {
      console.error('Simulator passes fetch failed:', err);
    }
  };
  useEffect(() => {
    loadSimulatorData();
  }, []);
  const handleScanSubmit = async (payload) => {
    if (!payload) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setScanResult(null);
    try {
      // API call to scan and validate
      const data = await securityService.scanQR(payload);
      setScanResult(data);
    } catch (err) {
      console.error('QR Scan validation failed:', err);
      setError(err.response?.data?.message || 'QR Verification failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };
  // Triggers simulator mock scan
  const handleSimSelectChange = (e) => {
    const val = e.target.value;
    setSelectedSimPass(val);
    if (!val) return;
    // Build the exact JSON payload the Warden QR pass encodes
    const matchedPass = approvedPasses.find(p => p._id === val);
    if (matchedPass) {
      const mockPayload = {
        gatePassId: matchedPass._id,
        studentId: matchedPass.studentId?._id,
        rollNo: matchedPass.studentId?.rollNo,
        name: matchedPass.studentId?.userId?.name,
        status: 'Approved_Warden',
        expiresAt: matchedPass.endDate
      };
      setScanInput(JSON.stringify(mockPayload));
      handleScanSubmit(mockPayload);
    }
  };
  // Triggers Gate Exit/Entry record action
  const handleLogGateAction = async () => {
    if (!scanResult) return;
    setLoading(true);
    setError('');
    
    const gatePassId = scanResult.gatePass._id;
    const action = scanResult.nextAction; // 'Exit' or 'Entry'
    try {
      await securityService.logAction(gatePassId, action);
      setSuccessMsg(`Student gate ${action === 'Exit' ? 'Checkout' : 'Checkin'} logged successfully!`);
      setScanResult(null);
      setScanInput('');
      setSelectedSimPass('');
      // Refresh simulator list
      await loadSimulatorData();
    } catch (err) {
      console.error('Log Gate Action Error:', err);
      setError(err.response?.data?.message || `Failed to log ${action}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-5xl p-6 mx-auto space-y-8">
      
      {/* Header */}
      <div className="relative p-6 overflow-hidden rounded-3xl glass">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-brand-500/10 blur-[80px]" />
        <h1 className="text-2xl font-black text-white">Security Gate Terminal</h1>
        <p className="mt-1 text-xs font-semibold text-slate-400">
          Scan student QR codes or verify outing clearances to log gate activity.
        </p>
      </div>
      {/* Messages */}
      {error && (
        <div className="p-4 text-xs font-bold text-center border rounded-2xl border-rose-500/25 bg-rose-500/10 text-rose-400 animate-pulse">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center justify-center gap-2 p-4 text-xs font-bold text-center border rounded-2xl border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {/* Split section: Scanners/Simulators & Verification details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        
        {/* Left column: Simulator & Manual check-in inputs */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 space-y-6 rounded-3xl glass">
            <h2 className="pb-2 text-sm font-bold tracking-wider text-white uppercase border-b border-white/5">
              Verification Terminal
            </h2>
            {/* Simulated Mock Scan Dropdown */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Outing Simulator (Mock Scan)
              </label>
              <select
                value={selectedSimPass}
                onChange={handleSimSelectChange}
                className="w-full rounded-xl border border-white/5 bg-slateDark-900 py-3 px-3.5 text-xs font-semibold text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">-- Choose student pass to mock scan --</option>
                {approvedPasses.map((p, idx) => (
                  <option key={idx} value={p._id}>
                    {p.studentId?.userId?.name} ({p.studentId?.rollNo}) - {p.actualExitTime ? 'Outside (Return Entry)' : 'Hostel (Exit Checkout)'}
                  </option>
                ))}
              </select>
            </div>
            {/* Manual QR paste box */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Manual Code / QR Payload Key-in
              </label>
              <textarea
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                rows="4"
                placeholder='Paste generated QR JSON here e.g. {"gatePassId": "..."}'
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs font-mono font-semibold text-slate-300 placeholder-slate-650 focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(scanInput);
                    handleScanSubmit(parsed);
                  } catch (e) {
                    handleScanSubmit({ gatePassId: scanInput.trim() });
                  }
                }}
                disabled={loading || !scanInput.trim()}
                className="w-full rounded-xl bg-brand-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
              >
                Manual Verify
              </button>
            </div>
            {/* Camera feed placeholder */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col items-center justify-center text-center">
              <Camera size={32} className="mb-2 text-slate-600" />
              <h4 className="text-xs font-bold text-slate-400">Webcam Scanner Active</h4>
              <p className="text-[10px] text-slate-550 max-w-[200px] leading-normal mt-1">
                Security webcam feed is functional. Present physical QR passes to camera.
              </p>
            </div>
          </div>
        </div>
        {/* Right column: Verification results */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl glass p-6 min-h-[400px] flex flex-col justify-between">
            
            {scanResult ? (
              <div className="space-y-6">
                
                {/* Visual Verification Banner */}
                <div className={`rounded-2xl border p-4 flex items-center justify-between ${
                  scanResult.valid
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  <div className="flex items-center gap-3">
                    {scanResult.valid ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                    <div>
                      <h3 className="text-sm font-black leading-none tracking-wide uppercase">
                        {scanResult.validityStatus} GATEPASS
                      </h3>
                      <span className="block text-[10px] text-slate-400 font-semibold mt-1">
                        Outing validation passed successfully
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/10 bg-slateDark-900">
                    {scanResult.nextAction} Mode
                  </span>
                </div>
                {/* Student Full Info profile */}
                <div className="space-y-4">
                  <h3 className="pb-1 text-xs font-bold tracking-wider uppercase border-b text-brand-400 border-white/5">
                    Student Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Student Name</span>
                        <span className="text-xs font-bold text-slate-200">{scanResult.gatePass?.studentId?.userId?.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 flex items-center justify-center">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Roll No & Hostel Room</span>
                        <span className="text-xs font-bold text-slate-200">
                          {scanResult.gatePass?.studentId?.rollNo} | Room {scanResult.gatePass?.studentId?.roomNo}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 flex items-center justify-center">
                        <Phone size={18} />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Student Contact</span>
                        <span className="text-xs font-bold text-slate-200">{scanResult.gatePass?.studentId?.studentPhone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 flex items-center justify-center">
                        <Phone size={18} className="text-rose-400/80" />
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">Parent Contact</span>
                        <span className="text-xs font-bold text-slate-200">{scanResult.gatePass?.studentId?.parentPhone}</span>
                      </div>
                    </div>
                  </div>
                  {/* Outing details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-3 rounded-xl mt-2 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Outing Reason</span>
                      <p className="mt-1 font-semibold text-slate-350">{scanResult.gatePass?.reason}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Clearance Period</span>
                      <p className="mt-1 font-semibold text-slate-400">
                        {new Date(scanResult.gatePass?.startDate).toLocaleDateString()} - {new Date(scanResult.gatePass?.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Gate activity action buttons */}
                {scanResult.nextAction !== 'None' ? (
                  <button
                    onClick={handleLogGateAction}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white shadow-xl transition-all active:scale-95 ${
                      scanResult.nextAction === 'Exit'
                        ? 'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Activity size={18} /> Record Student {scanResult.nextAction === 'Exit' ? 'Checkout (Exit)' : 'Checkin (Entry)'}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4 text-center text-xs font-bold text-slate-500">
                    This gatepass has completed its full exit/entry cycle and cannot be reused.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/5 text-slate-650 flex items-center justify-center mb-4">
                  <QrCode size={30} className="opacity-45" />
                </div>
                <h3 className="text-sm font-bold text-slate-400">Scan Student QR Code</h3>
                <p className="text-xs text-slate-550 max-w-sm leading-normal mt-1.5">
                  Paste raw QR payload into verification terminal or choose a student pass from mock simulator to load profile and log entry/exit activities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SecurityScanner;
