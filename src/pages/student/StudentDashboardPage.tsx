import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Quiz } from '../../types/index.js';
import { Play, Clock, CheckCircle2, Award, Calendar, AlertCircle, Sparkles, BookOpen, Share2, Check } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<{ live: Quiz[]; upcoming: Quiz[]; ended: Quiz[] }>({
    live: [],
    upcoming: [],
    ended: [],
  });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (quizId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${quizId}`);
    setCopiedId(quizId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    api
      .get('/quizzes')
      .then((res) => {
        setQuizzes(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStartQuiz = (quizId: string) => {
    navigate(`/student/quiz/${quizId}/take`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading available examinations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            National Assessment Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Test your curriculum knowledge with live timed assessments. View your instant evaluation, Island Rank, Province Rank, and District Rank upon completion.
          </p>
        </div>
      </div>

      {/* Live Scheduled Quizzes Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Live Examinations
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {quizzes.live.length} Available
          </span>
        </div>

        {quizzes.live.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-10 text-center text-slate-400 border border-slate-800/80 space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto stroke-1" />
            <p className="text-sm font-semibold text-slate-300">No active live quizzes at this moment.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              New official curriculum examinations will appear here as soon as scheduled by the administrators.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.live.map((quiz) => {
              const subObj = quiz.subjectId as any;
              const subjectDisplay = subObj?.nameEn || subObj?.nameSi || 'Curriculum Assessment';
              return (
                <div
                  key={quiz._id}
                  className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl">
                        {subjectDisplay}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {quiz.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-lg leading-snug group-hover:text-blue-400 transition-colors font-sinhala">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sinhala">
                        {quiz.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Total Marks: <span className="font-bold text-white">{quiz.totalMarks}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(quiz._id);
                        }}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700/60"
                        title="Copy share link to clipboard"
                      >
                        {copiedId === quiz._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {quiz.hasAttempted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz._id)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Start Exam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Examinations Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Past Examinations & Practice
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {quizzes.ended.length} Quizzes
          </span>
        </div>

        {quizzes.ended.length === 0 ? (
          <p className="text-xs text-slate-500">No past quizzes currently archived.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.ended.map((quiz) => {
              const subObj = quiz.subjectId as any;
              return (
                <div
                  key={quiz._id}
                  className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/60 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg">
                        {subObj?.nameEn || subObj?.nameSi || 'Curriculum'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Concluded</span>
                    </div>
                    <h3 className="font-bold text-slate-200 text-base font-sinhala">{quiz.title}</h3>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-between items-center">
                    <span className="text-xs text-slate-400">{quiz.durationMinutes} mins</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(quiz._id);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700/60"
                        title="Copy share link to clipboard"
                      >
                        {copiedId === quiz._id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all"
                      >
                        Practice Exam
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
