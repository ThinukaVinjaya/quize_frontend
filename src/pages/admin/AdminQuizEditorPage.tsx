import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Subject, Topic } from '../../types/index.js';
import { UnicodeSymbolToolbar } from '../../components/UnicodeSymbolToolbar.js';
import { Plus, Trash2, Save, ArrowLeft, HelpCircle, Calendar, Clock, CheckCircle } from 'lucide-react';
import { toSriLankanInputString, fromSriLankanInputString, formatSriLankanTimePeriod } from '../../utils/sriLankanTime.js';

interface QuestionFormItem {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  marks: number;
  explanation: string;
}

export const AdminQuizEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [topicName, setTopicName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [publishMode, setPublishMode] = useState<'LIVE' | 'SCHEDULED'>('LIVE');
  const [scheduledStartTime, setScheduledStartTime] = useState<string>(() => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    return toSriLankanInputString(d);
  });
  const [scheduledEndTime, setScheduledEndTime] = useState<string>(() => {
    const d = new Date(Date.now() + 90 * 60 * 1000);
    return toSriLankanInputString(d);
  });

  const [questions, setQuestions] = useState<QuestionFormItem[]>([
    {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      optionE: '',
      correctAnswer: 'A',
      marks: 1,
      explanation: '',
    },
  ]);

  const [focusedInput, setFocusedInput] = useState<{ qIdx: number; field: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/meta/subjects').then((res) => setSubjects(res.data.data));
  }, []);

  const selectedSubject = subjects.find((subject) =>
    [subject.nameEn, subject.nameSi, subject.code].some(
      (name) => name.toLowerCase() === subjectName.trim().toLowerCase()
    )
  );

  useEffect(() => {
    if (selectedSubject?._id) {
      api.get(`/meta/topics?subjectId=${selectedSubject._id}`).then((res) => setTopics(res.data.data));
    } else {
      setTopics([]);
      setTopicName('');
    }
  }, [selectedSubject?._id]);

  const handleInsertSymbol = (symbol: string) => {
    if (!focusedInput) return;
    const { qIdx, field } = focusedInput;
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIdx] };
      (q as any)[field] = ((q as any)[field] || '') + symbol;
      copy[qIdx] = q;
      return copy;
    });
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 1,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('A quiz must contain at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjectId = selectedSubject?._id;
    if (!subjectId) {
      alert('Please enter a valid subject name.');
      return;
    }

    const selectedTopic = topics.find((topic) =>
      [topic.nameEn, topic.nameSi].some(
        (name) => name.toLowerCase() === topicName.trim().toLowerCase()
      )
    );
    if (topicName.trim() && !selectedTopic) {
      alert('Please enter a valid topic name for the selected subject.');
      return;
    }
    const topicId = selectedTopic?._id || '';

    setSubmitting(true);
    try {
      const formattedQuestions = questions.map((q) => {
        const options = [
          { key: 'A', text: q.optionA },
          { key: 'B', text: q.optionB },
          { key: 'C', text: q.optionC },
          { key: 'D', text: q.optionD },
        ];
        if (q.optionE && q.optionE.trim()) {
          options.push({ key: 'E', text: q.optionE.trim() });
        }
        return {
          questionText: q.questionText,
          options,
          correctAnswer: q.correctAnswer,
          marks: Number(q.marks),
          explanation: q.explanation,
          topicId: topicId || undefined,
        };
      });

      await api.post('/admin/quizzes', {
        title,
        description,
        subjectId,
        topicIds: topicId ? [topicId] : [],
        questions: formattedQuestions,
        durationMinutes: Number(durationMinutes),
        instructions: description || 'Select the most accurate answer for each question.',
        publishMode,
        scheduledStartTime: fromSriLankanInputString(scheduledStartTime).toISOString(),
        scheduledEndTime: fromSriLankanInputString(scheduledEndTime).toISOString(),
      });

      if (publishMode === 'SCHEDULED') {
        alert('Quiz created and scheduled successfully in Sri Lankan Time!');
      } else {
        alert('Quiz created and published live successfully!');
      }
      navigate('/admin/quizzes');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/quizzes')}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">Create Examination</h1>
          <p className="text-xs text-slate-400">
            Write questions in Sinhala or English with full mathematical LaTeX notation ($...$)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz General Details Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. O/L Science Practice Test or විද්‍යාව ආදර්ශ ප්‍රශ්නාවලිය"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Science or විද්‍යාව"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Topic / Unit (Optional)
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Biology or ජීව විද්‍යාව"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="5"
                max="240"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Examination Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students taking this examination..."
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
            />
          </div>

          {/* Publishing Mode & Sri Lankan Time Period Scheduling */}
          <div className="pt-3 border-t border-slate-800/80 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Publishing Mode & Time Period (ප්‍රකාශන ආකාරය සහ කාල සීමාව) *
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set the exact examination time period (e.g. 11:00 PM - 12:00 AM). Every student must answer within this window.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPublishMode('LIVE');
                  const now = new Date();
                  setScheduledStartTime(toSriLankanInputString(now));
                  setScheduledEndTime(toSriLankanInputString(new Date(now.getTime() + durationMinutes * 60000)));
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  publishMode === 'LIVE'
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${publishMode === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">Publish Live Immediately</span>
                  <span className="block text-xs text-emerald-400 font-sinhala mt-0.5">දැන්ම සජීවීව පල කරන්න</span>
                  <p className="text-[11px] text-slate-400 mt-1">Quiz activates immediately for the set duration.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPublishMode('SCHEDULED');
                  const futureStart = new Date(Date.now() + 30 * 60000);
                  setScheduledStartTime(toSriLankanInputString(futureStart));
                  setScheduledEndTime(toSriLankanInputString(new Date(futureStart.getTime() + durationMinutes * 60000)));
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  publishMode === 'SCHEDULED'
                    ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${publishMode === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">Schedule Quiz Period (SLST)</span>
                  <span className="block text-xs text-blue-400 font-sinhala mt-0.5">නියමිත වේලාවකට උපලේඛනගත කරන්න</span>
                  <p className="text-[11px] text-slate-400 mt-1">Unlocks at scheduled start time and closes at end time.</p>
                </div>
              </button>
            </div>

            {/* Time Window Settings Card */}
            <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-blue-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">
                    Sri Lanka Standard Time (SLST / Asia/Colombo · UTC+05:30)
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-lg self-start sm:self-auto">
                  Live Window Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Start Date & Time (ආරම්භක වේලාව) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledStartTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScheduledStartTime(val);
                      const start = fromSriLankanInputString(val);
                      const end = new Date(start.getTime() + durationMinutes * 60000);
                      setScheduledEndTime(toSriLankanInputString(end));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    End Date & Time (අවසන් වන වේලාව) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledEndTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScheduledEndTime(val);
                      const start = fromSriLankanInputString(scheduledStartTime);
                      const end = fromSriLankanInputString(val);
                      const diffMins = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
                      setDurationMinutes(diffMins);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Duration (කාලය මිනිත්තු වලින්) *
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      required
                      value={durationMinutes}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setDurationMinutes(val);
                        const start = fromSriLankanInputString(scheduledStartTime);
                        const end = new Date(start.getTime() + val * 60000);
                        setScheduledEndTime(toSriLankanInputString(end));
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400 font-semibold">mins</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {[15, 30, 45, 60, 90, 120].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setDurationMinutes(m);
                          const start = fromSriLankanInputString(scheduledStartTime);
                          const end = new Date(start.getTime() + m * 60000);
                          setScheduledEndTime(toSriLankanInputString(end));
                        }}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
                          durationMinutes === m
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time Period Live Preview Card */}
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-blue-300 block">
                        විභාග කාල සීමාව (Official Examination Period):
                      </span>
                      <strong className="text-xs sm:text-sm text-white font-mono block">
                        {formatSriLankanTimePeriod(
                          fromSriLankanInputString(scheduledStartTime),
                          fromSriLankanInputString(scheduledEndTime)
                        )}
                      </strong>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-bold font-mono self-start sm:self-auto">
                    {durationMinutes} Minutes Window
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-sinhala leading-relaxed">
                  ⚠️ සෑම සිසුවෙකුම මෙම කාල සීමාව තුළ ප්‍රශ්නාවලියට පිළිතුරු සපයා භාර දිය යුතුය. නියමිත අවසන් වේලාව පැමිණි පසු විභාගය ස්වයංක්‍රීයව අවසන් වී නිල ශ්‍රේණිගත කිරීම් ගණනය කෙරේ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toolbar for quick symbols */}
        <div className="sticky top-20 z-30">
          <UnicodeSymbolToolbar onInsertSymbol={handleInsertSymbol} />
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white font-display">
              Examination Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Add Question
            </button>
          </div>

          {questions.map((q, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="font-extrabold text-blue-400 text-xs uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                  Question {idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove this question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Question Text (Sinhala Unicode or English) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={q.questionText}
                  onFocus={() => setFocusedInput({ qIdx: idx, field: 'questionText' })}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuestions((prev) => {
                      const copy = [...prev];
                      copy[idx].questionText = val;
                      return copy;
                    });
                  }}
                  placeholder="ප්‍රශ්නය මෙහි සටහන් කරන්න... (For math use $x = \\frac{a}{b}$)"
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala leading-relaxed"
                />
              </div>

              {/* Options A, B, C, D, E */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const fieldName = `option${key}` as keyof QuestionFormItem;
                  return (
                    <div key={key}>
                      <label className="block text-xs font-bold text-slate-400 mb-1">
                        Option {key} *
                      </label>
                      <input
                        type="text"
                        required
                        value={q[fieldName] as string}
                        onFocus={() => setFocusedInput({ qIdx: idx, field: fieldName })}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestions((prev) => {
                            const copy = [...prev];
                            (copy[idx] as any)[fieldName] = val;
                            return copy;
                          });
                        }}
                        placeholder={`Option ${key} text / පිළිතුර`}
                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
                      />
                    </div>
                  );
                })}

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Option E (Optional / A/L 5-Choice Exam)
                  </label>
                  <input
                    type="text"
                    value={q.optionE || ''}
                    onFocus={() => setFocusedInput({ qIdx: idx, field: 'optionE' })}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuestions((prev) => {
                        const copy = [...prev];
                        copy[idx].optionE = val;
                        return copy;
                      });
                    }}
                    placeholder="Option E text (optional for 5-choice papers)"
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
                  />
                </div>
              </div>

              {/* Correct answer & marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Correct Answer *
                  </label>
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setQuestions((prev) => {
                        const copy = [...prev];
                        copy[idx].correctAnswer = val;
                        return copy;
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                    <option value="E">Option E</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={q.marks}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setQuestions((prev) => {
                        const copy = [...prev];
                        copy[idx].marks = val;
                        return copy;
                      });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Explanation / Solution (Optional)
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onFocus={() => setFocusedInput({ qIdx: idx, field: 'explanation' })}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuestions((prev) => {
                      const copy = [...prev];
                      copy[idx].explanation = val;
                      return copy;
                    });
                  }}
                  placeholder="Solution steps or reference..."
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-sinhala"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 text-slate-300 hover:text-white font-bold rounded-3xl text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5 text-emerald-400" /> Add Another Question
          </button>
        </div>

        {/* Submit Bar */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-5 h-5" />
            {submitting ? 'Publishing Examination...' : 'Save & Publish Examination'}
          </button>
        </div>
      </form>
    </div>
  );
};
