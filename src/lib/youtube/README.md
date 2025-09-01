# YouTube API Integration

This module provides comprehensive YouTube Data API v3 integration for the GenScript platform.

## Features

### Channel Operations (`channel.js`)
- Extract channel ID from various YouTube URL formats
- Fetch channel statistics and metadata
- Get channel videos with pagination
- Parse and structure channel data

### Video Analysis (`video.js`)
- Fetch individual video details
- Extract video transcripts using youtube-transcript
- Analyze video content patterns
- Extract topics and keywords from video data

### Analytics (`analytics.js`)
- Generate comprehensive channel analytics
- Create audience personas based on content
- Calculate performance metrics
- Generate actionable insights and recommendations

### Trending Analysis (`trending.js`)
- Fetch trending videos by region and category
- Search for videos with filters
- Analyze trending topics and patterns
- Find related channels

## API Rate Limiting

The integration includes built-in rate limiting to prevent exceeding YouTube API quotas:
- Maximum 100 requests per minute per operation type
- Automatic rate limit handling with helpful error messages

## Caching

Responses are cached for 5 minutes to minimize API calls:
- Channel data
- Video information
- Trending data
- Search results

## Environment Variables

Required:
```
YOUTUBE_API_KEY=your_youtube_api_key
```

## Usage Examples

### Connect a Channel
```javascript
import { getChannelByUrl } from '@/lib/youtube/channel';

const channel = await getChannelByUrl('https://youtube.com/@channelname');
```

### Analyze Channel Content
```javascript
import { generateChannelAnalytics } from '@/lib/youtube/analytics';

const videos = await getChannelVideos(channelId);
const analytics = await generateChannelAnalytics(channel, videos);
```

### Get Video Transcript
```javascript
import { getVideoTranscript } from '@/lib/youtube/video';

const transcript = await getVideoTranscript(videoId);
if (transcript.hasTranscript) {
  console.log(transcript.fullText);
}
```

## Error Handling

All functions include comprehensive error handling:
- Invalid channel URLs return clear error messages
- API quota exceeded errors are caught and reported
- Network errors are properly handled
- Missing transcripts are handled gracefully