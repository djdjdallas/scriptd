import { NextResponse } from 'next/server';
import { YoutubeTranscript } from '@danielxceron/youtube-transcript';

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

    // Fetch real transcript from YouTube
    let transcriptData;
    try {
      transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (transcriptError) {
      console.error('Transcript fetch error:', transcriptError);
      return NextResponse.json(
        {
          error: 'No transcript available for this video. The video may not have captions enabled.',
          details: transcriptError.message
        },
        { status: 404 }
      );
    }

    // Format transcript based on timestamp preference
    let transcript;
    if (includeTimestamps) {
      transcript = transcriptData
        .map(entry => {
          const timestamp = formatTimestamp(entry.offset / 1000);
          return `[${timestamp}] ${entry.text}`;
        })
        .join('\n\n');
    } else {
      transcript = transcriptData
        .map(entry => entry.text)
        .join(' ');
    }

    return NextResponse.json({
      success: true,
      transcript,
      videoUrl,
      videoId,
      includeTimestamps,
      wordCount: transcript.split(' ').length,
      estimatedReadTime: Math.ceil(transcript.split(' ').length / 200), // ~200 words per minute
      duration: transcriptData.length > 0 ? formatTimestamp(transcriptData[transcriptData.length - 1].offset / 1000) : '0:00'
    });

  } catch (error) {
    console.error('Transcript generation error:', error);
    return NextResponse.json(
      { error: 'Failed to extract transcript', details: error.message },
      { status: 500 }
    );
  }
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}