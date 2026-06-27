import { pool } from './client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('Starting clean database seeding...');
  
  const client = await pool.connect();
  try {
    // Drop existing tables to ensure a clean state
    console.log('Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS contributions CASCADE;');
    await client.query('DROP TABLE IF EXISTS notifications CASCADE;');
    await client.query('DROP TABLE IF EXISTS announcements CASCADE;');
    await client.query('DROP TABLE IF EXISTS submissions CASCADE;');
    await client.query('DROP TABLE IF EXISTS problems CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');

    // Read and execute schema.sql
    console.log('Executing schema.sql...');
    const schemaPath = path.resolve(process.cwd(), 'db/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Schema created successfully.');

    // Seed ONLY the Admin User
    console.log('Seeding admin user...');
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const adminEmail = 'darshan.ar2024cce@sece.ac.in';
    const adminId = 'user-admin';
    const joinDate = new Date().toISOString().split('T')[0];
    const avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar_url, streak, solved_count, join_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        adminId,
        'Darshan AR', // Seed admin's name
        adminEmail,
        adminPasswordHash,
        'admin',
        avatarUrl,
        0, // Streak starts at 0
        0, // Solved count starts at 0
        joinDate,
        'active'
      ]
    );

    console.log(`Successfully seeded admin user: ${adminEmail}`);
    console.log('Clean database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
