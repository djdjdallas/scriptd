import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { videoUrl, includeTimestamps = true } = await request.json();

    if (!videoUrl?.trim()) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // In a real implementation, this would use YouTube's transcript API or similar service
    // For now, we'll generate a mock transcript based on common YouTube video patterns
    
    const transcript = generateMockTranscript(includeTimestamps);

    return NextResponse.json({
      success: true,
      transcript,
      videoUrl,
      videoId,
      includeTimestamps,
      wordCount: transcript.split(' ').length,
      estimatedReadTime: Math.ceil(transcript.split(' ').length / 200) // ~200 words per minute
    });

  } catch (error) {
    console.error('Transcript generation error:', error);
    return NextResponse.json(
      { error: 'Failed to extract transcript' },
      { status: 500 }
    );
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function generateMockTranscript(includeTimestamps) {
  // Generate a realistic YouTube video transcript
  const transcriptSections = [
    {
      time: "00:00",
      text: "Hey everyone, welcome back to my channel! If you're new here, make sure to subscribe and hit that bell icon for notifications."
    },
    {
      time: "00:15", 
      text: "Today I'm going to show you something that's going to completely change the way you approach this topic."
    },
    {
      time: "00:30",
      text: "But before we dive in, I want to tell you about a common mistake that almost everyone makes when they're starting out."
    },
    {
      time: "00:45",
      text: "I used to make this mistake too, and it cost me so much time and frustration until I figured out the right way to do it."
    },
    {
      time: "01:00",
      text: "So let's jump right in. The first thing you need to understand is the foundation. Without this, nothing else will work properly."
    },
    {
      time: "01:30",
      text: "Now, I'm going to walk you through this step by step. Don't worry if it seems overwhelming at first - I'll break it down into manageable pieces."
    },
    {
      time: "02:00",
      text: "Step one is all about preparation. This is crucial and most people skip this part, which is why they struggle later on."
    },
    {
      time: "02:30",
      text: "Here's what you're going to need: first, make sure you have all your materials ready. I've put a list in the description below."
    },
    {
      time: "03:00",
      text: "Now, let me show you exactly how to do this. Watch closely because I'm going to demonstrate the technique that took me years to perfect."
    },
    {
      time: "03:45",
      text: "See how I'm doing this? Notice the angle and the pressure I'm applying. This is really important for getting the right results."
    },
    {
      time: "04:30",
      text: "Okay, so that's the basic technique. But here's where most people go wrong - they rush this part. Take your time here."
    },
    {
      time: "05:00",
      text: "Let me share a pro tip that I learned from years of experience. This little trick will save you hours of work."
    },
    {
      time: "05:30",
      text: "Alright, now we're moving on to the next phase. This is where things get really interesting."
    },
    {
      time: "06:00",
      text: "What I'm about to show you is a game-changer. I wish I had known this when I was starting out."
    },
    {
      time: "06:45",
      text: "Here's the key insight that changes everything. Once you understand this principle, everything else will click into place."
    },
    {
      time: "07:30",
      text: "Now, you might be wondering about variations and different approaches. Let me address some common questions I get."
    },
    {
      time: "08:00",
      text: "The most frequent question is about troubleshooting. If you run into problems, here's what you should check first."
    },
    {
      time: "08:30",
      text: "Another common issue is timing. Getting the timing right is crucial, so let me explain the indicators to watch for."
    },
    {
      time: "09:00",
      text: "Now let me show you some advanced techniques. These are optional but can really take your results to the next level."
    },
    {
      time: "09:45",
      text: "This advanced method is what separates the beginners from the experts. It takes practice, but it's worth mastering."
    },
    {
      time: "10:30",
      text: "Let's talk about common mistakes to avoid. I see these errors all the time, and they're easily preventable."
    },
    {
      time: "11:00",
      text: "The biggest mistake is trying to rush the process. Good results take time, so be patient with yourself."
    },
    {
      time: "11:30",
      text: "Another mistake is not paying attention to the details. The little things really do make a big difference."
    },
    {
      time: "12:00",
      text: "Alright, let's recap what we've covered today. First, we talked about the foundation and why it's so important."
    },
    {
      time: "12:15",
      text: "Then we went through the step-by-step process, including that game-changing technique I showed you."
    },
    {
      time: "12:30",
      text: "We also covered troubleshooting and common mistakes, plus some advanced methods for those ready to level up."
    },
    {
      time: "12:45",
      text: "Remember, mastery takes practice, so don't get discouraged if it doesn't work perfectly the first time."
    },
    {
      time: "13:00",
      text: "I'd love to hear about your results in the comments below. Let me know how this technique worked for you."
    },
    {
      time: "13:15",
      text: "If this video helped you out, please give it a thumbs up. It really helps the channel grow and reach more people."
    },
    {
      time: "13:30",
      text: "And if you haven't already, make sure to subscribe for more tutorials like this one. I post new content every week."
    },
    {
      time: "13:45",
      text: "Also, check out the video I'm showing on screen right now. It covers a related topic that you'll find really useful."
    },
    {
      time: "14:00",
      text: "Thanks for watching, and I'll see you in the next video. Keep practicing, and remember - you've got this!"
    }
  ];

  if (includeTimestamps) {
    return transcriptSections
      .map(section => `[${section.time}] ${section.text}`)
      .join('\n\n');
  } else {
    return transcriptSections
      .map(section => section.text)
      .join('\n\n');
  }
}