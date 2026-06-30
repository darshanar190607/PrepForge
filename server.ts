// tsx already injects .env vars — dotenv is only needed as a fallback
import * as dotenv from 'dotenv';
dotenv.config(); // loads .env from cwd if not already loaded

import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db/client';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'prepforge_super_secret_jwt_key';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface AuthenticatedRequest extends Request {
  user?: { id: string; role: 'admin' | 'student' };
}

// -------------------------------------------------------
// Middleware
// -------------------------------------------------------
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) { res.status(401).json({ error: 'Access token required' }); return; }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) { res.status(403).json({ error: 'Invalid or expired token' }); return; }
    req.user = decoded as { id: string; role: 'admin' | 'student' };
    next();
  });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' }); return;
  }
  next();
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function groqChat(systemPrompt: string, userMessage: string, jsonMode: boolean = false): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
  
  const bodyPayload: any = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  };

  if (jsonMode) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  const res = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }
  const data = await res.json() as any;
  return data.choices[0].message.content.trim();
}


async function notifyAllActive(title: string, content: string, type: string, excludeUserId?: string) {
  const active = await pool.query("SELECT id FROM users WHERE status='active'");
  for (const row of active.rows) {
    if (excludeUserId && row.id === excludeUserId) continue;
    const nid = `notif-${Date.now()}-${row.id}`;
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, content, type) VALUES ($1,$2,$3,$4,$5)`,
      [nid, row.id, title, content, type]
    );
  }
}

// -------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: 'Email and password are required' }); return; }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    if (!result.rows.length) { res.status(401).json({ error: 'Invalid email or password' }); return; }
    const user = result.rows[0];
    if (!bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password' }); return;
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        department: user.department, year: user.year, avatarUrl: user.avatar_url,
        streak: user.streak, totalScore: user.total_score, accuracy: user.accuracy,
        badges: user.badges, joinDate: user.join_date, status: user.status,
      }
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, groupCode, department, year } = req.body;
  if (!name || !email || !password || !groupCode) {
    res.status(400).json({ error: 'All fields including Group Code are required' }); return;
  }
  if (groupCode !== 'CCEWIN') {
    res.status(400).json({ error: 'Invalid Group Code. Please check with your admin.' }); return;
  }
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length) { res.status(400).json({ error: 'Email already registered.' }); return; }
    const uid = `user-${Date.now()}`;
    const hash = bcrypt.hashSync(password, 10);
    const avatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;
    await pool.query(
      `INSERT INTO users (id,name,email,password_hash,role,department,year,avatar_url,status)
       VALUES ($1,$2,$3,$4,'student',$5,$6,$7,'pending')`,
      [uid, name, email.toLowerCase(), hash, department || 'CCE', year || '3rd', avatar]
    );
    res.status(201).json({ message: 'Registration request submitted. Waiting for admin approval.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const r = await pool.query('SELECT * FROM users WHERE id=$1', [req.user?.id]);
    if (!r.rows.length) { res.status(404).json({ error: 'User not found' }); return; }
    const u = r.rows[0];
    res.json({
      user: {
        id: u.id, name: u.name, email: u.email, role: u.role,
        department: u.department, year: u.year, avatarUrl: u.avatar_url,
        streak: u.streak, totalScore: u.total_score, accuracy: u.accuracy,
        badges: u.badges, joinDate: u.join_date, status: u.status,
      }
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// -------------------------------------------------------
// USER MANAGEMENT (ADMIN)
// -------------------------------------------------------

// GET /api/users
app.get('/api/users', authenticateToken, requireAdmin, async (_req, res: Response): Promise<void> => {
  try {
    const r = await pool.query(
      `SELECT id, name, email, role, department, year,
              avatar_url as "avatarUrl", streak, total_score as "totalScore",
              accuracy, badges, join_date as "joinDate", status
       FROM users ORDER BY join_date DESC`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/users/:id/approve
app.patch('/api/users/:id/approve', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const ur = await pool.query('SELECT name FROM users WHERE id=$1', [id]);
    if (!ur.rows.length) { res.status(404).json({ error: 'User not found' }); return; }
    await pool.query("UPDATE users SET status='active', streak=1 WHERE id=$1", [id]);
    const nid = `notif-${Date.now()}`;
    await pool.query(
      `INSERT INTO notifications (id,user_id,title,content,type) VALUES ($1,$2,$3,$4,$5)`,
      [nid, id, 'Welcome to PrepForge!', 'Your account has been approved by the admin. You can now access all quizzes.', 'approval']
    );
    res.json({ message: `User ${ur.rows[0].name} approved.` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/users/:id/reject (delete pending)
app.patch('/api/users/:id/reject', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1 AND status=$2', [id, 'pending']);
    res.json({ message: 'Request rejected.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/users/:id/role
app.patch('/api/users/:id/role', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const r = await pool.query('SELECT role FROM users WHERE id=$1', [id]);
    if (!r.rows.length) { res.status(404).json({ error: 'User not found' }); return; }
    const newRole = r.rows[0].role === 'admin' ? 'student' : 'admin';
    await pool.query('UPDATE users SET role=$1 WHERE id=$2', [newRole, id]);
    res.json({ message: `Role updated to ${newRole}` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [id]);
    res.json({ message: 'User removed.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// -------------------------------------------------------
// QUIZ ROUTES
// -------------------------------------------------------

// GET /api/quizzes
app.get('/api/quizzes', authenticateToken, async (_req, res: Response): Promise<void> => {
  try {
    const r = await pool.query(
      `SELECT q.*, u.name as creator_name,
              (SELECT COUNT(*) FROM questions WHERE quiz_id=q.id) as question_count
       FROM quizzes q
       LEFT JOIN users u ON q.created_by=u.id
       ORDER BY q.created_at DESC`
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/quizzes/:id
app.get('/api/quizzes/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const qr = await pool.query('SELECT * FROM quizzes WHERE id=$1', [req.params.id]);
    if (!qr.rows.length) { res.status(404).json({ error: 'Quiz not found' }); return; }
    const questions = await pool.query(
      'SELECT * FROM questions WHERE quiz_id=$1 ORDER BY position ASC', [req.params.id]
    );
    res.json({ ...qr.rows[0], questions: questions.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/quizzes (admin only)
app.post('/api/quizzes', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    name, description, timeLimit, startTime, endTime,
    marksPerQuestion, negativeMarks, shuffleQuestions, shuffleOptions,
    maxAttempts, quizType, subject, questions
  } = req.body;
  if (!name || !questions?.length) {
    res.status(400).json({ error: 'Quiz name and at least one question are required' }); return;
  }
  const quizId = `quiz-${Date.now()}`;
  const createdBy = req.user!.id;
  try {
    await pool.query(
      `INSERT INTO quizzes (id,name,description,time_limit,start_time,end_time,marks_per_question,
        negative_marks,shuffle_questions,shuffle_options,max_attempts,quiz_type,subject,status,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'draft',$14)`,
      [quizId, name, description||'', timeLimit||30, startTime||null, endTime||null,
       marksPerQuestion||1, negativeMarks||0, shuffleQuestions!==false, shuffleOptions!==false,
       maxAttempts||1, quizType||'practice', subject||'General', createdBy]
    );
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qid = `q-${quizId}-${i}`;
      await pool.query(
        `INSERT INTO questions (id,quiz_id,question_text,options,correct_answer,difficulty,subject,topic,weightage,position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [qid, quizId, q.questionText, JSON.stringify(q.options), q.correctAnswer,
         q.difficulty||'Medium', q.subject||subject||'General', q.topic||'', q.weightage||1, i]
      );
    }
    res.status(201).json({ id: quizId, name, message: 'Quiz created as draft.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/quizzes/:id/publish
app.patch('/api/quizzes/:id/publish', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const qr = await pool.query("UPDATE quizzes SET status='published' WHERE id=$1 RETURNING name,subject", [id]);
    if (!qr.rows.length) { res.status(404).json({ error: 'Quiz not found' }); return; }
    const { name, subject } = qr.rows[0];
    await notifyAllActive(
      '📝 New Quiz Available!',
      `"${name}" (${subject}) has been published. Head to the Quizzes section to attempt it!`,
      'quiz'
    );
    res.json({ message: 'Quiz published and students notified.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/quizzes/:id (update quiz settings)
app.patch('/api/quizzes/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, timeLimit, startTime, endTime, marksPerQuestion,
          negativeMarks, shuffleQuestions, shuffleOptions, maxAttempts, quizType, subject } = req.body;
  try {
    await pool.query(
      `UPDATE quizzes SET name=COALESCE($1,name), description=COALESCE($2,description),
        time_limit=COALESCE($3,time_limit), start_time=$4, end_time=$5,
        marks_per_question=COALESCE($6,marks_per_question),
        negative_marks=COALESCE($7,negative_marks),
        shuffle_questions=COALESCE($8,shuffle_questions),
        shuffle_options=COALESCE($9,shuffle_options),
        max_attempts=COALESCE($10,max_attempts),
        quiz_type=COALESCE($11,quiz_type),
        subject=COALESCE($12,subject)
       WHERE id=$13`,
      [name, description, timeLimit, startTime||null, endTime||null, marksPerQuestion,
       negativeMarks, shuffleQuestions, shuffleOptions, maxAttempts, quizType, subject, id]
    );
    res.json({ message: 'Quiz updated.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// DELETE /api/quizzes/:id
app.delete('/api/quizzes/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM quizzes WHERE id=$1', [req.params.id]);
    res.json({ message: 'Quiz deleted.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// -------------------------------------------------------
// AI: Parse Raw Question Text → Structured Questions
// -------------------------------------------------------

// POST /api/ai/parse-questions
app.post('/api/ai/parse-questions', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { rawText, subject } = req.body;
  if (!rawText?.trim()) { res.status(400).json({ error: 'Raw text is required' }); return; }
  try {
    const systemPrompt = `You are an expert quiz parser for a college platform. 
Parse the given raw text (copied from PDFs, books, or previous year papers) into structured MCQ questions.
You must return a valid JSON object containing a "questions" key with an array of questions.
Each question object in the array must have:
- questionText: string
- options: array of {id: "A"|"B"|"C"|"D", text: string}
- correctAnswer: "A"|"B"|"C"|"D"
- difficulty: "Easy"|"Medium"|"Hard"
- topic: string (infer from question content)
- subject: string (use provided subject or infer)
Rules:
- Escape any double quotes inside string values with a backslash (e.g. \\"A\\" instead of "A").
- If correct answer is not specified, make your best educated guess.
- Normalize inconsistent formats (1), A., A), etc.
- Every question must have exactly 4 options.
- Skip any incomplete questions.`;

    const raw = await groqChat(systemPrompt, `Subject: ${subject || 'General'}\n\n${rawText}`, true);
    const parsed = JSON.parse(raw);
    const questions = parsed.questions || [];
    res.json({ questions, count: questions.length });
  } catch (e: any) {
    console.error('AI parse error:', e);
    res.status(500).json({ error: e.message || 'Failed to parse questions with AI' });
  }
});


// -------------------------------------------------------
// QUIZ ATTEMPTS
// -------------------------------------------------------

// POST /api/attempts — start a new attempt
app.post('/api/attempts', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { quizId } = req.body;
  const userId = req.user!.id;
  if (!quizId) { res.status(400).json({ error: 'quizId is required' }); return; }
  try {
    const qr = await pool.query('SELECT * FROM quizzes WHERE id=$1 AND status=$2', [quizId, 'published']);
    if (!qr.rows.length) { res.status(404).json({ error: 'Quiz not found or not published' }); return; }
    const quiz = qr.rows[0];

    // Check max attempts
    const attempts = await pool.query(
      "SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id=$1 AND user_id=$2 AND status='submitted'",
      [quizId, userId]
    );
    if (parseInt(attempts.rows[0].count) >= quiz.max_attempts) {
      res.status(400).json({ error: 'Maximum attempts reached for this quiz' }); return;
    }

    // Check for existing in-progress attempt
    const existing = await pool.query(
      "SELECT id FROM quiz_attempts WHERE quiz_id=$1 AND user_id=$2 AND status='in_progress'",
      [quizId, userId]
    );
    if (existing.rows.length) {
      // Resume existing attempt
      const attemptId = existing.rows[0].id;
      const attemptData = await pool.query('SELECT * FROM quiz_attempts WHERE id=$1', [attemptId]);
      const responses = await pool.query(
        'SELECT * FROM question_responses WHERE attempt_id=$1', [attemptId]
      );
      const questionsOrdered = attemptData.rows[0].question_order as string[];
      const questions = await pool.query(
        `SELECT * FROM questions WHERE id = ANY($1::text[])`, [questionsOrdered]
      );
      // Sort by the stored order
      const qMap = new Map(questions.rows.map((q: any) => [q.id, q]));
      const orderedQuestions = questionsOrdered.map(id => qMap.get(id)).filter(Boolean);

      res.json({
        attempt: attemptData.rows[0],
        questions: orderedQuestions,
        responses: responses.rows,
        quiz: { timeLimit: quiz.time_limit, marksPerQuestion: quiz.marks_per_question, negativeMarks: quiz.negative_marks },
        resumed: true,
      });
      return;
    }

    // Get questions and shuffle
    const questionsRes = await pool.query(
      'SELECT * FROM questions WHERE quiz_id=$1 ORDER BY position ASC', [quizId]
    );
    let questions = questionsRes.rows;
    if (quiz.shuffle_questions) questions = shuffleArray(questions);

    // Shuffle options per question if enabled
    if (quiz.shuffle_options) {
      questions = questions.map((q: any) => {
        const opts = shuffleArray(q.options as any[]);
        // Remap correct answer to new option position
        const correctText = (q.options as any[]).find((o: any) => o.id === q.correct_answer)?.text;
        const newCorrect = opts.find((o: any) => o.text === correctText)?.id || q.correct_answer;
        return { ...q, options: opts, correct_answer: newCorrect };
      });
    }

    const questionOrder = questions.map((q: any) => q.id);
    const totalMarks = questions.length * quiz.marks_per_question;
    const attemptId = `attempt-${Date.now()}-${userId}`;

    await pool.query(
      `INSERT INTO quiz_attempts (id,quiz_id,user_id,total_marks,status,question_order)
       VALUES ($1,$2,$3,$4,'in_progress',$5)`,
      [attemptId, quizId, userId, totalMarks, JSON.stringify(questionOrder)]
    );

    res.status(201).json({
      attempt: { id: attemptId, quizId, userId, status: 'in_progress', totalMarks, startedAt: new Date().toISOString() },
      questions,
      responses: [],
      quiz: { timeLimit: quiz.time_limit, marksPerQuestion: quiz.marks_per_question, negativeMarks: quiz.negative_marks },
      resumed: false,
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// PATCH /api/attempts/:id/response — save/update a single answer
app.patch('/api/attempts/:id/response', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id: attemptId } = req.params;
  const { questionId, selectedAnswer, flaggedForReview, timeSpent } = req.body;
  if (!questionId) { res.status(400).json({ error: 'questionId is required' }); return; }
  try {
    // Verify attempt belongs to user and is in progress
    const ar = await pool.query(
      "SELECT * FROM quiz_attempts WHERE id=$1 AND user_id=$2 AND status='in_progress'",
      [attemptId, req.user!.id]
    );
    if (!ar.rows.length) { res.status(404).json({ error: 'Active attempt not found' }); return; }
    const attempt = ar.rows[0];

    // Get question to check correctness
    const qr = await pool.query('SELECT correct_answer, quiz_id FROM questions WHERE id=$1', [questionId]);
    if (!qr.rows.length) { res.status(404).json({ error: 'Question not found' }); return; }
    const question = qr.rows[0];
    const quizInfo = await pool.query('SELECT marks_per_question, negative_marks FROM quizzes WHERE id=$1', [question.quiz_id]);
    const { marks_per_question, negative_marks } = quizInfo.rows[0];

    const isCorrect = selectedAnswer !== null && selectedAnswer !== undefined
      ? selectedAnswer === question.correct_answer
      : false;
    const marksAwarded = selectedAnswer === null || selectedAnswer === undefined
      ? 0
      : isCorrect ? marks_per_question : -negative_marks;

    // Upsert response
    const rId = `resp-${attemptId}-${questionId}`;
    await pool.query(
      `INSERT INTO question_responses (id,attempt_id,question_id,selected_answer,is_correct,marks_awarded,time_spent,flagged_for_review,answered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (attempt_id, question_id)
       DO UPDATE SET selected_answer=$4, is_correct=$5, marks_awarded=$6, time_spent=$7, flagged_for_review=$8, answered_at=NOW()`,
      [rId, attemptId, questionId, selectedAnswer||null, isCorrect, marksAwarded, timeSpent||0, flaggedForReview||false]
    );

    res.json({ saved: true, isCorrect, marksAwarded });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// Add unique constraint for responses if not exists (handled by ON CONFLICT above)

// POST /api/attempts/:id/submit — finalize attempt
app.post('/api/attempts/:id/submit', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id: attemptId } = req.params;
  const { timeTaken } = req.body;
  const userId = req.user!.id;
  try {
    const ar = await pool.query(
      "SELECT * FROM quiz_attempts WHERE id=$1 AND user_id=$2 AND status='in_progress'",
      [attemptId, userId]
    );
    if (!ar.rows.length) { res.status(404).json({ error: 'Active attempt not found' }); return; }
    const attempt = ar.rows[0];

    const responses = await pool.query('SELECT * FROM question_responses WHERE attempt_id=$1', [attemptId]);
    const questionCount = (attempt.question_order as string[]).length;

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const respondedIds = new Set(responses.rows.map((r: any) => r.question_id));
    for (const r of responses.rows) {
      score += parseFloat(r.marks_awarded) || 0;
      if (r.selected_answer === null) skippedCount++;
      else if (r.is_correct) correctCount++;
      else wrongCount++;
    }
    skippedCount += questionCount - respondedIds.size;
    score = Math.max(0, score);
    const accuracy = questionCount > 0 ? (correctCount / questionCount) * 100 : 0;

    await pool.query(
      `UPDATE quiz_attempts SET status='submitted', submitted_at=NOW(), score=$1,
        accuracy=$2, time_taken=$3, correct_count=$4, wrong_count=$5, skipped_count=$6
       WHERE id=$7`,
      [score, accuracy, timeTaken||0, correctCount, wrongCount, skippedCount, attemptId]
    );

    // Update user stats
    const userAttempts = await pool.query(
      "SELECT score, accuracy FROM quiz_attempts WHERE user_id=$1 AND status='submitted'",
      [userId]
    );
    const totalScore = userAttempts.rows.reduce((s: number, a: any) => s + parseFloat(a.score), 0);
    const avgAccuracy = userAttempts.rows.length
      ? userAttempts.rows.reduce((s: number, a: any) => s + parseFloat(a.accuracy), 0) / userAttempts.rows.length
      : 0;
    await pool.query(
      'UPDATE users SET total_score=$1, accuracy=$2, streak=streak+1 WHERE id=$3',
      [totalScore, avgAccuracy, userId]
    );

    // Get quiz name for notification
    const quizR = await pool.query('SELECT name FROM quizzes WHERE id=$1', [attempt.quiz_id]);
    const quizName = quizR.rows[0]?.name || 'Quiz';

    const nid = `notif-${Date.now()}`;
    await pool.query(
      `INSERT INTO notifications (id,user_id,title,content,type) VALUES ($1,$2,$3,$4,'result')`,
      [nid, userId, `Quiz Submitted: ${quizName}`,
       `You scored ${score.toFixed(1)}/${attempt.total_marks} with ${accuracy.toFixed(1)}% accuracy. Check your results!`]
    );

    res.json({
      score, accuracy, correctCount, wrongCount, skippedCount,
      totalMarks: attempt.total_marks, timeTaken: timeTaken||0,
      message: 'Quiz submitted successfully!'
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/attempts — get user's attempts (optionally filtered by quizId)
app.get('/api/attempts', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { quiz_id } = req.query;
  try {
    let query = `
      SELECT a.*, q.name as quiz_name, q.subject, q.quiz_type
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.user_id=$1`;
    const params: any[] = [userId];
    if (quiz_id) { query += ' AND a.quiz_id=$2'; params.push(quiz_id); }
    query += ' ORDER BY a.started_at DESC';
    const r = await pool.query(query, params);
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/attempts/:id/detail — get full attempt detail with responses
app.get('/api/attempts/:id/detail', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;
  try {
    const ar = await pool.query('SELECT * FROM quiz_attempts WHERE id=$1 AND user_id=$2', [id, userId]);
    if (!ar.rows.length) { res.status(404).json({ error: 'Attempt not found' }); return; }
    const attempt = ar.rows[0];

    const responses = await pool.query(
      `SELECT qr.*, q.question_text, q.options, q.correct_answer, q.difficulty, q.subject, q.topic
       FROM question_responses qr
       JOIN questions q ON qr.question_id=q.id
       WHERE qr.attempt_id=$1`, [id]
    );

    res.json({ attempt, responses: responses.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// -------------------------------------------------------
// AI EXPLANATIONS (Cached per question)
// -------------------------------------------------------

// GET /api/explanations/:questionId
app.get('/api/explanations/:questionId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { questionId } = req.params;
  try {
    // Check cache first
    const cached = await pool.query('SELECT * FROM ai_explanations WHERE question_id=$1', [questionId]);
    if (cached.rows.length) {
      res.json({ explanation: cached.rows[0], cached: true });
      return;
    }

    // Fetch question details
    const qr = await pool.query('SELECT * FROM questions WHERE id=$1', [questionId]);
    if (!qr.rows.length) { res.status(404).json({ error: 'Question not found' }); return; }
    const q = qr.rows[0];
    const options = q.options as any[];
    const correctOption = options.find((o: any) => o.id === q.correct_answer);

    const systemPrompt = `You are an expert AI tutor for Computer Science and Communication Engineering students. 
Explain MCQ answers in a detailed, educational way. 
Return ONLY valid JSON with these keys:
{
  "why_correct": "detailed explanation of why the correct answer is right",
  "why_options_wrong": {"A":"reason A is wrong","B":"reason B is wrong","C":"reason C is wrong","D":"reason D is wrong"},
  "interview_concepts": "key concepts related to this topic that appear in interviews",
  "short_explanation": "1-2 sentence summary for quick revision",
  "reference_topic": "topic name to study more",
  "interview_frequency": "High|Medium|Low",
  "memory_trick": "a mnemonic or trick to remember this (if applicable, else null)"
}
Skip any option that is the correct answer in why_options_wrong.`;

    const userMsg = `Question: ${q.question_text}
Options: ${options.map((o: any) => `${o.id}) ${o.text}`).join(' | ')}
Correct Answer: ${q.correct_answer}) ${correctOption?.text}
Subject: ${q.subject || 'General'}, Topic: ${q.topic || 'General'}`;

    const raw = await groqChat(systemPrompt, userMsg, true);
    const explanation = JSON.parse(raw);


    // Store in cache
    const expId = `exp-${questionId}`;
    await pool.query(
      `INSERT INTO ai_explanations (id,question_id,why_correct,why_options_wrong,interview_concepts,short_explanation,reference_topic,interview_frequency,memory_trick)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (question_id) DO UPDATE SET
         why_correct=$3, why_options_wrong=$4, interview_concepts=$5,
         short_explanation=$6, reference_topic=$7, interview_frequency=$8, memory_trick=$9, generated_at=NOW()`,
      [expId, questionId, explanation.why_correct, JSON.stringify(explanation.why_options_wrong || {}),
       explanation.interview_concepts, explanation.short_explanation, explanation.reference_topic,
       explanation.interview_frequency, explanation.memory_trick || null]
    );

    res.json({ explanation: { ...explanation, question_id: questionId }, cached: false });
  } catch (e: any) {
    console.error('Explanation error:', e);
    res.status(500).json({ error: e.message || 'Failed to generate explanation' });
  }
});

// -------------------------------------------------------
// LEADERBOARD
// -------------------------------------------------------

// GET /api/leaderboard
app.get('/api/leaderboard', authenticateToken, async (_req, res: Response): Promise<void> => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.department, u.year, u.avatar_url as "avatarUrl",
              u.streak, u.accuracy, u.badges,
              u.total_score as "totalScore",
              (SELECT COUNT(*) FROM quiz_attempts WHERE user_id=u.id AND status='submitted') as "attemptCount",
              (SELECT AVG(time_taken) FROM quiz_attempts WHERE user_id=u.id AND status='submitted') as "avgTimeTaken"
       FROM users u
       WHERE u.status='active' AND u.role='student'
       ORDER BY u.total_score DESC, u.accuracy DESC`
    );
    // Add rank
    const ranked = r.rows.map((row: any, i: number) => ({ ...row, rank: i + 1 }));
    res.json(ranked);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// -------------------------------------------------------
// ANALYTICS
// -------------------------------------------------------

// GET /api/analytics/student/:userId
app.get('/api/analytics/student/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  // Students can only see their own, admins can see anyone
  if (req.user!.role !== 'admin' && req.user!.id !== userId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  try {
    const attempts = await pool.query(
      `SELECT a.*, q.name as quiz_name, q.subject, q.quiz_type
       FROM quiz_attempts a JOIN quizzes q ON a.quiz_id=q.id
       WHERE a.user_id=$1 AND a.status='submitted' ORDER BY a.submitted_at ASC`,
      [userId]
    );
    const responses = await pool.query(
      `SELECT qr.is_correct, qr.marks_awarded, q.subject, q.topic, q.difficulty
       FROM question_responses qr
       JOIN questions q ON qr.question_id=q.id
       JOIN quiz_attempts a ON qr.attempt_id=a.id
       WHERE a.user_id=$1 AND a.status='submitted'`,
      [userId]
    );

    // Subject performance
    const subjectMap: Record<string, { correct: number; total: number }> = {};
    for (const r of responses.rows) {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = { correct: 0, total: 0 };
      subjectMap[r.subject].total++;
      if (r.is_correct) subjectMap[r.subject].correct++;
    }
    const subjectPerformance = Object.entries(subjectMap).map(([subject, { correct, total }]) => ({
      subject, correct, total, accuracy: total > 0 ? (correct / total) * 100 : 0
    })).sort((a, b) => b.accuracy - a.accuracy);

    // Topic performance
    const topicMap: Record<string, { correct: number; total: number }> = {};
    for (const r of responses.rows) {
      if (!r.topic) continue;
      if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0 };
      topicMap[r.topic].total++;
      if (r.is_correct) topicMap[r.topic].correct++;
    }
    const topicPerformance = Object.entries(topicMap).map(([topic, { correct, total }]) => ({
      topic, correct, total, accuracy: total > 0 ? (correct / total) * 100 : 0
    })).sort((a, b) => b.accuracy - a.accuracy);

    // Improvement trend (score over attempts)
    const trend = attempts.rows.map((a: any) => ({
      date: a.submitted_at, quizName: a.quiz_name, score: a.score,
      totalMarks: a.total_marks, accuracy: a.accuracy
    }));

    const strongSubjects = subjectPerformance.filter(s => s.accuracy >= 70).map(s => s.subject);
    const weakSubjects = subjectPerformance.filter(s => s.accuracy < 60).map(s => s.subject);

    res.json({ subjectPerformance, topicPerformance, trend, strongSubjects, weakSubjects });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/analytics/admin
app.get('/api/analytics/admin', authenticateToken, requireAdmin, async (_req, res: Response): Promise<void> => {
  try {
    const totalStudents = await pool.query("SELECT COUNT(*) FROM users WHERE role='student' AND status='active'");
    const totalQuizzes = await pool.query("SELECT COUNT(*) FROM quizzes WHERE status='published'");
    const totalAttempts = await pool.query("SELECT COUNT(*) FROM quiz_attempts WHERE status='submitted'");
    const avgScore = await pool.query("SELECT AVG(score/NULLIF(total_marks,0)*100) as avg_pct FROM quiz_attempts WHERE status='submitted'");

    // Most missed questions
    const mostMissed = await pool.query(
      `SELECT q.question_text, q.subject, q.topic,
              COUNT(*) as attempts,
              SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct,
              ROUND((SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100, 1) as accuracy_pct
       FROM question_responses qr JOIN questions q ON qr.question_id=q.id
       GROUP BY q.id, q.question_text, q.subject, q.topic
       HAVING COUNT(*) > 0
       ORDER BY accuracy_pct ASC LIMIT 5`
    );

    // Subject performance
    const subjectPerf = await pool.query(
      `SELECT q.subject,
              COUNT(*) as total_responses,
              SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_count,
              ROUND(SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 1) as accuracy_pct
       FROM question_responses qr JOIN questions q ON qr.question_id=q.id
       GROUP BY q.subject ORDER BY accuracy_pct ASC`
    );

    // Top performers
    const topPerformers = await pool.query(
      `SELECT u.id, u.name, u.avatar_url as "avatarUrl", u.total_score as "totalScore",
              u.accuracy, u.streak,
              (SELECT COUNT(*) FROM quiz_attempts WHERE user_id=u.id AND status='submitted') as "quizzesTaken"
       FROM users u WHERE u.role='student' AND u.status='active'
       ORDER BY u.total_score DESC LIMIT 5`
    );

    // Quiz participation stats
    const quizStats = await pool.query(
      `SELECT q.id, q.name, q.subject,
              COUNT(DISTINCT a.user_id) as participants,
              AVG(a.score/NULLIF(a.total_marks,0)*100) as avg_pct,
              AVG(a.time_taken) as avg_time
       FROM quizzes q
       LEFT JOIN quiz_attempts a ON q.id=a.quiz_id AND a.status='submitted'
       WHERE q.status='published'
       GROUP BY q.id, q.name, q.subject
       ORDER BY q.created_at DESC`
    );

    res.json({
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalQuizzes: parseInt(totalQuizzes.rows[0].count),
      totalAttempts: parseInt(totalAttempts.rows[0].count),
      avgScorePct: parseFloat(avgScore.rows[0].avg_pct) || 0,
      mostMissedQuestions: mostMissed.rows,
      subjectPerformance: subjectPerf.rows,
      topPerformers: topPerformers.rows,
      quizStats: quizStats.rows,
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/analytics/study-coach/:userId — AI personalized study plan
app.get('/api/analytics/study-coach/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  if (req.user!.role !== 'admin' && req.user!.id !== userId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  try {
    const userR = await pool.query('SELECT * FROM users WHERE id=$1', [userId]);
    if (!userR.rows.length) { res.status(404).json({ error: 'User not found' }); return; }
    const user = userR.rows[0];

    const attempts = await pool.query(
      "SELECT score, total_marks, accuracy, time_taken FROM quiz_attempts WHERE user_id=$1 AND status='submitted'",
      [userId]
    );
    const responses = await pool.query(
      `SELECT q.subject, q.topic, qr.is_correct FROM question_responses qr
       JOIN questions q ON qr.question_id=q.id
       JOIN quiz_attempts a ON qr.attempt_id=a.id WHERE a.user_id=$1 AND a.status='submitted'`,
      [userId]
    );

    const subjectMap: Record<string, { correct: number; total: number }> = {};
    for (const r of responses.rows) {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = { correct: 0, total: 0 };
      subjectMap[r.subject].total++;
      if (r.is_correct) subjectMap[r.subject].correct++;
    }
    const subjectSummary = Object.entries(subjectMap)
      .map(([s, { correct, total }]) => `${s}: ${Math.round((correct / total) * 100)}% accuracy`)
      .join(', ');

    const avgAccuracy = user.accuracy;
    const totalAttempts = attempts.rows.length;

    const systemPrompt = `You are an expert AI placement preparation coach for engineering students.
Based on the student's quiz performance data, generate a personalized study plan.
Return ONLY valid JSON with these exact keys:
{
  "overallSummary": "2-3 sentence overall performance summary",
  "strengths": ["topic1", "topic2"],
  "weaknesses": ["topic1", "topic2"],
  "topicsToStudy": ["topic1", "topic2", "topic3"],
  "recommendedPractice": ["specific practice suggestion 1", "specific practice suggestion 2"],
  "estimatedStudyHours": number,
  "placementReadiness": "Beginner|Developing|Intermediate|Advanced|Ready",
  "placementReadinessPct": number between 0 and 100,
  "weeklyPlan": "brief 1 paragraph weekly study plan"
}`;

    const userMsg = `Student: ${user.name}, Dept: ${user.department}
Total Quizzes Attempted: ${totalAttempts}
Average Accuracy: ${avgAccuracy.toFixed(1)}%
Subject Performance: ${subjectSummary || 'No data yet'}`;

    const raw = await groqChat(systemPrompt, userMsg, true);
    const plan = JSON.parse(raw);


    res.json({ studyCoach: plan });
  } catch (e: any) {
    console.error('Study coach error:', e);
    res.status(500).json({ error: e.message || 'Failed to generate study plan' });
  }
});

// -------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------

app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const r = await pool.query(
      `SELECT id, title, content, type, created_at as "createdAt", read
       FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    res.json(r.rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.patch('/api/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await pool.query('UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2', [req.params.id, req.user!.id]);
    res.json({ message: 'Marked as read' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.patch('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await pool.query('UPDATE notifications SET read=true WHERE user_id=$1', [req.user!.id]);
    res.json({ message: 'All marked as read' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

app.delete('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM notifications WHERE user_id=$1', [req.user!.id]);
    res.json({ message: 'Notifications cleared' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Internal server error' }); }
});

// -------------------------------------------------------
// SERVE FRONTEND (production)
// -------------------------------------------------------
import fsModule from 'fs';

const distPath = path.join(process.cwd(), 'dist');

if (fsModule.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA catch-all: send index.html for any unknown route
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`📦 Serving frontend from ${distPath}`);
}

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ PrepForge Quiz Server running on http://localhost:${PORT}`);
});
