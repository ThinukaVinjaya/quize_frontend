import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle2, Award, AlertCircle, BookOpen, Target, Sparkles } from 'lucide-react';

interface TopicPerf {
  topicName: string;
  totalQuestions?: number;
  correctCount?: number;
  quizzesCount?: number;
  averagePercentage: number;
}

export const StudentAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/monthly-report').then((res) => res.data.data),
      api.get('/student/performance').then((res) => res.data.data).catch(() => null),
    ])
      .then(([monthly, perf]) => {
        setData(monthly);
        setPerformanceData(perf);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading student performance analytics...</span>
      </div>
    );
  }

  const topicPerformance: TopicPerf[] = performanceData?.topicPerformance || [];
  const strongTopics = topicPerformance.filter((t) => t.averagePercentage >= 75);
  const weakTopics = topicPerformance.filter((t) => t.averagePercentage < 50);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          Performance & Topic Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Historical overview of your assessment progression and curriculum topic-by-topic mastery
        </p>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Available Quizzes
          </span>
          <span className="text-3xl font-black text-white font-display">
            {data.summary.availableQuizzes}
          </span>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Completed Quizzes
          </span>
          <span className="text-3xl font-black text-blue-400 font-display">
            {data.summary.attendedQuizzes}
          </span>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Missed Quizzes
          </span>
          <span className="text-3xl font-black text-amber-400 font-display">
            {data.summary.missedQuizzes}
          </span>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Average Score
          </span>
          <span className="text-3xl font-black text-emerald-400 font-display">
            {data.summary.averageScore}%
          </span>
        </div>
      </div>

      {/* Topic-Based Analysis Section */}
      <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Curriculum Topic Mastery & Breakdown
              </h2>
              <p className="text-xs text-slate-400">
                Detailed accuracy analysis evaluated across all individual quiz topics
              </p>
            </div>
          </div>
          {topicPerformance.length > 0 && (
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 self-start sm:self-auto">
              {topicPerformance.length} Topics Evaluated
            </span>
          )}
        </div>

        {topicPerformance.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800/80">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">Complete examination quizzes with multiple topics to generate topic analysis.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Insights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider block">
                    Mastered Topics ({strongTopics.length})
                  </span>
                  <span className="text-sm font-bold text-emerald-300 font-sinhala">
                    {strongTopics.length > 0
                      ? strongTopics.map((t) => t.topicName).join(', ')
                      : 'Keep practicing to master topics!'}
                  </span>
                </div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-rose-300/80 font-bold uppercase tracking-wider block">
                    Focus Needed ({weakTopics.length})
                  </span>
                  <span className="text-sm font-bold text-rose-300 font-sinhala">
                    {weakTopics.length > 0
                      ? weakTopics.map((t) => t.topicName).join(', ')
                      : 'Great job! No weak topics detected.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Topic Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicPerformance.map((t, idx) => {
                const isMastered = t.averagePercentage >= 75;
                const isModerate = t.averagePercentage >= 45 && t.averagePercentage < 75;

                return (
                  <div
                    key={idx}
                    className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-100 font-sinhala text-sm block">
                          {t.topicName}
                        </span>
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
                            isMastered
                              ? 'text-emerald-400'
                              : isModerate
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {t.averagePercentage}%
                        </span>
                        {t.totalQuestions !== undefined && (
                          <span className="text-[11px] text-slate-400">
                            {t.correctCount} / {t.totalQuestions} Questions Correct
                          </span>
                        )}
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
                        style={{ width: `${Math.max(4, t.averagePercentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Score Trend Line Chart */}
      <div className="bg-slate-900/70 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white font-display">Score Progression Trajectory</h2>
        </div>

        {data.scoreTrend.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800/80">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No examination history available to plot trend line yet.</p>
          </div>
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6' }}
                  name="Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
