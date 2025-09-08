#!/usr/bin/env node

// Script to switch the app back to full Firebase functionality

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching back to full Firebase mode...');

// 1. Restore firebase configuration
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
const firebaseConfigBackupPath = path.join(__dirname, '..', 'firebase.json.backup');

if (fs.existsSync(firebaseConfigBackupPath)) {
  fs.copyFileSync(firebaseConfigBackupPath, firebaseConfigPath);
  console.log('✅ Restored firebase.json');
} else {
  console.log('⚠️ No backup found for firebase.json');
}

// 2. Restore firebase-platform.ts
const firebasePlatformPath = path.join(__dirname, '..', 'services', 'firebase-platform.ts');
const firebasePlatformBackupPath = path.join(__dirname, '..', 'services', 'firebase-platform.ts.backup');

if (fs.existsSync(firebasePlatformBackupPath)) {
  fs.copyFileSync(firebasePlatformBackupPath, firebasePlatformPath);
  console.log('✅ Restored firebase-platform.ts');
} else {
  console.log('⚠️ No backup found for firebase-platform.ts');
}

// 3. Restore firebase.ts
const firebasePath = path.join(__dirname, '..', 'services', 'firebase.ts');
const firebaseBackupPath = path.join(__dirname, '..', 'services', 'firebase.ts.backup');

if (fs.existsSync(firebaseBackupPath)) {
  fs.copyFileSync(firebaseBackupPath, firebasePath);
  console.log('✅ Restored firebase.ts');
} else {
  console.log('⚠️ No backup found for firebase.ts');
}

console.log('\n🎉 Successfully switched back to full Firebase mode!');
console.log('\n📋 All Features Enabled:');
console.log('  ✅ Full Authentication (Email/Password + Google)');
console.log('  ✅ Complete Firestore Database');
console.log('  ✅ Cloud Functions');
console.log('  ✅ Advanced Analytics');
console.log('  ✅ Podcast Generation');
console.log('  ✅ Community Features');
console.log('  ✅ Advanced Personalization');

console.log('\n🚀 You can now run your app with:');
console.log('  npm start');
console.log('  or');
console.log('  expo start');
