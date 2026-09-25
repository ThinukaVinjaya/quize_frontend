import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { MathRenderer } from '../../components/MathRenderer.js';
import { Download, ArrowLeft, Users, Award, TrendingUp, CheckCircle, BarChart2, Trophy, Clock } from 'lucide-react';

export const AdminQuizReportPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [report, setReport] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/quizzes/${quizId}/report`),
      api.get(`/quizzes/${quizId}/rankings`),
    ])
      .then(([repRes, rankRes]) => {
        setReport(repRes.data.data);
        if (rankRes.data.data.snapshot) {
          setRankings(rankRes.data.data.snapshot.rankings || []);
        } else if (rankRes.data.data.rankings) {
          setRankings(rankRes.data.data.rankings || []);
        }
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleDownloadPdf = () => {
    const token = localStorage.getItem('accessToken') || '';
    window.open(`/api/admin/reports/${quizId}/pdf?token=${encodeURIComponent(token)}`, '_blank');
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Generating examination performance analytics...</span>
      </div>
    );
  }

  const { quiz, summary, provinceStats, questionStats } = report;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          to="/admin/quizzes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes List
        </Link>

        <button
          onClick={handleDownloadPdf}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
        >
          <Download className="w-4 h-4" /> Download Official PDF Report
        </button>
      </div>

      <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-3">
        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
          {quiz.subjectId?.nameEn || quiz.subjectId?.nameSi}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sinhala">
          {quiz.title} - Comprehensive Performance Report
        </h1>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Participants</span>
          <span className="text-2xl font-black text-white font-display block">
            {summary.totalParticipants}
          </span>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Score</span>
          <span className="text-2xl font-black text-blue-400 font-display block">
            {summary.averageScore}%
          </span>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Score</span>
          <span className="text-2xl font-black text-emerald-400 font-display block">
            {summary.highestScore}%
          </span>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lowest Score</span>
          <span className="text-2xl font-black text-rose-400 font-display block">
            {summary.lowestScore}%
          </span>
        </div>

        <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pass Rate (≥50%)</span>
          <span className="text-2xl font-black text-purple-400 font-display block">
            {summary.passRate}%
          </span>
        </div>
      </div>

      {/* Top Rankers Leaderboard */}
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white font-display">Island Leaderboard (Top Rankers)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">School</th>
                <th className="p-3.5">District</th>
                <th className="p-3.5">Marks</th>
                <th className="p-3.5">Percentage</th>
                <th className="p-3.5 text-right">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                    No student submissions recorded for this quiz yet.
                  </td>
                </tr>
              ) : (
                rankings.slice(0, 10).map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-black text-amber-400 font-display">#{r.rank}</td>
                    <td className="p-3.5 font-bold text-white">{r.fullName}</td>
                    <td className="p-3.5 text-slate-300 text-xs">{r.school}</td>
                    <td className="p-3.5 text-slate-400 text-xs">{r.districtName}</td>
                    <td className="p-3.5 font-bold text-slate-200">
                      {r.score} / {quiz.totalMarks}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400 font-display">{r.percentage}%</td>
                    <td className="p-3.5 text-right text-xs text-slate-400 font-mono">
                      {Math.floor(r.timeTakenSeconds / 60)}m {r.timeTakenSeconds % 60}s
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provincial Performance Table */}
      {provinceStats && provinceStats.length > 0 && (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white font-display">Provincial Performance Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-3.5">Province</th>
                  <th className="p-3.5">Participants</th>
                  <th className="p-3.5">Average Score %</th>
                  <th className="p-3.5 text-right">Pass Rate %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {provinceStats.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">{p.provinceName}</td>
                    <td className="p-3.5 text-slate-300">{p.participants}</td>
                    <td className="p-3.5 font-bold text-blue-400">{p.averageScore}%</td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">{p.passRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Question Accuracy Analytics */}
      {questionStats && questionStats.length > 0 && (
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white font-display">Question-Level Accuracy Analysis</h2>
          <div className="space-y-4">
            {questionStats.map((qs: any, idx: number) => (
              <div key={idx} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-blue-400">Question {qs.questionNumber || idx + 1}</span>
                  <span className="font-bold text-slate-300">
                    Accuracy: <strong className="text-emerald-400 font-display">{qs.accuracyRate}%</strong> ({qs.correctCount} / {qs.totalAttempts})
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-100 font-sinhala leading-relaxed">
                  <MathRenderer text={qs.questionText} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
