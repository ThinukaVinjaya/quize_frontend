export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  fullName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  school: string;
  grade?: number;
  provinceId: string;
  districtId: string;
  provinceName?: string;
  districtName?: string;
  isEmailVerified?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  otp?: string;
  school: string;
  grade?: number;
  provinceId: string;
  districtId: string;
}

export interface Subject {
  _id: string;
  nameEn: string;
  nameSi: string;
  code: string;
}

export interface Topic {
  _id: string;
  subjectId: string;
  nameEn: string;
  nameSi: string;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  _id: string;
  subjectId?: string;
  topicId?: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswer?: string;
  marks?: number;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export type QuizStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'ARCHIVED';

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subjectId: Subject | string;
  topicIds?: string[];
  questions: Question[];
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  instructions?: string;
  status: QuizStatus;
  isLateQuiz?: boolean;
  hasAttempted?: boolean;
}

export interface QuizAttemptStart {
  attemptId: string;
  quizId: string;
  serverTime: string;
  startTime: string;
  expectedEndTime: string;
  timeRemainingSeconds: number;
  savedAnswers: Record<string, string>;
}

export interface QuizResult {
  _id: string;
  attemptId: string;
  quizId: Quiz;
  studentId: string;
  provinceId: string;
  districtId: string;
  provinceName?: string;
  districtName?: string;
  totalMarks: number;
  score: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  timeTakenSeconds: number;
  islandRank: number;
  provinceRank: number;
  districtRank: number;
  isLateAttempt: boolean;
  topicBreakdown: Array<{
    topicId: string;
    topicName: string;
    totalQuestions: number;
    correctCount: number;
    percentage: number;
  }>;
  questionReview?: Array<{
    questionId: string;
    topicName?: string;
    questionText: string;
    options: QuestionOption[];
    correctAnswer: string;
    selectedOption?: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface ParsedQuestionItem {
  questionNumber: number;
  topicName?: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  marks: number;
  explanation: string;
  errors: string[];
}

export interface PdfImport {
  _id: string;
  filename: string;
  subjectName?: string;
  topicName?: string;
  parsedQuestions: ParsedQuestionItem[];
  validationErrors: string[];
  status: 'PARSED' | 'REVIEWED' | 'PUBLISHED';
}
