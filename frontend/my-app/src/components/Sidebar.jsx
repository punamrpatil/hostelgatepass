import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Upload,
  FileSpreadsheet,
  QrCode,
  History,
  CheckSquare,
  Shield,
  TrendingUp,
  LogOut,
  Send,
  User,
  Settings
} from 'lucide-react';
const Sidebar = ({ user, isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const getLinksByRole = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Manage Users', path: '/admin/users', icon: Users },
          { name: 'Import Sheets', path: '/admin/import', icon: Upload },
          { name: 'All Gatepasses', path: '/admin/gatepasses', icon: FileSpreadsheet },
        ];
      case 'Student':
        return [
          { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'Apply Pass', path: '/student/apply', icon: Send },
          { name: 'Pass History', path: '/student/history', icon: History },
        ];
      case 'TG':
        return [
          { name: 'Dashboard', path: '/tg', icon: LayoutDashboard },
          { name: 'My Students', path: '/tg/students', icon: Users },
        ];
      case 'Warden':
        return [
          { name: 'Dashboard', path: '/warden', icon: LayoutDashboard },
          { name: 'Approved Passes', path: '/warden/approved', icon: QrCode },
        ];
      case 'Security':
        return [
          { name: 'QR Scanner', path: '/security/scanner', icon: Shield },
        ];
      case 'HOD':
        return [
          { name: 'Dashboard', path: '/hod', icon: TrendingUp },
        ];
      default:
        return [];
    }
  };
  const roleLinks = getLinksByRole();
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slateDark-950/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar container */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-slateDark-950/90 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-white shadow-md rounded-xl bg-brand-500 shadow-brand-500/20">
              <Shield size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold leading-none text-white">SmartGate</span>
              <span className="block text-[10px] text-brand-400 font-semibold tracking-wider uppercase">Hostel Gatepass</span>
            </div>
          </div>
        </div>
        {/* User Card */}
        <div className="mx-4 mb-6 rounded-2xl bg-white/[0.03] border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center font-bold border rounded-full h-11 w-11 bg-slateDark-800 text-brand-300 border-white/10">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-slate-100">{user?.name || 'Guest'}</h4>
              <p className="truncate text-[11px] text-slate-400 font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 mt-3 border-t border-white/5">
            <span className="inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/20">
              {user?.role}
            </span>
            {user?.student?.rollNo && (
              <span className="text-[10px] text-slate-400 font-medium">
                Roll: {user.student.rollNo}
              </span>
            )}
          </div>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
          {roleLinks.map((link, idx) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={idx}
                to={link.path}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/15'
                    : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-100'
                }`}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Icon
                  size={20}
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>
        {/* Footer Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/10"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
