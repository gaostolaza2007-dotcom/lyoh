export interface DbUser {
  id: string;
  participant_code: string | null;
  email: string | null;
  password_hash: string | null;
  salt: string | null;
  account_secret?: string | null;
  nickname: string | null;
  university: string | null;
  university_short: string | null;
  career: string | null;
  role: "student" | "admin";
  onboarding_completed: number;
  xp: number;
  streak_days: number;
  longest_streak: number;
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface QuizAttemptRecord {
  id: string;
  user_id: string;
  module_id: string;
  unit_id: string;
  quiz_version: string;
  attempt_number: number;
  score: number;
  total_questions: number;
  correct_count: number;
  incorrect_topics_json: string;
  answers_summary_json: string;
  duration_seconds: number;
  submission_hash: string | null;
  created_at: string;
}

export interface AdminParticipantSummary {
  id: string;
  participant_code: string;
  nickname: string;
  university: string;
  university_short: string;
  career: string;
  created_at: string;
  last_active_at: string;
  completed_units_count: number;
  total_units_count: number;
  completed_available_units_count: number;
  total_available_units_count: number;
  historical_completed_units_count: number;
  quiz_attempts_count: number;
  first_attempt_score: number | null;
  latest_attempt_score: number | null;
  top_mistake_topics: { topic: string; count: number }[];
}

export interface AdminParticipantDetail {
  user: {
    id: string;
    participant_code: string | null;
    nickname: string | null;
    university: string | null;
    university_short: string | null;
    career: string | null;
    xp: number;
    streak_days: number;
    created_at: string;
    last_active_at: string;
  };
  unitProgress: any[];
  quizAttempts: QuizAttemptRecord[];
  activityLogs: any[];
}

export interface AdminGlobalStats {
  totalStudents: number;
  activeLast24h: number;
  totalQuizAttempts: number;
  averageQuizScore: number | null;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
}
