import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import {
  Users,
  Activity,
  CheckCircle,
  PlusCircle,
  Upload,
  Award,
  ArrowRight,
  Download
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadMonthlyPdf = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const token = localStorage.getItem('accessToken') || '';
    window.open(`/api/admin/reports/monthly/${year}/${month}/pdf?token=${encodeURIComponent(token)}`, '_blank');
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading administration dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time management of examinations, registered students, and performance evaluations
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownloadMonthlyPdf}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-purple-200 font-bold rounded-2xl text-xs flex items-center gap-2 border border-slate-800 shadow-lg transition-all"
            title="Download this month's aggregated PDF report"
          >
            <Download className="w-4 h-4 text-purple-400" /> Monthly Report PDF
          </button>
          <Link
            to="/admin/pdf-import"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-2xl text-xs flex items-center gap-2 border border-slate-800 shadow-lg transition-all"
          >
            <Upload className="w-4 h-4 text-amber-400" /> Import PDF
          </Link>
          <Link
            to="/admin/quizzes/create"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Create Quiz
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Students
            </span>
            <span className="text-2xl font-black text-white font-display">
              {stats.totalStudents}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Live Quizzes
            </span>
            <span className="text-2xl font-black text-emerald-400 font-display">
              {stats.liveQuizzes}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Attempts
            </span>
            <span className="text-2xl font-black text-purple-400 font-display">
              {stats.totalAttempts}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Average Score
            </span>
            <span className="text-2xl font-black text-amber-400 font-display">
              {stats.averageScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Recent Quizzes List */}
      <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
          <h2 className="text-lg font-bold text-white font-display">Recent Examinations</h2>
          <Link
            to="/admin/quizzes"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentQuizzes.length === 0 ? (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <p className="text-xs">No examinations currently created in the real database.</p>
            <p className="text-[11px] text-slate-600">
              Click &quot;Create Quiz&quot; or &quot;Import PDF&quot; above to schedule your first examination!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {stats.recentQuizzes.map((q: any) => (
              <div key={q._id} className="py-4 flex justify-between items-center text-sm">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block text-sm font-sinhala">{q.title}</span>
                  <span className="text-xs text-slate-400">
                    {q.subjectId?.nameEn || q.subjectId?.nameSi} • {q.durationMinutes} mins
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase ${
                    q.status === 'LIVE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
