import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Quiz } from '../../types/index.js';
import {
  Play,
  Clock,
  CheckCircle2,
  Award,
  Calendar,
  AlertCircle,
  Sparkles,
  BookOpen,
  Share2,
  Check,
  Trophy,
  Filter,
  ArrowRight
} from 'lucide-react';
import { formatSriLankanTime, formatSriLankanTimePeriod } from '../../utils/sriLankanTime.js';

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMPLETED' | 'LIVE' | 'UPCOMING' | 'PAST'>('ALL');

  const handleCopyLink = (quizId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${quizId}`);
    setCopiedId(quizId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchQuizzes = () => {
    api
      .get('/quizzes')
      .then((res) => {
        setQuizzes(res.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId: string) => {
    navigate(`/student/quiz/${quizId}/take`);
  };

  const handleViewResult = (resultId: string) => {
    navigate(`/student/results/${resultId}`);
  };

  // Collect all completed quizzes across live and ended
  const completedQuizzes = [
    ...quizzes.live.filter((q) => q.hasAttempted && q.resultId),
    ...quizzes.ended.filter((q) => q.hasAttempted && q.resultId),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading available examinations...</span>
      </div>
    );
  }

// Live ticking countdown badge component
const LiveCountdownBadge: React.FC<{
  endTime?: string;
  initialSeconds?: number;
  onExpire?: () => void;
}> = ({ endTime, initialSeconds, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (typeof initialSeconds === 'number' && initialSeconds > 0) return initialSeconds;
    if (endTime) return Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
    return 0;
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) {
            setTimeout(onExpire, 2000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  if (secondsLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 sm:px-2.5 py-1 rounded-xl animate-pulse">
        <Clock className="w-3 h-3 text-amber-400" /> Rank Calculating...
      </span>
    );
  }

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const timeStr =
    days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : `${minutes}m ${seconds}s`;

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 sm:px-2.5 py-1 rounded-xl font-mono">
      <Clock className="w-3 h-3 text-amber-400 animate-pulse" /> Rank In: {timeStr}
    </span>
  );
};

  const renderQuizCard = (quiz: Quiz, category: 'LIVE' | 'UPCOMING' | 'ENDED') => {
    const subObj = quiz.subjectId as any;
    const subjectDisplay = subObj?.nameEn || subObj?.nameSi || 'Curriculum Assessment';

    return (
      <div
        key={quiz._id}
        onClick={() => {
          if (quiz.hasAttempted && quiz.resultId) {
            handleViewResult(quiz.resultId);
          }
        }}
        className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between group shadow-xl ${
          quiz.hasAttempted
            ? 'border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer hover:shadow-emerald-500/10'
            : category === 'UPCOMING'
            ? 'border-blue-500/30 hover:border-blue-500/50'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Header Badges */}
          <div className="flex justify-between items-start gap-2 flex-wrap">
            <span className="px-2.5 sm:px-3 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/25 text-[11px] sm:text-xs font-bold rounded-xl truncate max-w-[170px]">
              {subjectDisplay}
            </span>

            {quiz.hasAttempted ? (
              quiz.rankPublished && quiz.myIslandRank ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 sm:px-3 py-1 rounded-xl shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Rank #{quiz.myIslandRank}
                </span>
              ) : (
                <LiveCountdownBadge endTime={quiz.endTime} initialSeconds={quiz.timeRemainingSeconds} onExpire={fetchQuizzes} />
              )
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-semibold bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {quiz.durationMinutes} mins
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-base sm:text-lg leading-snug group-hover:text-blue-400 transition-colors font-sinhala line-clamp-2">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sinhala mt-1.5">
                {quiz.description}
              </p>
            )}
          </div>

          {/* If student has attempted, show their score and rank status */}
          {quiz.hasAttempted && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-emerald-500/25 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>මගේ ලකුණු (My Score):</span>
                <strong className="text-emerald-400 text-sm font-bold">
                  {quiz.myScore} / {quiz.totalMarks} ({quiz.myPercentage}%)
                </strong>
              </div>
              {quiz.rankPublished && quiz.myIslandRank ? (
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>දිවයිනේ ශ්‍රේණිගත කිරීම:</span>
                  <span className="text-amber-400 font-bold">Island Rank #{quiz.myIslandRank}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>ශ්‍රේණිගත කිරීම් නිකුත් වීමට:</span>
                  <LiveCountdownBadge endTime={quiz.endTime} initialSeconds={quiz.timeRemainingSeconds} onExpire={fetchQuizzes} />
                </div>
              )}
            </div>
          )}

          {category === 'UPCOMING' && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-500/25 space-y-1.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px] block font-semibold">🕒 විභාග කාල සීමාව (Time Period):</span>
                <strong className="text-blue-300 font-mono text-xs block">
                  {formatSriLankanTimePeriod(quiz.startTime, quiz.endTime)}
                </strong>
              </div>
              <p className="text-[10px] text-amber-300 font-sinhala leading-tight">
                ⚠️ සෑම සිසුවෙකුම මෙම කාල සීමාව තුළ පිළිතුරු සපයා භාර දිය යුතුය.
              </p>
            </div>
          )}

          {category === 'LIVE' && !quiz.hasAttempted && quiz.endTime && (
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-emerald-500/25 text-xs space-y-1">
              <div className="flex flex-col gap-0.5 text-slate-300 text-[11px]">
                <span className="text-slate-400 font-semibold">🕒 විභාග කාල සීමාව (Time Period):</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {formatSriLankanTimePeriod(quiz.startTime, quiz.endTime)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 sm:pt-5 border-t border-slate-800/80 mt-4 sm:mt-5 flex items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            Total: <span className="font-bold text-white">{quiz.totalMarks} marks</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink(quiz._id);
              }}
              className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700/60 flex-shrink-0"
              title="Copy share link to clipboard"
            >
              {copiedId === quiz._id ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>

            {quiz.hasAttempted && quiz.resultId ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewResult(quiz.resultId!);
                }}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span>ශ්‍රේණිගත කිරීම (Rank)</span>
              </button>
            ) : quiz.hasActiveAttempt ? (
              <button
                type="button"
                onClick={() => handleStartQuiz(quiz._id)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Continue Exam
              </button>
            ) : category === 'UPCOMING' ? (
              <button
                type="button"
                onClick={() => handleStartQuiz(quiz._id)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold rounded-xl text-xs border border-blue-500/30 transition-all"
              >
                <Clock className="w-3.5 h-3.5" /> විස්තර බලන්න
              </button>
            ) : category === 'LIVE' ? (
              <button
                type="button"
                onClick={() => handleStartQuiz(quiz._id)}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Exam
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStartQuiz(quiz._id)}
                className="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all"
              >
                Practice Exam
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-10 font-sans">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            National Assessment Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Test your curriculum knowledge with live timed assessments. View your evaluation, Island Rank, Province Rank, and District Rank at any time.
          </p>
        </div>
      </div>

      {/* Navigation Filter Tabs for Desktop & Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          සියලුම විභාග (All)
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'COMPLETED'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          මගේ ශ්‍රේණිගත කිරීම් ({completedQuizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('LIVE')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'LIVE'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          සජීවී ({quizzes.live.length})
        </button>

        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          ඉදිරියට නියමිත ({quizzes.upcoming.length})
        </button>

        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'PAST'
              ? 'bg-slate-700 text-white shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          පසුගිය ප්‍රශ්නාවලි ({quizzes.ended.length})
        </button>
      </div>

      {/* Tab: Completed / My Ranks */}
      {activeTab === 'COMPLETED' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                My Examination Rankings (මා සහභාගී වූ විභාග සහ ශ්‍රේණිගත කිරීම්)
              </h2>
              <p className="text-xs text-slate-400">
                Click on any examination to inspect your full score report, Island Rank, Province Rank, and District Rank.
              </p>
            </div>
          </div>

          {completedQuizzes.length === 0 ? (
            <div className="bg-slate-900/60 rounded-3xl p-8 sm:p-12 text-center text-slate-400 border border-slate-800/80 space-y-3">
              <Award className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">ඔබ මෙතෙක් කිසිදු විභාගයකට සහභාගී වී නොමැත.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                සජීවී විභාගයකට සහභාගී වී ඔබගේ සමස්ත ලංකා ශ්‍රේණිගත කිරීම (Island Rank) පරීක්ෂා කරන්න.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {completedQuizzes.map((quiz) => renderQuizCard(quiz, quiz.status === 'LIVE' ? 'LIVE' : 'ENDED'))}
            </div>
          )}
        </section>
      )}

      {/* Tab: All or Live */}
      {(activeTab === 'ALL' || activeTab === 'LIVE') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Live Examinations (සජීවී විභාග)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {quizzes.live.length} Available
            </span>
          </div>

          {quizzes.live.length === 0 ? (
            <div className="bg-slate-900/60 rounded-3xl p-8 sm:p-10 text-center text-slate-400 border border-slate-800/80 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto stroke-1" />
              <p className="text-sm font-semibold text-slate-300">No active live quizzes at this moment.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                New official curriculum examinations will appear here as soon as scheduled by the administrators.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quizzes.live.map((quiz) => renderQuizCard(quiz, 'LIVE'))}
            </div>
          )}
        </section>
      )}

      {/* Tab: All or Upcoming */}
      {(activeTab === 'ALL' || activeTab === 'UPCOMING') && quizzes.upcoming && quizzes.upcoming.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Upcoming Examinations (ඉදිරියට පැවැත්වීමට නියමිත විභාග)
                </h2>
                <p className="text-xs text-slate-400">Scheduled in Sri Lanka Standard Time (SLST / UTC+05:30)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl">
              {quizzes.upcoming.length} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quizzes.upcoming.map((quiz) => renderQuizCard(quiz, 'UPCOMING'))}
          </div>
        </section>
      )}

      {/* Tab: All or Past */}
      {(activeTab === 'ALL' || activeTab === 'PAST') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Past Examinations & Practice (පසුගිය ප්‍රශ්නාවලි)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {quizzes.ended.length} Quizzes
            </span>
          </div>

          {quizzes.ended.length === 0 ? (
            <p className="text-xs text-slate-500">No past quizzes currently archived.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quizzes.ended.map((quiz) => renderQuizCard(quiz, 'ENDED'))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
