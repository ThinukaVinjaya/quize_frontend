import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { GraduationCap, LogOut, User, BarChart2, BookOpen, Shield, FileText, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 text-white sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white font-display">
                  ExamPortal
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SL
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5 font-medium">
                National Examination Platform
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {user.role === 'STUDENT' ? (
                  <div className="hidden sm:flex items-center space-x-1">
                    <Link
                      to="/student/dashboard"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/student/dashboard')
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-blue-400" /> Quizzes
                    </Link>
                    <Link
                      to="/student/analytics"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/student/analytics')
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <BarChart2 className="w-4 h-4 text-emerald-400" /> Analytics
                    </Link>
                    <Link
                      to="/student/profile"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/student/profile')
                          ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <User className="w-4 h-4 text-purple-400" /> Profile
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center space-x-1">
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname === '/admin/dashboard'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-blue-400" /> Dashboard
                    </Link>
                    <Link
                      to="/admin/quizzes"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/admin/quizzes')
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-blue-400" /> Quizzes
                    </Link>
                    <Link
                      to="/admin/pdf-import"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/admin/pdf-import')
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-amber-400" /> PDF Import
                    </Link>
                    <Link
                      to="/admin/profile"
                      className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        location.pathname.startsWith('/admin/profile')
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <User className="w-4 h-4 text-amber-400" /> Profile
                    </Link>
                  </div>
                )}

                <div className="h-5 w-px bg-slate-800 mx-1" />

                <div className="flex items-center gap-2">
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/profile' : '/student/profile'}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
                    title="View & Edit Profile"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 group-hover:scale-105 transition-transform">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate hidden md:inline group-hover:text-white">
                      {user.fullName || user.username}
                    </span>
                    {user.role === 'ADMIN' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
