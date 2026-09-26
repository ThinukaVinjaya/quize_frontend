import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { PdfImport, ParsedQuestionItem } from '../../types/index.js';
import { MathRenderer } from '../../components/MathRenderer.js';
import { UnicodeSymbolToolbar } from '../../components/UnicodeSymbolToolbar.js';
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowRight,
  Save,
  Sparkles,
  Copy,
  Check,
  FileCode,
  Info,
  Download,
  Layers,
  Target,
  Clock,
  Type,
  Calendar
} from 'lucide-react';
import { toSriLankanInputString, fromSriLankanInputString, formatSriLankanTimePeriod } from '../../utils/sriLankanTime.js';

export const AdminPdfImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [importMode, setImportMode] = useState<'text' | 'pdf'>('text');
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfImport, setPdfImport] = useState<PdfImport | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<ParsedQuestionItem[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedFont, setSelectedFont] = useState<'noto-regular' | 'noto-bold' | 'arial'>('noto-regular');
  const [activeTab, setActiveTab] = useState<'multi-topic' | 'sinhala' | 'english' | 'math'>('multi-topic');
  const [copied, setCopied] = useState(false);
  const [publishMode, setPublishMode] = useState<'LIVE' | 'SCHEDULED'>('LIVE');
  const [scheduledStartTime, setScheduledStartTime] = useState<string>(() => {
    return toSriLankanInputString(new Date());
  });
  const [scheduledEndTime, setScheduledEndTime] = useState<string>(() => {
    return toSriLankanInputString(new Date(Date.now() + 30 * 60 * 1000));
  });

  const getFontClass = () => {
    switch (selectedFont) {
      case 'noto-bold':
        return 'font-sinhala-bold font-bold';
      case 'arial':
        return 'font-sinhala-arial';
      case 'noto-regular':
      default:
        return 'font-sinhala-regular font-normal';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await api.post('/admin/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data: PdfImport = res.data.data;
      setPdfImport(data);
      const questionsList = data.parsedQuestions || [];
      setEditingQuestions(questionsList);
      const calculatedDuration = questionsList.length > 0 ? Math.max(15, Math.ceil(questionsList.length * 1.5)) : 30;
      setDurationMinutes(calculatedDuration);
      const now = new Date();
      setScheduledStartTime(toSriLankanInputString(now));
      setScheduledEndTime(toSriLankanInputString(new Date(now.getTime() + calculatedDuration * 60000)));
      setQuizTitle(
        `${data.subjectName || 'Science'} - ${data.topicName || 'Model Examination'}`
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to parse PDF document.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      alert('කරුණාකර ප්‍රශ්න ඇතුළත් කරන්න (Please paste question text).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/admin/pdf/text', { text: rawText });
      const data: PdfImport = res.data.data;
      setPdfImport(data);
      const questionsList = data.parsedQuestions || [];
      setEditingQuestions(questionsList);
      const calculatedDuration = questionsList.length > 0 ? Math.max(15, Math.ceil(questionsList.length * 1.5)) : 30;
      setDurationMinutes(calculatedDuration);
      const now = new Date();
      setScheduledStartTime(toSriLankanInputString(now));
      setScheduledEndTime(toSriLankanInputString(new Date(now.getTime() + calculatedDuration * 60000)));
      setQuizTitle(
        `${data.subjectName || 'විද්‍යාව'} - ${data.topicName || 'ආදර්ශ පරීක්ෂණය'}`
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to parse questions text.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsertSymbolToText = (symbol: string) => {
    setRawText((prev) => prev + symbol);
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setEditingQuestions((prev) => {
      const copy = [...prev];
      (copy[idx] as any)[field] = value;
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, optKey: string, value: string) => {
    setEditingQuestions((prev) => {
      const copy = [...prev];
      const options = copy[qIdx].options.map((opt) => (opt.key === optKey ? { ...opt, text: value } : opt));
      copy[qIdx] = { ...copy[qIdx], options };
      return copy;
    });
  };

  const handlePublishAsQuiz = async () => {
    if (!pdfImport) return;
    const finalDuration = parseInt(String(durationMinutes), 10);
    if (isNaN(finalDuration) || finalDuration <= 0) {
      alert('කරුණාකර වලංගු විභාග කාල සීමාවක් මිනිත්තු වලින් ඇතුළත් කරන්න (Please enter a valid quiz duration in minutes).');
      return;
    }

    try {
      // First save edited questions
      await api.put(`/admin/pdf/${pdfImport._id}/questions`, {
        subjectName: pdfImport.subjectName,
        topicName: pdfImport.topicName,
        parsedQuestions: editingQuestions,
      });

      // Convert to quiz with user-adjusted duration & Sri Lankan scheduling options
      await api.post(`/admin/pdf/${pdfImport._id}/publish-quiz`, {
        title: quizTitle,
        durationMinutes: finalDuration,
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
      alert(err.response?.data?.message || 'Failed to publish examination.');
    }
  };

  const sampleTemplates = {
    'multi-topic': `SUBJECT: විද්‍යාව (General Science)

TOPIC: ජීව විද්‍යාව (Biology)

ප්‍රශ්නය 1: ශාක වල ප්‍රභාසංශ්ලේෂණය සඳහා අත්‍යවශ්‍ය වන වායුව කුමක්ද?
A: ඔක්සිජන් (O2)
B: කාබන් ඩයොක්සයිඩ් (CO2)
C: නයිට්‍රජන් (N2)
D: හයිඩ්‍රජන් (H2)
CORRECT: B
EXPLANATION: ප්‍රභාසංශ්ලේෂණය සඳහා ශාක පත්‍ර වායුගෝලයේ ඇති කාබන් ඩයොක්සයිඩ් වායුව උරා ගනී.

ප්‍රශ්නය 2: මිනිස් සිරුරේ විශාලතම අභ්‍යන්තර අවයවය කුමක්ද?
A: හදවත
B: පෙනහළු
C: අක්මාව
D: වකුගඩුව
CORRECT: C

TOPIC: භෞතික විද්‍යාව (Physics)

QUESTION 3: What is the standard SI unit of electric current?
A: Volt
B: Ampere
C: Ohm
D: Watt
CORRECT: B

QUESTION 4: What is the approximate acceleration due to gravity on the Earth's surface?
A: 9.8 m/s²
B: 3.0 × 10⁸ m/s
C: 6.67 × 10⁻¹¹ N
D: 1.6 × 10⁻¹⁹ C
CORRECT: A

TOPIC: රසායන විද්‍යාව (Chemistry)

ප්‍රශ්නය 5: ජල අණුවේ රසායනික සූත්‍රය කුමක්ද?
A: H2O
B: CO2
C: NaCl
D: CH4
CORRECT: A`,

    sinhala: `SUBJECT: විද්‍යාව
TOPIC: ජීව විද්‍යාව

ප්‍රශ්නය 1: ශාක වල ප්‍රභාසංශ්ලේෂණය සඳහා අත්‍යවශ්‍ය වන වායුව කුමක්ද?
A: ඔක්සිජන් (O2)
B: කාබන් ඩයොක්සයිඩ් (CO2)
C: නයිට්‍රජන් (N2)
D: හයිඩ්‍රජන් (H2)
CORRECT: B

ප්‍රශ්නය 2: මිනිස් සිරුරේ විශාලතම අභ්‍යන්තර අවයවය කුමක්ද?
A: හදවත
B: පෙනහළු
C: අක්මාව
D: වකුගඩුව
CORRECT: C`,

    english: `SUBJECT: Science
TOPIC: Physics

QUESTION 1: What is the standard SI unit of electric current?
A: Volt
B: Ampere
C: Ohm
D: Watt
CORRECT: B

QUESTION 2: What is the approximate acceleration due to gravity on the Earth's surface?
A: 9.8 m/s²
B: 3.0 × 10⁸ m/s
C: 6.67 × 10⁻¹¹ N
D: 1.6 × 10⁻¹⁹ C
CORRECT: A`,

    math: `SUBJECT: Mathematics
TOPIC: Algebra & Geometry

QUESTION 1: If 2x + 5 = 15, what is the value of x?
A: 4
B: 5
C: 6
D: 10
CORRECT: B

QUESTION 2: What is the formula for the area of a circle with radius r?
A: 2πr
B: πr²
C: 4/3 πr³
D: 2πr²
CORRECT: B`
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleTemplates[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleTemplates[activeTab]], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_quiz_template.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          PDF Examination Question Import
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload curriculum test papers to extract, verify, and publish Sinhala and English multiple choice questions with multi-topic support
        </p>
      </div>

      {/* Mode Selector & Input Area */}
      {!pdfImport && (
        <>
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setImportMode('text')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  importMode === 'text'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-300" />
                <span>Direct Text / Word Paste (පෙළ කෙලින්ම Paste කරන්න)</span>
                <span className="hidden md:inline px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">
                  100% Clean Sinhala
                </span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('pdf')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  importMode === 'pdf'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-blue-300" />
                <span>Upload PDF Document (PDF ගොනුව)</span>
                <span className="px-2 py-0.5 bg-blue-400/20 text-blue-300 text-[10px] rounded-full border border-blue-400/30 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Gemini AI
                </span>
              </button>
            </div>

            {/* Direct Text Paste Mode */}
            {importMode === 'text' && (
              <form onSubmit={handleTextParse} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Paste Examination Questions Text
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Copy questions straight from Microsoft Word or Google Docs. Unicode Sinhala letters, kombuwa (ෙ), and signs remain 100% preserved.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRawText(sampleTemplates['multi-topic'])}
                    className="self-start sm:self-auto px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Load Sample Sinhala Quiz
                  </button>
                </div>

                {/* Unicode Symbol Toolbar */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Sinhala Diacritics & Math Symbols Quick Inserter:
                  </span>
                  <UnicodeSymbolToolbar onInsertSymbol={handleInsertSymbolToText} />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Question Text & Multi-Topic Structure:
                  </label>
                  <textarea
                    rows={12}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="SUBJECT: විද්‍යාව&#10;&#10;TOPIC: ජීව විද්‍යාව&#10;&#10;ප්‍රශ්නය 1: ශාක වල ප්‍රභාසංශ්ලේෂණය සඳහා අත්‍යවශ්‍ය වන වායුව කුමක්ද?&#10;A: ඔක්සිජන් (O2)&#10;B: කාබන් ඩයොක්සයිඩ් (CO2)&#10;C: නයිට්‍රජන් (N2)&#10;D: හයිඩ්‍රජන් (H2)&#10;CORRECT: B&#10;EXPLANATION: ප්‍රභාසංශ්ලේෂණය සඳහා කාබන් ඩයොක්සයිඩ් අවශ්‍ය වේ.&#10;&#10;TOPIC: භෞතික විද්‍යාව&#10;QUESTION 2: ..."
                    className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-xs sm:text-sm font-sinhala font-mono leading-relaxed focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/60 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !rawText.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Parsing & Normalizing Sinhala Text...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      Extract & Verify Questions (ප්‍රශ්න කියවන්න)
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Upload PDF Mode */}
            {importMode === 'pdf' && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Powered by Google Gemini Multimodal AI
                  </div>
                  <h2 className="text-lg font-bold text-white">Choose Examination PDF Document</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload any examination PDF paper. Google Gemini AI reads Sinhala fonts (both modern Unicode & FM-Abhaya), cleans complex ligatures (kombuwa, bandi akuru), and extracts questions with 100% accuracy.
                  </p>
                </div>

                <form onSubmit={handleUploadAndParse} className="max-w-sm mx-auto space-y-4">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer cursor-pointer bg-slate-950/60 p-2 rounded-2xl border border-slate-800"
                  />

                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Gemini AI Extracting Sinhala Questions...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Upload & Extract via Gemini AI
                      </span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Interactive PDF Template Guide */}
          <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-display">PDF Question Format Template</h3>
                  <p className="text-xs text-slate-400">Copy or download this format to prepare your paper before saving as PDF</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
                  title="Download template as text file"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download .TXT</span>
                </button>
                <button
                  onClick={handleCopyTemplate}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('multi-topic')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'multi-topic'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Multi-Topic Exam (බහු-මාතෘකා ආකෘතිය)
              </button>
              <button
                onClick={() => setActiveTab('sinhala')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'sinhala'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                සිංහල තනි මාතෘකාව (Sinhala)
              </button>
              <button
                onClick={() => setActiveTab('english')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'english'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                English Template
              </button>
              <button
                onClick={() => setActiveTab('math')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'math'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Math & Formulas (x², π)
              </button>
            </div>

            {/* Code / Text Block */}
            <div className="relative">
              <pre className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre font-sinhala">
                {sampleTemplates[activeTab]}
              </pre>
            </div>

            {/* Key Formatting Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-[11px] text-slate-400">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-1">
                <span className="font-bold text-slate-300 block flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-emerald-400" /> Supported Sinhala Fonts
                </span>
                <span>Fully supports <strong>Noto Sans Sinhala (Regular & Bold)</strong>, <strong>Arial</strong>, Iskoola Pota, and FM-Abhaya with Unicode auto-recovery.</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-1">
                <span className="font-bold text-slate-300 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> 1. Multiple Topics
                </span>
                <span>Place <code>TOPIC: Name</code> or <code>මාතෘකාව: නම</code> above question block to group by curriculum.</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-1">
                <span className="font-bold text-slate-300 block">2. Questions & Options</span>
                <span>Use <code>QUESTION 1:</code> or <code>ප්‍රශ්නය 1:</code> with <code>A:</code>, <code>B:</code>, <code>C:</code>, <code>D:</code> or <code>1-4</code>.</span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-1">
                <span className="font-bold text-slate-300 block">3. Correct Answer Key</span>
                <span>Use <code>CORRECT: A</code> (or <code>නිවැරදි: 1</code>) and optional <code>EXPLANATION: text</code>.</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Question Verification & Publishing View */}
      {pdfImport && (
        <div className="space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Parsing Completed
                  </span>
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Gemini AI Powered
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white font-display mt-2">
                  Verify Extracted Questions ({editingQuestions.length})
                </h2>
              </div>
              <button
                onClick={() => setPdfImport(null)}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
              >
                Upload Different PDF
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm font-semibold ${getFontClass()}`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Quiz Time (Minutes) *
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {editingQuestions.length > 0
                      ? `~${(durationMinutes / editingQuestions.length).toFixed(1)}m / Q`
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                    className="w-20 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm font-bold text-center focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setDurationMinutes(mins);
                          const start = fromSriLankanInputString(scheduledStartTime);
                          const end = new Date(start.getTime() + mins * 60000);
                          setScheduledEndTime(toSriLankanInputString(end));
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          durationMinutes === mins
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sinhala Font Preview Selector */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">
                  Sinhala Font Display:
                </span>
                <span className="text-[11px] text-slate-400">
                  (Toggle font to preview extracted text)
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedFont('noto-regular')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedFont === 'noto-regular'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Noto Sans Sinhala Regular
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFont('noto-bold')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedFont === 'noto-bold'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Noto Sans Sinhala Bold
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFont('arial')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedFont === 'arial'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Arial (Sinhala)
                </button>
              </div>
            </div>
          </div>

          {/* Detected Topics Summary */}
          {editingQuestions.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-300">
                  Identified Quiz Topics ({Array.from(new Set(editingQuestions.map((q) => q.topicName || 'සාමාන්‍ය').filter(Boolean))).length}):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from(new Set(editingQuestions.map((q) => q.topicName || 'සාමාන්‍ය').filter(Boolean))).map((topic, i) => (
                  <span key={i} className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg font-sinhala">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {editingQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                      Question {q.questionNumber || idx + 1}
                    </span>
                    {q.topicName && (
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-sinhala">
                        {q.topicName}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">
                    Correct: <strong className="text-emerald-400">{q.correctAnswer}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Curriculum Topic (මාතෘකාව) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ජීව විද්‍යාව / Biology"
                      value={q.topicName || ''}
                      onChange={(e) => handleQuestionChange(idx, 'topicName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-xs font-sinhala font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Explanation (පැහැදිලි කිරීම)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional explanation shown to students after submission"
                      value={q.explanation || ''}
                      onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-xs font-sinhala"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Question Text</label>
                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-sm leading-relaxed ${getFontClass()}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <div key={opt.key}>
                      <label className="block text-[11px] font-bold text-slate-400 mb-0.5">
                        Option {opt.key}
                      </label>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, opt.key, e.target.value)}
                        className={`w-full px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-xs ${getFontClass()}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Correct Answer
                    </label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-xs font-bold"
                    >
                      {q.options && q.options.length > 0 ? (
                        q.options.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            Option {opt.key}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                          <option value="E">Option E</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">
                      Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={q.marks || 1}
                      onChange={(e) => handleQuestionChange(idx, 'marks', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pre-Publish Quiz Timing Adjustment & Time Period Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 rounded-3xl p-6 sm:p-8 border border-blue-500/20 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">
                    Publishing Mode & Time Period (ප්‍රකාශන ආකාරය සහ කාල සීමාව) *
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set the exact examination time period (e.g. 11:00 PM - 12:00 AM). Every student must answer within this window.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  Total Questions: <strong className="text-emerald-400">{editingQuestions.length}</strong>
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  Total Marks: <strong className="text-amber-400">{editingQuestions.reduce((a, q) => a + (q.marks || 1), 0)}</strong>
                </span>
              </div>
            </div>

            {/* Publishing Mode Buttons */}
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
                  <p className="text-[11px] text-slate-400 mt-1">Quiz activates immediately for the set duration window.</p>
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
                  {publishMode === 'LIVE' ? 'Live Window Active' : 'Scheduled Window'}
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
                <p className="text-[10px] text-slate-400">
                  සියලුම සිසුන් මෙම කාල සීමාව තුළදී පමණක් ප්‍රශ්නාවලියට පිළිතුරු සැපයිය යුතුය. නියමිත අවසන් වේලාවට පෙර ප්‍රශ්නාවලිය ස්වයංක්‍රීයව භාර ගැනේ.
                </p>
              </div>

              {/* Supplementary details */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>⏱️ Allocated Quiz Time:</span>
                  <span className="font-bold text-blue-400">{durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>📝 Average Time Per Question:</span>
                  <span className="font-bold text-emerald-400">
                    {editingQuestions.length > 0
                      ? `${(durationMinutes / editingQuestions.length).toFixed(1)} Minutes`
                      : '0 Minutes'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>🔤 Active Sinhala Font Preview:</span>
                  <span className="font-bold text-amber-300">
                    {selectedFont === 'noto-bold'
                      ? 'Noto Sans Sinhala Bold'
                      : selectedFont === 'arial'
                      ? 'Arial (Sinhala)'
                      : 'Noto Sans Sinhala Regular'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePublishAsQuiz}
                className={`w-full py-4 text-white font-extrabold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${
                  publishMode === 'SCHEDULED'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25'
                }`}
              >
                <Save className="w-5 h-5" />
                {publishMode === 'SCHEDULED'
                  ? `Schedule Quiz for Sri Lankan Time (${durationMinutes} Mins · ${editingQuestions.length} Questions)`
                  : `Publish Examination as Live Quiz (${durationMinutes} Mins · ${editingQuestions.length} Questions)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
