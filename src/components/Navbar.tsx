import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { GraduationCap, LogOut, User, BarChart2, BookOpen, Shield, FileText, Menu, X, PlusCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-white sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
            onClick={() => navigate(user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-white font-display">
                  ExamPortal
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  SL
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 block -mt-0.5 font-medium truncate max-w-[150px] sm:max-w-none">
                National Examination Platform
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {user.role === 'STUDENT' ? (
                  <div className="hidden md:flex items-center space-x-1">
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
                  <div className="hidden md:flex items-center space-x-1">
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

                <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/profile' : '/student/profile'}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
                    title="View & Edit Profile"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 group-hover:scale-105 transition-transform flex-shrink-0">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[100px] sm:max-w-[120px] truncate hidden sm:inline group-hover:text-white">
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
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all hidden sm:flex items-center gap-1.5 text-xs font-semibold"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>

                  {/* Mobile Hamburger Menu Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 md:hidden transition-all"
                    aria-label="Toggle Navigation Menu"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer Navigation */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/98 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="text-xs font-bold text-white truncate max-w-[180px]">{user.fullName}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()} Account</div>
              </div>
            </div>
            {user.role === 'ADMIN' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin
              </span>
            )}
          </div>

          {user.role === 'STUDENT' ? (
            <div className="space-y-1">
              <Link
                to="/student/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/student/dashboard')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-400" /> Quizzes & Examinations
              </Link>
              <Link
                to="/student/analytics"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/student/analytics')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Performance Analytics
              </Link>
              <Link
                to="/student/profile"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/student/profile')
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-purple-400" /> Student Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-400" /> Dashboard Overview
              </Link>
              <Link
                to="/admin/quizzes"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/admin/quizzes') && location.pathname !== '/admin/quizzes/create'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-400" /> Manage Quizzes
              </Link>
              <Link
                to="/admin/quizzes/create"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/admin/quizzes/create'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-blue-400" /> Create New Quiz
              </Link>
              <Link
                to="/admin/pdf-import"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/admin/pdf-import')
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" /> PDF Question Import
              </Link>
              <Link
                to="/admin/profile"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname.startsWith('/admin/profile')
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-amber-400" /> Administrator Profile
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out from Account
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
