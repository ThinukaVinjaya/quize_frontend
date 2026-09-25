import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Quiz, Question, QuizAttemptStart } from '../../types/index.js';
import { MathRenderer } from '../../components/MathRenderer.js';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, Send, CheckCircle2, Bookmark } from 'lucide-react';
import { formatSriLankanTimePeriod, formatSriLankanClockTime } from '../../utils/sriLankanTime.js';

export const QuizExamPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttemptStart | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmittedModal, setAutoSubmittedModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [initError, setInitError] = useState<string | null>(null);

  // Initialize quiz and attempt
  useEffect(() => {
    if (!quizId) return;
    let isCancelled = false;
    setLoading(true);
    setInitError(null);

    async function initExam() {
      try {
        const [quizRes, attemptRes] = await Promise.all([
          api.get(`/quizzes/${quizId}`),
          api.post(`/quizzes/${quizId}/attempt`),
        ]);

        if (isCancelled) return;

        if (attemptRes.data.alreadyCompleted || attemptRes.data.autoSubmitted) {
          navigate(`/student/results/${attemptRes.data.resultId}`);
          return;
        }

        const attData: QuizAttemptStart = attemptRes.data.data;
        if (!attData) {
          throw new Error('Examination attempt could not be initialized.');
        }

        setQuiz(quizRes.data.data);
        setAttempt(attData);
        setSelectedAnswers(attData.savedAnswers || {});
        setTimeLeftSeconds(Math.max(1, attData.timeRemainingSeconds || 60));
      } catch (err: any) {
        if (isCancelled) return;
        const msg = err.response?.data?.message || err.message || 'Unable to load examination session.';
        setInitError(msg);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    initExam();

    return () => {
      isCancelled = true;
    };
  }, [quizId, navigate]);

  // Server-authoritative timer interval with strict quiz.endTime clamping
  useEffect(() => {
    if (!attempt || timeLeftSeconds <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (quiz?.endTime && now >= new Date(quiz.endTime).getTime()) {
        clearInterval(interval);
        setTimeLeftSeconds(0);
        handleAutoSubmit();
        return;
      }

      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, timeLeftSeconds, quiz]);

  const handleSelectOption = async (questionId: string, optionKey: string) => {
    if (submitting) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));

    try {
      const res = await api.post(`/quizzes/attempts/${attempt?.attemptId}/answer`, {
        questionId,
        selectedOption: optionKey,
      });

      if (res.data.autoSubmitted) {
        setAutoSubmittedModal(true);
        setTimeout(() => navigate(`/student/results/${res.data.resultId}`), 2200);
      }
    } catch (err) {
      console.error('Failed to autosave answer', err);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitting || !attempt) return;
    setSubmitting(true);
    setAutoSubmittedModal(true);
    try {
      const res = await api.post(`/quizzes/attempts/${attempt.attemptId}/submit`);
      const resultId = res.data?.data?.resultId || res.data?.resultId;
      setTimeout(() => navigate(`/student/results/${resultId}`), 1800);
    } catch (err: any) {
      console.error('Auto submit error', err);
      try {
        const checkRes = await api.post(`/quizzes/${quizId}/attempt`);
        if (checkRes.data?.resultId) {
          setTimeout(() => navigate(`/student/results/${checkRes.data.resultId}`), 1500);
          return;
        }
      } catch (e) {
        // fallback
      }
      setTimeout(() => navigate('/student/dashboard'), 2000);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/attempts/${attempt?.attemptId}/submit`);
      navigate(`/student/results/${res.data.data.resultId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit examination.');
      setSubmitting(false);
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Examination Notice</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sinhala">{initError}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading || !quiz || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-base text-slate-300">
            Initializing examination session...
          </span>
        </div>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">No Questions Found</h2>
          <p className="text-xs text-slate-400">මෙම ප්‍රශ්නාවලිය සඳහා ප්‍රශ්න ඇතුළත් කර නොමැත.</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion: Question = quiz.questions[currentQuestionIdx];
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftSeconds < 180; // Less than 3 minutes remaining
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Fixed Header with Timer & Closes At */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-lg text-white font-sinhala leading-tight truncate">
              {quiz.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-400 mt-0.5">
              <span>
                Q {currentQuestionIdx + 1} / {totalQuestions}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                {answeredCount} / {totalQuestions} Answered
              </span>
              {quiz.startTime && quiz.endTime && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 text-blue-300 font-mono text-[10px] sm:text-xs bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {formatSriLankanTimePeriod(quiz.startTime, quiz.endTime)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Countdown Timer & Closes At Capsule */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {quiz.endTime && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  නියමිත අවසන් වේලාව
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">
                  {formatSriLankanClockTime(quiz.endTime)}
                </span>
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-mono text-sm sm:text-xl font-extrabold border transition-all ${
                isLowTime
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse shadow-lg shadow-rose-900/30'
                  : 'bg-slate-950/80 border-slate-800 text-emerald-400 shadow-inner'
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Examination Work Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Question Panel */}
        <div className="lg:col-span-3 bg-slate-900/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-800 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-6">
            {/* Mobile Horizontal Question Strip */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/60 scrollbar-none">
              {quiz.questions.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q._id]);
                const isCurrent = idx === currentQuestionIdx;
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs flex-shrink-0 transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs pb-3 sm:pb-4 border-b border-slate-800/80">
              <span className="font-extrabold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 sm:px-3 py-1 rounded-xl uppercase tracking-wider text-[11px] sm:text-xs">
                Question {currentQuestionIdx + 1}
              </span>
              <span className="text-slate-400 font-semibold bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] sm:text-xs">
                Marks: {currentQuestion.marks || 1}
              </span>
            </div>

            {/* Question Text (Supports Sinhala Unicode & LaTeX) */}
            <div className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed font-sinhala">
              <MathRenderer text={currentQuestion.questionText} />
            </div>

            {/* Answer Options Grid */}
            <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion._id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion._id, opt.key)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex items-start gap-3 sm:gap-4 active:scale-[0.99] ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {opt.key}
                    </div>
                    <div className="text-sm sm:text-base text-slate-200 pt-0.5 leading-relaxed font-sinhala">
                      <MathRenderer text={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-800/80 flex justify-between items-center gap-2">
            <button
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQuestionIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" /> Submit Exam
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-2xl h-fit space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Question Palette</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Jump directly to any question</p>
          </div>

          {/* Time Window Strict Notice */}
          {quiz.startTime && quiz.endTime && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-2xl text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>විභාග කාල සීමාව (Time Window)</span>
              </div>
              <p className="font-mono text-white text-[11px] font-semibold">
                {formatSriLankanTimePeriod(quiz.startTime, quiz.endTime)}
              </p>
              <p className="text-[10px] text-amber-300/90 leading-tight">
                ⚠️ සෑම සිසුවෙකුම අවසන් වේලාවට ({formatSriLankanClockTime(quiz.endTime)}) පෙර පිළිතුරු භාර දිය යුතුය.
              </p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q._id]);
              const isCurrent = idx === currentQuestionIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-950 border border-slate-800" />
              <span>Unanswered ({totalQuestions - answeredCount})</span>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" /> Complete & Submit
          </button>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white font-display">Submit Examination?</h2>
              <p className="text-xs text-slate-400">
                You have answered <span className="font-bold text-emerald-400">{answeredCount}</span> out of{' '}
                <span className="font-bold text-white">{totalQuestions}</span> questions.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Submit Modal */}
      {autoSubmittedModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white font-display">Time Expired!</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your allotted time has finished. Your answers have been automatically submitted to the system. Redirecting to your performance results...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
