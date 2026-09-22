// Database Index Creation Script
// Run with: node scripts/create-indexes.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      dbName: 'skilllens-db',
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Users collection indexes
    console.log('\n📊 Creating indexes for Users collection...');
    const usersCollection = db.collection('users');
    
    await usersCollection.createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique' }
    );
    console.log('✅ Created unique index on email');

    await usersCollection.createIndex(
      { clerkUserId: 1 },
      { unique: true, name: 'clerkUserId_unique' }
    );
    console.log('✅ Created unique index on clerkUserId');

    await usersCollection.createIndex(
      { 'role.student': 1, 'college.departmentId': 1, updatedAt: -1 },
      { name: 'student_department_activity' }
    );
    console.log('✅ Created compound index on role.student, department, updatedAt');

    await usersCollection.createIndex(
      { 'role.hod': 1, 'college.departmentId': 1 },
      { name: 'hod_department' }
    );
    console.log('✅ Created compound index on role.hod, department');

    await usersCollection.createIndex(
      { 'matching.status': 1, 'onboarding.learningMode': 1 },
      { name: 'matching_status_mode' }
    );
    console.log('✅ Created index on matching.status and learningMode');

    await usersCollection.createIndex(
      { 'matching.teammateId': 1 },
      { name: 'matching_teammate' }
    );
    console.log('✅ Created index on matching.teammateId');

    await usersCollection.createIndex(
      { 'roadmap.role': 1, 'roadmap.currentWeek': 1 },
      { name: 'roadmap_progress' }
    );
    console.log('✅ Created index on roadmap.role and currentWeek');

    // Check for other collections and create indexes
    const collections = await db.listCollections().toArray();
    
    // Hackathons collection (if exists)
    if (collections.find(c => c.name === 'hackathons')) {
      console.log('\n📊 Creating indexes for Hackathons collection...');
      const hackathonsCollection = db.collection('hackathons');
      
      await hackathonsCollection.createIndex(
        { startDate: -1 },
        { name: 'start_date_desc' }
      );
      console.log('✅ Created index on startDate');

      await hackathonsCollection.createIndex(
        { status: 1, startDate: -1 },
        { name: 'status_date' }
      );
      console.log('✅ Created compound index on status and startDate');
    }

    // Progress/Teams collection (if exists)
    if (collections.find(c => c.name === 'teams')) {
      console.log('\n📊 Creating indexes for Teams collection...');
      const teamsCollection = db.collection('teams');
      
      await teamsCollection.createIndex(
        { 'members.userId': 1 },
        { name: 'team_members' }
      );
      console.log('✅ Created index on team members');

      await teamsCollection.createIndex(
        { createdAt: -1 },
        { name: 'created_desc' }
      );
      console.log('✅ Created index on createdAt');
    }

    console.log('\n✨ All indexes created successfully!');
    console.log('\n📈 Index Summary:');
    const indexes = await usersCollection.indexes();
    console.log(`   Users collection has ${indexes.length} indexes`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createIndexes();
