#!/usr/bin/env node

// Script to switch the app to MVP mode with minimal Firebase functionality

const fs = require('fs');
const path = require('path');

console.log('🚀 Switching to MVP mode...');

// 1. Backup current firebase configuration
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
const firebaseConfigBackupPath = path.join(__dirname, '..', 'firebase.json.backup');

if (fs.existsSync(firebaseConfigPath)) {
  fs.copyFileSync(firebaseConfigPath, firebaseConfigBackupPath);
  console.log('✅ Backed up firebase.json');
}

// 2. Switch to MVP Firebase configuration
const firebaseMvpPath = path.join(__dirname, '..', 'firebase-mvp.json');
if (fs.existsSync(firebaseMvpPath)) {
  fs.copyFileSync(firebaseMvpPath, firebaseConfigPath);
  console.log('✅ Switched to MVP Firebase configuration');
}

// 3. Update firebase-platform.ts to use MVP version
const firebasePlatformPath = path.join(__dirname, '..', 'services', 'firebase-platform.ts');
const firebasePlatformMvpPath = path.join(__dirname, '..', 'services', 'firebase-platform-mvp.ts');
const firebasePlatformBackupPath = path.join(__dirname, '..', 'services', 'firebase-platform.ts.backup');

if (fs.existsSync(firebasePlatformPath)) {
  fs.copyFileSync(firebasePlatformPath, firebasePlatformBackupPath);
  console.log('✅ Backed up firebase-platform.ts');
}

if (fs.existsSync(firebasePlatformMvpPath)) {
  fs.copyFileSync(firebasePlatformMvpPath, firebasePlatformPath);
  console.log('✅ Switched to MVP Firebase platform service');
}

// 4. Update firebase.ts to use MVP version
const firebasePath = path.join(__dirname, '..', 'services', 'firebase.ts');
const firebaseMvpServicePath = path.join(__dirname, '..', 'services', 'firebase-mvp.ts');
const firebaseBackupPath = path.join(__dirname, '..', 'services', 'firebase.ts.backup');

if (fs.existsSync(firebasePath)) {
  fs.copyFileSync(firebasePath, firebaseBackupPath);
  console.log('✅ Backed up firebase.ts');
}

if (fs.existsSync(firebaseMvpServicePath)) {
  fs.copyFileSync(firebaseMvpServicePath, firebasePath);
  console.log('✅ Switched to MVP Firebase service');
}

console.log('\n🎉 Successfully switched to MVP mode!');
console.log('\n📋 MVP Features Enabled:');
console.log('  ✅ Basic Authentication (Email/Password)');
console.log('  ✅ Firestore Database (Basic CRUD)');
console.log('  ✅ User Profiles');
console.log('  ✅ Watchlist Functionality');
console.log('  ✅ Basic Analytics');

console.log('\n🚫 MVP Features Disabled:');
console.log('  ❌ Google Sign-In');
console.log('  ❌ Cloud Functions');
console.log('  ❌ Advanced Analytics');
console.log('  ❌ Podcast Generation');
console.log('  ❌ Community Features');
console.log('  ❌ Advanced Personalization');

console.log('\n🔄 To switch back to full mode, run:');
console.log('  node scripts/switch-to-full.js');

console.log('\n🚀 You can now run your app with:');
console.log('  npm start');
console.log('  or');
console.log('  expo start');
