"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLessonAudio = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const bucket = admin.storage().bucket();
/**
 * Firebase Function to upload all lesson audio files to Firebase Storage
 * and populate the educationContent collection with lesson metadata
 */
exports.uploadLessonAudio = functions
    .region('us-central1')
    .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
})
    .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if user is admin or demo user
    const isDemoUser = context.auth.uid === 'demo-user-123';
    if (!isDemoUser) {
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        const userData = userDoc.data();
        if (!(userData === null || userData === void 0 ? void 0 : userData.isAdmin)) {
            throw new functions.https.HttpsError('permission-denied', 'Only admins and demo user can run this migration');
        }
    }
    const progress = {
        total: 0,
        completed: 0,
        failed: 0,
        errors: []
    };
    try {
        console.log('🚀 Starting lesson audio migration...');
        // Define the local assets directory path
        const assetsDir = path.join(__dirname, '../../../../assets/audio');
        // Check if assets directory exists
        if (!fs.existsSync(assetsDir)) {
            throw new Error(`Assets directory not found: ${assetsDir}`);
        }
        // Get all MP3 files from the assets directory
        const audioFiles = fs.readdirSync(assetsDir)
            .filter(file => file.endsWith('.mp3') && !file.startsWith('.'))
            .sort();
        progress.total = audioFiles.length;
        console.log(`📁 Found ${audioFiles.length} audio files to upload`);
        const uploadedLessons = [];
        // Process each audio file
        for (const filename of audioFiles) {
            try {
                console.log(`📤 Processing: ${filename}`);
                const lessonMetadata = await uploadSingleLessonAudio(filename, assetsDir);
                uploadedLessons.push(lessonMetadata);
                progress.completed++;
                console.log(`✅ Uploaded: ${filename} (${progress.completed}/${progress.total})`);
            }
            catch (error) {
                progress.failed++;
                const errorMsg = `Failed to upload ${filename}: ${error instanceof Error ? error.message : String(error)}`;
                progress.errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }
        // Save lesson metadata to Firestore
        if (uploadedLessons.length > 0) {
            console.log('💾 Saving lesson metadata to Firestore...');
            await saveLessonMetadata(uploadedLessons);
        }
        // Upload intro stingers and podcast files
        await uploadIntroStingers(assetsDir);
        await uploadPodcastFiles(assetsDir);
        console.log('🎉 Migration completed successfully!');
        console.log(`📊 Results: ${progress.completed} uploaded, ${progress.failed} failed`);
        return {
            success: true,
            message: 'Lesson audio migration completed successfully',
            progress,
            uploadedLessons: uploadedLessons.length,
            errors: progress.errors
        };
    }
    catch (error) {
        console.error('💥 Migration failed:', error);
        throw new functions.https.HttpsError('internal', `Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
});
/**
 * Upload a single lesson audio file to Firebase Storage
 */
async function uploadSingleLessonAudio(filename, assetsDir) {
    const filePath = path.join(assetsDir, filename);
    // Parse lesson information from filename
    const lessonInfo = parseLessonFilename(filename);
    if (!lessonInfo) {
        throw new Error(`Invalid lesson filename format: ${filename}`);
    }
    // Define storage path
    const storagePath = `dekr-content/audio/lessons/stage_${lessonInfo.stage}/${filename}`;
    // Upload file to Firebase Storage
    const file = bucket.file(storagePath);
    const stream = fs.createReadStream(filePath);
    await new Promise((resolve, reject) => {
        stream.pipe(file.createWriteStream({
            metadata: {
                contentType: 'audio/mpeg',
                metadata: {
                    originalName: filename,
                    stage: lessonInfo.stage.toString(),
                    lessonNumber: lessonInfo.lessonNumber.toString(),
                    uploadedAt: new Date().toISOString()
                }
            }
        }))
            .on('error', reject)
            .on('finish', resolve);
    });
    // Make the file publicly readable
    await file.makePublic();
    // Get the public URL
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    // Create lesson metadata
    const lessonMetadata = {
        id: `lesson_${lessonInfo.stage}_${lessonInfo.lessonNumber}`,
        stage: lessonInfo.stage,
        lessonNumber: lessonInfo.lessonNumber,
        title: generateLessonTitle(lessonInfo.stage, lessonInfo.lessonNumber),
        description: generateLessonDescription(lessonInfo.stage, lessonInfo.lessonNumber),
        duration: await getAudioDuration(filePath),
        xpReward: calculateXPReward(lessonInfo.stage, lessonInfo.lessonNumber),
        audioUrl,
        storagePath,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    };
    return lessonMetadata;
}
/**
 * Parse lesson information from filename
 * Expected format: lesson_X_Y.mp3 where X is stage and Y is lesson number
 */
function parseLessonFilename(filename) {
    const match = filename.match(/^lesson_(\d+)_(\d+)\.mp3$/);
    if (!match) {
        return null;
    }
    return {
        stage: parseInt(match[1], 10),
        lessonNumber: parseInt(match[2], 10)
    };
}
/**
 * Generate lesson title based on stage and lesson number
 */
function generateLessonTitle(stage, lessonNumber) {
    const stageTitles = {
        1: 'Core Money Skills',
        2: 'Advanced Financial Concepts',
        3: 'Investment Strategies'
    };
    const stageTitle = stageTitles[stage] || `Stage ${stage}`;
    return `Lesson ${lessonNumber}: ${stageTitle}`;
}
/**
 * Generate lesson description based on stage and lesson number
 */
function generateLessonDescription(stage, lessonNumber) {
    const descriptions = {
        1: 'Learn the essential basics of money and finance',
        2: 'Master advanced financial concepts and strategies',
        3: 'Explore sophisticated investment strategies and portfolio management'
    };
    return descriptions[stage] || `Educational content for stage ${stage}, lesson ${lessonNumber}`;
}
/**
 * Calculate XP reward based on stage and lesson number
 */
function calculateXPReward(stage, lessonNumber) {
    const baseXP = 20;
    const stageMultiplier = stage * 5;
    const lessonBonus = Math.floor(lessonNumber / 5) * 5;
    return baseXP + stageMultiplier + lessonBonus;
}
/**
 * Get audio duration (placeholder - would need audio analysis library)
 */
async function getAudioDuration(filePath) {
    // This is a placeholder. In a real implementation, you'd use a library like 'node-ffmpeg'
    // or 'music-metadata' to analyze the audio file and get the actual duration
    return 120; // Default 2 minutes
}
/**
 * Save lesson metadata to Firestore
 */
async function saveLessonMetadata(lessons) {
    const batch = db.batch();
    for (const lesson of lessons) {
        const docRef = db.collection('educationContent').doc(lesson.id);
        batch.set(docRef, lesson);
    }
    await batch.commit();
    console.log(`💾 Saved ${lessons.length} lesson metadata documents to Firestore`);
}
/**
 * Upload intro stingers to Firebase Storage
 */
async function uploadIntroStingers(assetsDir) {
    const introFiles = ['Podcast Intro.mp3', 'Fashion Podcast Intro.mp3'];
    for (const filename of introFiles) {
        const filePath = path.join(assetsDir, filename);
        if (fs.existsSync(filePath)) {
            const storagePath = `dekr-content/audio/intro_stingers/${filename}`;
            const file = bucket.file(storagePath);
            const stream = fs.createReadStream(filePath);
            await new Promise((resolve, reject) => {
                stream.pipe(file.createWriteStream({
                    metadata: {
                        contentType: 'audio/mpeg',
                        metadata: {
                            originalName: filename,
                            type: 'intro_stinger',
                            uploadedAt: new Date().toISOString()
                        }
                    }
                }))
                    .on('error', reject)
                    .on('finish', resolve);
            });
            await file.makePublic();
            console.log(`✅ Uploaded intro stinger: ${filename}`);
        }
    }
}
/**
 * Upload podcast files to Firebase Storage
 */
async function uploadPodcastFiles(assetsDir) {
    // This would handle any existing podcast files
    // For now, we'll just log that this section is ready for future podcast uploads
    console.log('📻 Podcast upload section ready for future implementation');
}
//# sourceMappingURL=uploadLessonAudio.js.map