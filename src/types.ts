// ============================================================
// PrepForge Quiz Platform — Type Definitions
// ============================================================

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuizType = 'practice' | 'weekly' | 'monthly' | 'placement';
export type QuizStatus = 'draft' | 'published';
export type AttemptStatus = 'in_progress' | 'submitted';
export type BadgeType =
  | 'weekly_winner' | 'monthly_winner' | 'top_performer'
  | 'fastest_solver' | 'accuracy_king' | 'consistency_master'
  | 'streak_7' | 'streak_30' | 'perfect_score' | 'problem_crusher'
  | 'placement_ready' | 'ai_learner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  department: string;
  year: string;
  avatarUrl: string;
  streak: number;
  totalScore: number;
  accuracy: number;
  badges: BadgeType[];
  joinDate: string;
  status: 'active' | 'pending';
}

export interface QuizOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: QuizOption[];
  correct_answer: string;
  difficulty: Difficulty;
  subject: string;
  topic: string;
  weightage: number;
  position: number;
}

// Question as returned during quiz-taking (correct answer hidden from student)
export interface QuestionForStudent extends Omit<Question, 'correct_answer'> {}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  time_limit: number; // minutes
  start_time: string | null;
  end_time: string | null;
  marks_per_question: number;
  negative_marks: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  max_attempts: number;
  quiz_type: QuizType;
  subject: string;
  status: QuizStatus;
  created_by: string;
  creator_name?: string;
  created_at: string;
  question_count?: number;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_name?: string;
  user_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number;
  total_marks: number;
  accuracy: number;
  time_taken: number; // seconds
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  status: AttemptStatus;
  question_order: string[];
}

export interface QuestionResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: string | null;
  is_correct: boolean;
  marks_awarded: number;
  time_spent: number;
  flagged_for_review: boolean;
  answered_at: string | null;
  // Joined fields for results page
  question_text?: string;
  options?: QuizOption[];
  correct_answer?: string;
  difficulty?: Difficulty;
  subject?: string;
  topic?: string;
}

export interface AIExplanation {
  question_id: string;
  why_correct: string;
  why_options_wrong: Record<string, string>;
  interview_concepts: string;
  short_explanation: string;
  reference_topic: string;
  interview_frequency: 'High' | 'Medium' | 'Low';
  memory_trick: string | null;
  generated_at?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  department: string;
  year: string;
  avatarUrl: string;
  streak: number;
  accuracy: number;
  badges: BadgeType[];
  totalScore: number;
  attemptCount: number;
  avgTimeTaken: number;
  rank: number;
}

export interface SubjectPerformance {
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface AttemptTrend {
  date: string;
  quizName: string;
  score: number;
  totalMarks: number;
  accuracy: number;
}

export interface StudentAnalytics {
  subjectPerformance: SubjectPerformance[];
  topicPerformance: TopicPerformance[];
  trend: AttemptTrend[];
  strongSubjects: string[];
  weakSubjects: string[];
}

export interface AdminAnalytics {
  totalStudents: number;
  totalQuizzes: number;
  totalAttempts: number;
  avgScorePct: number;
  mostMissedQuestions: Array<{
    question_text: string;
    subject: string;
    topic: string;
    attempts: number;
    correct: number;
    accuracy_pct: number;
  }>;
  subjectPerformance: Array<{
    subject: string;
    total_responses: number;
    correct_count: number;
    accuracy_pct: number;
  }>;
  topPerformers: Array<{
    id: string;
    name: string;
    avatarUrl: string;
    totalScore: number;
    accuracy: number;
    streak: number;
    quizzesTaken: number;
  }>;
  quizStats: Array<{
    id: string;
    name: string;
    subject: string;
    participants: number;
    avg_pct: number;
    avg_time: number;
  }>;
}

export interface StudyCoach {
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  topicsToStudy: string[];
  recommendedPractice: string[];
  estimatedStudyHours: number;
  placementReadiness: 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced' | 'Ready';
  placementReadinessPct: number;
  weeklyPlan: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'quiz' | 'result' | 'badge' | 'approval' | 'leaderboard' | 'general';
  createdAt: string;
  read: boolean;
}

// For parsed questions from AI (before saving)
export interface ParsedQuestion {
  questionText: string;
  options: QuizOption[];
  correctAnswer: string;
  difficulty: Difficulty;
  subject: string;
  topic: string;
}

// Quiz creation form data
export interface QuizFormData {
  name: string;
  description: string;
  timeLimit: number;
  startTime: string;
  endTime: string;
  marksPerQuestion: number;
  negativeMarks: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
  quizType: QuizType;
  subject: string;
  questions: ParsedQuestion[];
}
