export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatarUrl: string;
  streak: number;
  solvedCount: number;
  joinDate: string;
  status: 'active' | 'pending';
}

export interface Resource {
  name: string;
  url: string;
}

export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  topic: string;
  pattern: string;
  difficulty: Difficulty;
  deadline: string; // ISO date or plain text
  resources: Resource[];
  starterCode: Record<string, string>; // Language -> starter code string
  testCases: TestCase[];
  companyTags: string[];
  publishedAt: string;
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
  submittedAt: string;
  runtime: string;
  memory: string;
  explanation: string; // The user's description of their approach
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category: 'important' | 'general' | 'resource';
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'challenge' | 'announcement' | 'approval';
  createdAt: string;
  read: boolean;
}

export interface Contribution {
  id: string;
  userId: string;
  userName: string;
  topic: string;
  title: string;
  videoUrl: string;
  description: string;
  createdAt: string;
}
