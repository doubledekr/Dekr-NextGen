#!/usr/bin/env node

/**
 * Quick podcast generation with AutoContent API using optimized parameters
 */

const AUTOCONTENT_API_KEY = 'ff08e0f1-e8ed-4616-bbe8-fd1ca653470d';
const AUTOCONTENT_BASE_URL = 'https://api.autocontentapi.com';

// Get current week identifier
function getCurrentWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = getWeekNumber(now);
  return {
    weekOf: `${year}-W${weekNumber.toString().padStart(2, '0')}`,
    year,
    week: weekNumber
  };
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Generate a shorter, optimized script
function generateOptimizedScript() {
  const { weekOf } = getCurrentWeek();
  
  return `Welcome to the Dekr Weekly Community Podcast for ${weekOf}. I'm your host, and what an incredible week it's been in the markets and our community.

Our top performers this week include Alex Chen with a 12.5% return and 85% accuracy, Sarah Johnson with 9.8% return, and Mike Rodriguez with 6.3% return. These results show the power of our community intelligence.

In the markets, Apple gained 3.2% to close at $175.50, Microsoft rose 2.1%, while Tesla declined 1.8%. The crypto markets were strong with Bitcoin up 5.7% and Ethereum gaining 4.2%.

The big news this week was tech stocks rallying on strong Q4 earnings. Our community predicted this with 78% accuracy, demonstrating our collective intelligence.

Market sentiment is bullish at 75% confidence. Our community isn't just following markets - we're anticipating them.

We welcomed 3 new members this week. Welcome to the family! You've joined a learning community where smart people share ideas and build wealth together.

Looking ahead, keep your eyes on next week's economic calendar for key data releases that could create opportunities.

Remember: preparation beats prediction. Until next week, keep your charts close and your stop-losses closer. This is your Dekr Weekly Community Podcast. Thanks for being part of the Dekr community!`;
}

// Generate audio using AutoContent API with optimized parameters
async function generateAudioWithAutoContent(script) {
  try {
    console.log('🎙️ Generating audio with AutoContent API...');
    console.log('Script length:', script.length, 'characters');
    console.log('Word count:', script.split(' ').length, 'words');
    console.log('Estimated duration:', Math.floor(script.split(' ').length / 200), 'minutes');
    console.log('');

    // Step 1: Create content request with optimized parameters
    console.log('📝 Step 1: Creating content request...');
    const createResponse = await fetch(`${AUTOCONTENT_BASE_URL}/content/Create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTOCONTENT_API_KEY}`
      },
      body: JSON.stringify({
        resources: [
          {
            type: "text",
            content: script
          }
        ],
        outputType: "audio",
        text: "Create a weekly community podcast about market analysis",
        duration: "short", // Use "short" instead of "default" for faster processing
        voice: "professional_male", // Specify voice for consistency
        speed: 1.0, // Normal speed
        quality: "standard" // Standard quality for faster processing
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ AutoContent API create error:', createResponse.status, errorText);
      throw new Error(`AutoContent API create error: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    const requestId = createResult.request_id;
    console.log('✅ Content request created successfully!');
    console.log('📋 Request ID:', requestId);
    console.log('');

    // Step 2: Poll for status with shorter intervals
    console.log('⏳ Step 2: Polling for completion...');
    let attempts = 0;
    const maxAttempts = 40; // 6.5 minutes max
    const pollInterval = 10000; // 10 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}...`);

      const statusResponse = await fetch(`${AUTOCONTENT_BASE_URL}/content/Status/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AUTOCONTENT_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        console.error('❌ Status check failed:', statusResponse.status);
        continue;
      }

      const statusResult = await statusResponse.json();
      console.log('📊 Status:', statusResult.status);

      // Check for completion (status 100)
      if (statusResult.status === 100) {
        console.log('✅ Audio generation completed!');
        console.log('📋 Result:', statusResult);
        
        if (statusResult.audio_url) {
          console.log('🔗 Audio URL:', statusResult.audio_url);
          return statusResult.audio_url;
        } else {
          throw new Error('Audio URL not found in response');
        }
      } else if (statusResult.status === 0) {
        console.log('⏳ Still pending...');
      } else if (statusResult.status === 5) {
        console.log('🔄 Processing...');
      } else if (statusResult.error_code && statusResult.error_code !== 0) {
        console.error('❌ Error during processing:', statusResult.error_code, statusResult.error_message);
        throw new Error(`Processing error: ${statusResult.error_code} - ${statusResult.error_message}`);
      } else {
        console.log('📊 Processing status:', statusResult.status);
      }
    }

    throw new Error('Audio generation timed out after 6.5 minutes');
  } catch (error) {
    console.error('❌ Error generating audio:', error);
    throw error;
  }
}

// Main function to generate quick podcast
async function generateQuickPodcast() {
  try {
    console.log('🎙️ Starting quick podcast generation...');
    console.log('');

    const { weekOf } = getCurrentWeek();
    console.log('📅 Generating podcast for week:', weekOf);
    console.log('');

    // Step 1: Generate optimized script
    console.log('📝 Step 1: Generating optimized script...');
    const script = generateOptimizedScript();
    console.log('✅ Script generated:', script.length, 'characters');
    console.log('');

    // Step 2: Generate audio using AutoContent API
    console.log('🎵 Step 2: Generating audio with AutoContent API...');
    const audioUrl = await generateAudioWithAutoContent(script);
    console.log('✅ Audio generated successfully!');
    console.log('🔗 Audio URL:', audioUrl);
    console.log('');

    // Step 3: Create podcast data structure
    const podcastData = {
      id: `weekly_podcast_${weekOf}`,
      title: `Dekr Weekly Community Podcast - ${weekOf}`,
      description: `This week's analysis of market trends, community highlights, and investment opportunities. Featuring top performers, market insights, and community intelligence.`,
      audioUrl: audioUrl,
      thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
      weekOf: weekOf,
      content: {
        script: script,
        segments: [
          {
            title: 'Community Highlights',
            duration: 60,
            description: 'Top performing community members'
          },
          {
            title: 'Market Analysis',
            duration: 90,
            description: 'Weekly market performance'
          },
          {
            title: 'Crypto Update',
            duration: 45,
            description: 'Bitcoin and Ethereum performance'
          },
          {
            title: 'News Roundup',
            duration: 60,
            description: 'Key financial news'
          }
        ]
      },
      createdAt: new Date().toISOString(),
      duration: Math.floor(script.split(' ').length / 200) * 60,
      tags: ['weekly', 'community', 'podcast', 'market-update', 'autocontent']
    };

    // Step 4: Create podcast card data structure
    const podcastCardData = {
      id: `podcast_${podcastData.id}`,
      type: 'podcast',
      title: podcastData.title,
      description: podcastData.description,
      contentUrl: podcastData.audioUrl,
      imageUrl: podcastData.thumbnailUrl,
      metadata: {
        weekNumber: podcastData.weekOf,
      },
      createdAt: new Date().toISOString(),
      priority: 90,
      tags: ['weekly', 'community', 'podcast', 'market-update'],
      engagement: {
        views: 0,
        saves: 0,
        shares: 0
      }
    };

    console.log('🎉 Quick podcast generation completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Week: ${weekOf}`);
    console.log(`   Title: ${podcastData.title}`);
    console.log(`   Duration: ${Math.floor(podcastData.duration / 60)} minutes`);
    console.log(`   Audio URL: ${audioUrl}`);
    console.log(`   Script Length: ${script.length} characters`);
    console.log(`   Word Count: ${script.split(' ').length} words`);
    console.log('');
    console.log('📋 Podcast Data Structure:');
    console.log('========================');
    console.log(JSON.stringify(podcastData, null, 2));
    console.log('');
    console.log('📋 Podcast Card Data Structure:');
    console.log('===============================');
    console.log(JSON.stringify(podcastCardData, null, 2));
    console.log('');
    console.log('🎉 This podcast data can now be added to Firestore!');

  } catch (error) {
    console.error('❌ Error generating quick podcast:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
generateQuickPodcast();
