import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { QuizResult } from '../../types/index.js';
import { MathRenderer } from '../../components/MathRenderer.js';
import { Award, Trophy, MapPin, CheckCircle2, XCircle, HelpCircle, ArrowLeft, Clock } from 'lucide-react';

export const StudentResultPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/quizzes/results/${resultId}`)
      .then((res) => setResult(res.data.data))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading || !result) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Generating examination performance report...</span>
      </div>
    );
  }

  const mins = Math.floor(result.timeTakenSeconds / 60);
  const secs = result.timeTakenSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Main Score Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
              Official Assessment Result
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sinhala pt-1">
              {result.quizId?.title || 'Examination Result'}
            </h1>
          </div>
          <div className="sm:text-right bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-display">
              {result.percentage}%
            </span>
            <span className="block text-xs text-slate-400 mt-1 font-semibold">
              {result.score} / {result.totalMarks} Marks
            </span>
          </div>
        </div>

        {/* 3 Ranks Grid: Island, Province, District */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Island Rank</span>
              <span className="text-2xl font-black text-amber-400 font-display">
                #{result.islandRank || 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Province Rank</span>
              <span className="text-2xl font-black text-blue-400 font-display">
                #{result.provinceRank || 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">District Rank</span>
              <span className="text-2xl font-black text-emerald-400 font-display">
                #{result.districtRank || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Metrics Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Correct</span>
            <span className="text-xl font-bold text-white font-display">{result.correctCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Incorrect</span>
            <span className="text-xl font-bold text-white font-display">{result.incorrectCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <HelpCircle className="w-8 h-8 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Unanswered</span>
            <span className="text-xl font-bold text-white font-display">{result.unansweredCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3.5">
          <Clock className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Time Taken</span>
            <span className="text-xl font-bold text-white font-display">
              {mins}m {secs}s
            </span>
          </div>
        </div>
      </div>

      {/* Topic-Wise Breakdown */}
      {result.topicBreakdown && result.topicBreakdown.length > 0 && (
        <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-display">Curriculum Topic Performance</h2>
              <p className="text-xs text-slate-400">Detailed performance breakdown analyzed by syllabus topics</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
              {result.topicBreakdown.length} Topics Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {result.topicBreakdown.map((t, idx) => {
              const isMastered = t.percentage >= 75;
              const isModerate = t.percentage >= 45 && t.percentage < 75;
              return (
                <div key={idx} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-100 font-sinhala text-sm block">{t.topicName}</span>
                      <div className="pt-1 flex items-center gap-1.5">
                        {isMastered ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            Mastered (ප්‍රවීණයි)
                          </span>
                        ) : isModerate ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            Moderate (මධ්‍යම)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                            Needs Focus (අවධානය අවශ්‍යයි)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-lg font-black font-display block ${
                          isMastered ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {t.percentage}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {t.correctCount} / {t.totalQuestions} Correct
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isModerate
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-pink-500'
                      }`}
                      style={{ width: `${Math.max(4, t.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question by Question Review */}
      <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white font-display">Question Review & Explanations</h2>

        <div className="space-y-4">
          {result.questionReview?.map((qr, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                qr.isCorrect
                  ? 'bg-slate-950/60 border-emerald-500/30'
                  : 'bg-slate-950/60 border-rose-500/30'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                    {qr.topicName && (
                      <span className="text-[11px] font-medium text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 font-sinhala">
                        {qr.topicName}
                      </span>
                    )}
                    {qr.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="font-medium text-slate-100 font-sinhala leading-relaxed text-base pt-1">
                    <MathRenderer text={qr.questionText} />
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 pt-2">
                    <p>
                      Your Answer:{' '}
                      <span
                        className={`font-bold ${
                          qr.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {qr.selectedOption || 'Not answered'}
                      </span>
                    </p>
                    <p>
                      Correct Answer:{' '}
                      <span className="text-emerald-400 font-bold">{qr.correctAnswer}</span>
                    </p>
                  </div>

                  {qr.explanation && (
                    <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
                      <span className="font-bold text-blue-400 block mb-1">Explanation:</span>
                      <div className="font-sinhala leading-relaxed">
                        <MathRenderer text={qr.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
