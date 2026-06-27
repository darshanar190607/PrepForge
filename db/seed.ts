import { pool } from './client';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding PrepForge Quiz Platform database...');

  try {
    // ---- Admin User ----
    const adminId = 'user-admin-darshan';
    const adminHash = bcrypt.hashSync('admin123', 10);
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, role, department, year, avatar_url, streak, total_score, accuracy, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (email) DO NOTHING
    `, [
      adminId,
      'Darshan AR',
      'darshan.ar2024cce@sece.ac.in',
      adminHash,
      'admin',
      'CCE',
      '3rd',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      0, 0, 0, 'active'
    ]);
    console.log('✅ Admin user seeded');

    // ---- Sample Students ----
    const students = [
      { id: 'user-priya', name: 'Priya Patel', email: 'priya.patel@student.edu', streak: 7, score: 87.5, accuracy: 78.2 },
      { id: 'user-aman', name: 'Aman Sharma', email: 'aman.sharma@student.edu', streak: 5, score: 72.0, accuracy: 68.4 },
      { id: 'user-sneha', name: 'Sneha Reddy', email: 'sneha.r@student.edu', streak: 10, score: 91.0, accuracy: 84.1 },
      { id: 'user-vikram', name: 'Vikram Malhotra', email: 'vikram.m@student.edu', streak: 3, score: 65.5, accuracy: 61.8 },
    ];
    const avatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ];
    const stdHash = bcrypt.hashSync('password123', 10);
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role, department, year, avatar_url, streak, total_score, accuracy, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (email) DO NOTHING
      `, [s.id, s.name, s.email, stdHash, 'student', 'CCE', '3rd', avatars[i], s.streak, s.score, s.accuracy, 'active']);
    }
    console.log('✅ Sample students seeded');

    // Fetch the actual admin id (in case the ON CONFLICT skipped insertion and the id is different)
    const adminRow = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    const actualAdminId = adminRow.rows[0]?.id || adminId;

    // ---- Sample Quiz ----
    const quizId = 'quiz-sample-cce-networks';
    await pool.query(`
      INSERT INTO quizzes (id, name, description, time_limit, marks_per_question, negative_marks, shuffle_questions, shuffle_options, max_attempts, quiz_type, subject, status, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (id) DO NOTHING
    `, [
      quizId,
      'Computer Networks — Fundamentals',
      'Test your knowledge on TCP/IP, OSI Model, HTTP, DNS and core networking concepts. Based on previous year university questions.',
      30, 1, 0.25, true, true, 2, 'practice', 'Computer Networks', 'published', actualAdminId
    ]);
    console.log('✅ Sample quiz seeded');


    // ---- Sample Questions ----
    const questions = [
      {
        id: 'q-1', text: 'Which layer of the OSI model is responsible for routing packets between networks?',
        options: [
          { id: 'A', text: 'Data Link Layer' },
          { id: 'B', text: 'Network Layer' },
          { id: 'C', text: 'Transport Layer' },
          { id: 'D', text: 'Session Layer' }
        ],
        correct: 'B', difficulty: 'Easy', subject: 'Computer Networks', topic: 'OSI Model'
      },
      {
        id: 'q-2', text: 'What does TCP stand for?',
        options: [
          { id: 'A', text: 'Transfer Control Protocol' },
          { id: 'B', text: 'Transmission Control Protocol' },
          { id: 'C', text: 'Transport Communication Protocol' },
          { id: 'D', text: 'Transaction Control Protocol' }
        ],
        correct: 'B', difficulty: 'Easy', subject: 'Computer Networks', topic: 'TCP/IP'
      },
      {
        id: 'q-3', text: 'Which protocol is used to assign IP addresses dynamically to hosts on a network?',
        options: [
          { id: 'A', text: 'DNS' },
          { id: 'B', text: 'ARP' },
          { id: 'C', text: 'DHCP' },
          { id: 'D', text: 'ICMP' }
        ],
        correct: 'C', difficulty: 'Easy', subject: 'Computer Networks', topic: 'Protocols'
      },
      {
        id: 'q-4', text: 'In the context of HTTP, which status code indicates a "Not Found" error?',
        options: [
          { id: 'A', text: '200' },
          { id: 'B', text: '301' },
          { id: 'C', text: '403' },
          { id: 'D', text: '404' }
        ],
        correct: 'D', difficulty: 'Easy', subject: 'Computer Networks', topic: 'HTTP'
      },
      {
        id: 'q-5', text: 'Which of the following is a connection-oriented protocol?',
        options: [
          { id: 'A', text: 'UDP' },
          { id: 'B', text: 'IP' },
          { id: 'C', text: 'TCP' },
          { id: 'D', text: 'ICMP' }
        ],
        correct: 'C', difficulty: 'Medium', subject: 'Computer Networks', topic: 'TCP/IP'
      },
      {
        id: 'q-6', text: 'What is the default port number for HTTPS?',
        options: [
          { id: 'A', text: '80' },
          { id: 'B', text: '443' },
          { id: 'C', text: '8080' },
          { id: 'D', text: '21' }
        ],
        correct: 'B', difficulty: 'Easy', subject: 'Computer Networks', topic: 'HTTP'
      },
      {
        id: 'q-7', text: 'Which device operates at the Network layer (Layer 3) of the OSI model?',
        options: [
          { id: 'A', text: 'Switch' },
          { id: 'B', text: 'Hub' },
          { id: 'C', text: 'Router' },
          { id: 'D', text: 'Repeater' }
        ],
        correct: 'C', difficulty: 'Medium', subject: 'Computer Networks', topic: 'OSI Model'
      },
      {
        id: 'q-8', text: 'The process of converting a domain name to its corresponding IP address is called:',
        options: [
          { id: 'A', text: 'ARP Resolution' },
          { id: 'B', text: 'NAT Translation' },
          { id: 'C', text: 'DNS Resolution' },
          { id: 'D', text: 'DHCP Assignment' }
        ],
        correct: 'C', difficulty: 'Easy', subject: 'Computer Networks', topic: 'DNS'
      },
      {
        id: 'q-9', text: 'Which protocol is used to send error messages and operational information about IP operations?',
        options: [
          { id: 'A', text: 'TCP' },
          { id: 'B', text: 'UDP' },
          { id: 'C', text: 'ICMP' },
          { id: 'D', text: 'FTP' }
        ],
        correct: 'C', difficulty: 'Medium', subject: 'Computer Networks', topic: 'Protocols'
      },
      {
        id: 'q-10', text: 'In a subnet mask of 255.255.255.0, how many bits are used for the host portion?',
        options: [
          { id: 'A', text: '8' },
          { id: 'B', text: '16' },
          { id: 'C', text: '24' },
          { id: 'D', text: '32' }
        ],
        correct: 'A', difficulty: 'Hard', subject: 'Computer Networks', topic: 'IP Addressing'
      }
    ];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(`
        INSERT INTO questions (id, quiz_id, question_text, options, correct_answer, difficulty, subject, topic, weightage, position)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT DO NOTHING
      `, [q.id, quizId, q.text, JSON.stringify(q.options), q.correct, q.difficulty, q.subject, q.topic, 1, i]);
    }
    console.log('✅ Sample questions seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('   Admin: darshan.ar2024cce@sece.ac.in / admin123');
    console.log('   Student: priya.patel@student.edu / password123');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
