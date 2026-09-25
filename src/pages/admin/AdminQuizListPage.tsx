import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Quiz } from '../../types/index.js';
import {
  FileText,
  Play,
  RefreshCw,
  BarChart2,
  Download,
  PlusCircle,
  AlertCircle,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  X,
  Sparkles,
} from 'lucide-react';

export const AdminQuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingQuiz, setSharingQuiz] = useState<Quiz | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const getShareUrl = (quizId: string) => `${window.location.origin}/quiz/${quizId}`;

  const handleCopyLink = (quizId: string) => {
    navigator.clipboard.writeText(getShareUrl(quizId));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = (quiz: Quiz) => {
    const url = getShareUrl(quiz._id);
    const text = encodeURIComponent(
      `🎯 *${quiz.title}* - National Curriculum Quiz\n⏱️ Duration: ${quiz.durationMinutes} mins | 🏆 Marks: ${quiz.totalMarks}\n\n👉 Join & Attempt now: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const fetchQuizzes = () => {
    api
      .get('/admin/quizzes')
      .then((res) => setQuizzes(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handlePublish = async (quizId: string, status: string) => {
    try {
      await api.post(`/admin/quizzes/${quizId}/publish`, { status });
      fetchQuizzes();
    } catch (err) {
      alert('Failed to update publication status.');
    }
  };

  const handleRepublishAsNew = async (quizId: string) => {
    if (!confirm('Are you sure you want to republish this quiz as a new examination session? This will reset student rankings for the new session.')) return;
    try {
      await api.post(`/admin/quizzes/${quizId}/republish`, {
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 30,
      });
      alert('Quiz successfully republished as a new live session.');
      fetchQuizzes();
    } catch (err) {
      alert('Failed to republish examination.');
    }
  };

  const handleDownloadPdf = (quizId: string) => {
    const token = localStorage.getItem('accessToken') || '';
    window.open(`/api/admin/reports/${quizId}/pdf?token=${encodeURIComponent(token)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading examinations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Manage Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, schedule, publish, and evaluate national curriculum quizzes
          </p>
        </div>

        <Link
          to="/admin/quizzes/create"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Create New Quiz
        </Link>
      </div>

      <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
        {quizzes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-base font-bold text-white">No Quizzes Created Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have a fresh, clean database ready for real examinations. Click &quot;Create New Quiz&quot; above or import questions directly from a PDF.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 sm:px-6">Quiz Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-white font-sinhala">{quiz.title}</td>
                    <td className="p-4 font-semibold text-slate-300">
                      {(quiz.subjectId as any)?.nameEn || (quiz.subjectId as any)?.nameSi}
                    </td>
                    <td className="p-4 text-slate-400">{quiz.durationMinutes} mins</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase ${
                          quiz.status === 'LIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : quiz.status === 'SCHEDULED'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 text-right space-x-2 whitespace-nowrap">
                      {quiz.status !== 'LIVE' && (
                        <button
                          onClick={() => handlePublish(quiz._id, 'LIVE')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          title="Publish Live"
                        >
                          <Play className="w-3 h-3 fill-current" /> Publish
                        </button>
                      )}

                      <button
                        onClick={() => handleRepublishAsNew(quiz._id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1 border border-slate-700"
                        title="Republish as a new session"
                      >
                        <RefreshCw className="w-3 h-3" /> Republish
                      </button>

                      <Link
                        to={`/admin/quizzes/${quiz._id}/report`}
                        className="px-3 py-1.5 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <BarChart2 className="w-3 h-3" /> Report
                      </Link>

                      <button
                        onClick={() => handleDownloadPdf(quiz._id)}
                        className="px-3 py-1.5 bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                        title="Download PDF Analysis Report"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>

                      <button
                        onClick={() => setSharingQuiz(quiz)}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        title="Share quiz link with students"
                      >
                        <Share2 className="w-3 h-3" /> Share Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Quiz Modal */}
      {sharingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSharingQuiz(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Public Share Link</span>
              </div>
              <h2 className="text-xl font-extrabold text-white font-sinhala leading-snug">
                {sharingQuiz.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anyone with this link can join this examination. If they are not logged in, they will be automatically prompted to log in or register and then redirected straight into the quiz.
              </p>
            </div>

            {/* Quiz Info Badges */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Subject</span>
                <span className="text-xs font-bold text-slate-200 font-sinhala">
                  {(sharingQuiz.subjectId as any)?.nameSi || (sharingQuiz.subjectId as any)?.nameEn || 'General'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Duration</span>
                <span className="text-xs font-bold text-blue-400">{sharingQuiz.durationMinutes} mins</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Marks</span>
                <span className="text-xs font-bold text-emerald-400">{sharingQuiz.totalMarks}</span>
              </div>
            </div>

            {/* Copy Link Input Group */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Direct Examination URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl(sharingQuiz._id)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(sharingQuiz._id)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 whitespace-nowrap"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleWhatsAppShare(sharingQuiz)}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>

              <a
                href={getShareUrl(sharingQuiz._id)}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Preview Join Page</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
