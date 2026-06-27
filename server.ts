import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db/client';
import { createBranch, commitFile } from './server/github';


const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'prepforge_super_secret_jwt_key';

app.use(cors());
app.use(express.json());

// Extend express Request type to include user information
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'member';
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = decoded as { id: string; role: 'admin' | 'member' };
    next();
  });
};

// Admin Authorization Middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    
    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.status === 'pending') {
      res.status(403).json({ error: 'Your registration request is still pending admin approval.' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password_hash from user object
    const { password_hash, ...userProfile } = user;

    res.json({
      token,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        avatarUrl: userProfile.avatar_url,
        streak: userProfile.streak,
        solvedCount: userProfile.solved_count,
        joinDate: userProfile.join_date,
        status: userProfile.status,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, groupCode } = req.body;
  if (!name || !email || !password || !groupCode) {
    res.status(400).json({ error: 'All fields including Group Code are strictly required.' });
    return;
  }

  if (groupCode !== 'CCEWIN') {
    res.status(400).json({ error: 'Invalid Group Code. Please check with your coordinator.' });
    return;
  }

  try {
    // Check if user already exists
    const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (checkUser.rows.length > 0) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const avatarUrl = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;
    const joinDate = new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar_url, streak, solved_count, join_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [userId, name, email.toLowerCase(), passwordHash, 'member', avatarUrl, 0, 0, joinDate, 'pending']
    );

    res.status(201).json({ message: 'Request sent. Waiting for admin approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Validate token and return profile
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user?.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const { password_hash, ...userProfile } = user;

    res.json({
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        avatarUrl: userProfile.avatar_url,
        streak: userProfile.streak,
        solvedCount: userProfile.solved_count,
        joinDate: userProfile.join_date,
        status: userProfile.status,
      }
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// USER MANAGEMENT ROUTES (ADMIN ONLY)
// -------------------------------------------------------------

// GET /api/users
app.get('/api/users', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id, name, email, role, avatar_url as "avatarUrl", streak, solved_count as "solvedCount", join_date as "joinDate", status FROM users ORDER BY join_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/:id/approve
app.patch('/api/users/:id/approve', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userName = userRes.rows[0].name;

    // Approve the user
    await pool.query("UPDATE users SET status = 'active', streak = 1 WHERE id = $1", [id]);

    // Create branch on GitHub using user's name
    const branchName = `cohort/${userName.toLowerCase().replace(/\s+/g, '-')}`;
    createBranch(branchName).catch(err => console.error('[GitHub Sync Error] Failed to create branch:', err));

    // Create a notification for the approved user
    const notifId = `notif-${Date.now()}`;
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, content, type, read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [notifId, id, 'Batch Entrance Approved', 'Your request has been admitted into the preparation cohort workspace.', 'approval', false]
    );

    // Create a notification logs update for admins (optional)
    res.json({ message: `User ${userName} approved successfully.` });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/:id/role
app.patch('/api/users/:id/role', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const currentRole = result.rows[0].role;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [newRole, id]);
    res.json({ message: `Role updated to ${newRole}` });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// PROBLEMS/CHALLENGES ROUTES
// -------------------------------------------------------------

// GET /api/problems
app.get('/api/problems', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, topic, pattern, difficulty, deadline, 
              resources, starter_code as "starterCode", test_cases as "testCases", 
              company_tags as "companyTags", published_at as "publishedAt"
       FROM problems 
       ORDER BY published_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/problems
app.post('/api/problems', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { title, description, topic, pattern, difficulty, deadline, starterCode, testCases, companyTags } = req.body;
  if (!title || !description || !topic || !pattern || !difficulty || !deadline) {
    res.status(400).json({ error: 'Required fields are missing' });
    return;
  }

  const problemId = `prob-${Date.now()}`;
  const publishedAt = new Date().toISOString();

  try {
    await pool.query(
      `INSERT INTO problems (id, title, description, topic, pattern, difficulty, deadline, resources, starter_code, test_cases, company_tags, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        problemId,
        title,
        description,
        topic,
        pattern,
        difficulty,
        deadline,
        JSON.stringify([]), // Default empty resources or parse req.body.resources
        JSON.stringify(starterCode || {}),
        JSON.stringify(testCases || []),
        JSON.stringify(companyTags || []),
        publishedAt
      ]
    );

    // Notify all active users of the new challenge
    const activeUsers = await pool.query("SELECT id FROM users WHERE status = 'active'");
    for (const row of activeUsers.rows) {
      const notifId = `notif-${Date.now()}-${row.id}`;
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, content, type, read)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          notifId,
          row.id,
          'New Challenge Assigned!',
          `Coordinators assigned: "${title}" (${difficulty}). Solve before deadline!`,
          'challenge',
          false
        ]
      );
    }

    res.status(201).json({ id: problemId, title, difficulty, message: 'Challenge published successfully.' });
  } catch (error) {
    console.error('Publish challenge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// SUBMISSIONS ROUTES
// -------------------------------------------------------------

// GET /api/submissions
app.get('/api/submissions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, problem_id as "problemId", user_id as "userId", user_name as "userName", 
              user_avatar as "userAvatar", code, language, status, 
              submitted_at as "submittedAt", runtime, memory, explanation 
       FROM submissions 
       ORDER BY submitted_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/submissions
app.post('/api/submissions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { problemId, code, language, explanation } = req.body;
  const userId = req.user?.id;

  if (!problemId || !code || !language || !userId) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  try {
    // Get user details
    const userRes = await pool.query('SELECT name, avatar_url, solved_count, streak FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const user = userRes.rows[0];

    // Check if user already submitted
    const checkSub = await pool.query('SELECT id FROM submissions WHERE problem_id = $1 AND user_id = $2', [problemId, userId]);
    const alreadySolved = checkSub.rows.length > 0;

    const submissionId = `sub-${Date.now()}`;
    const submittedAt = new Date().toISOString();
    const status = 'Accepted'; // Mock compile validation always passes
    const runtime = `${Math.floor(Math.random() * 80) + 10} ms`;
    const memory = `${(Math.random() * 10 + 10).toFixed(1)} MB`;

    // Insert submission
    await pool.query(
      `INSERT INTO submissions (id, problem_id, user_id, user_name, user_avatar, code, language, status, submitted_at, runtime, memory, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        submissionId,
        problemId,
        userId,
        user.name,
        user.avatar_url,
        code,
        language,
        status,
        submittedAt,
        runtime,
        memory,
        explanation || ''
      ]
    );

    // Update user streak & solved count if it's the first accepted submission for this problem
    if (!alreadySolved) {
      const newSolvedCount = user.solved_count + 1;
      const newStreak = user.streak === 0 ? 1 : user.streak + 1;
      await pool.query(
        'UPDATE users SET solved_count = $1, streak = $2 WHERE id = $3',
        [newSolvedCount, newStreak, userId]
      );
    }

    // Get problem title for the notification
    const probRes = await pool.query('SELECT title FROM problems WHERE id = $1', [problemId]);
    const problemTitle = probRes.rows.length > 0 ? probRes.rows[0].title : 'Challenge';

    // Push solution to GitHub branch
    const branchName = `cohort/${user.name.toLowerCase().replace(/\s+/g, '-')}`;
    const fileExt = language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'java';
    const filename = `solutions/${problemTitle.replace(/\s+/g, '-')}.${fileExt}`;
    const commitMsg = `Solve: ${problemTitle} (${language})`;
    commitFile(branchName, filename, code, commitMsg).catch(err => console.error('[GitHub Sync Error] Failed to commit solution:', err));

    // Insert success notification for the submitting user
    const notifId = `notif-${Date.now()}`;
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, content, type, read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        notifId,
        userId,
        'Success Code Logged!',
        `Your solution for "${problemTitle}" was accepted by automated compiler.`,
        'approval',
        false
      ]
    );

    res.status(201).json({
      id: submissionId,
      problemId,
      userId,
      userName: user.name,
      userAvatar: user.avatar_url,
      code,
      language,
      status,
      submittedAt,
      runtime,
      memory,
      explanation
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// ANNOUNCEMENTS ROUTES
// -------------------------------------------------------------

// GET /api/announcements
app.get('/api/announcements', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT id, title, content, author, created_at as "createdAt", category FROM announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/announcements
app.post('/api/announcements', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  // Get author name
  const authorId = req.user?.id;
  try {
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [authorId]);
    const authorName = userRes.rows.length > 0 ? `${userRes.rows[0].name} (Admin)` : 'Admin';

    const announcementId = `ann-${Date.now()}`;
    const createdAt = new Date().toISOString();

    await pool.query(
      `INSERT INTO announcements (id, title, content, author, created_at, category)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [announcementId, title, content, authorName, createdAt, category || 'general']
    );

    // Notify all active users of the new announcement
    const activeUsers = await pool.query("SELECT id FROM users WHERE status = 'active'");
    for (const row of activeUsers.rows) {
      const notifId = `notif-${Date.now()}-${row.id}`;
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, content, type, read)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          notifId,
          row.id,
          'Notice Board Update',
          `Coordinators posted: "${title}" under announcements.`,
          'announcement',
          false
        ]
      );
    }

    res.status(201).json({ id: announcementId, title, author: authorName, createdAt, category });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/announcements/:id
app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// NOTIFICATIONS ROUTES
// -------------------------------------------------------------

// GET /api/notifications
app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      `SELECT id, title, content, type, created_at as "createdAt", read 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/:id/read
app.patch('/api/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/read-all
app.patch('/api/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  try {
    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1',
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notifications
app.delete('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  try {
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    res.json({ message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// -------------------------------------------------------------
// CONTRIBUTIONS ROUTES (ALL MEMBERS)
// -------------------------------------------------------------

// GET /api/contributions
app.get('/api/contributions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, user_id as "userId", user_name as "userName", topic, title, 
              video_url as "videoUrl", description, created_at as "createdAt"
       FROM contributions 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/contributions/video
app.post('/api/contributions/video', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { topic, title, videoUrl, description } = req.body;
  const userId = req.user?.id;

  if (!topic || !title || !videoUrl || !userId) {
    res.status(400).json({ error: 'Topic, Title, and Video URL are required.' });
    return;
  }

  try {
    // Get user details
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const userName = userRes.rows[0].name;
    const contribId = `contrib-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Insert contribution record in DB
    await pool.query(
      `INSERT INTO contributions (id, user_id, user_name, topic, title, video_url, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [contribId, userId, userName, topic, title, videoUrl, description || '', createdAt]
    );

    // Fetch all contributions for this user to rebuild their markdown file
    const userContribs = await pool.query(
      'SELECT topic, title, video_url, description, created_at FROM contributions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Build markdown content
    let mdContent = `# Video Contributions — ${userName}\n\n`;
    mdContent += `Below is a log of video explanations and learning contributions posted by ${userName} on PrepForge.\n\n`;
    mdContent += `*Total Contributions: ${userContribs.rows.length}*\n\n`;
    mdContent += `---\n\n`;

    for (const c of userContribs.rows) {
      mdContent += `## ${c.topic} — ${c.title}\n`;
      mdContent += `- **Video Link**: [Watch Video](${c.video_url})\n`;
      mdContent += `- **Posted On**: ${new Date(c.created_at).toLocaleDateString()}\n`;
      if (c.description) {
        mdContent += `- **Description**: ${c.description}\n`;
      }
      mdContent += `\n---\n\n`;
    }

    // Commit file to student's GitHub branch
    const branchName = `cohort/${userName.toLowerCase().replace(/\s+/g, '-')}`;
    const filePath = 'contributions/video-explanations.md';
    const commitMsg = `Contribution: Add video explanation for ${topic}`;
    commitFile(branchName, filePath, mdContent, commitMsg).catch(err => 
      console.error('[GitHub Sync Error] Failed to commit video contribution:', err)
    );

    res.status(201).json({
      id: contribId,
      userId,
      userName,
      topic,
      title,
      videoUrl,
      description,
      createdAt
    });
  } catch (error) {
    console.error('Video contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
