import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, format, metadata } = await request.json();

    let content;
    let mimeType;
    let filename;

    switch (format) {
      case 'txt':
        content = script;
        mimeType = 'text/plain';
        filename = `${metadata.title}.txt`;
        break;

      case 'markdown':
        content = `# ${metadata.title}

**Topic:** ${metadata.topic}  
**Duration:** ${metadata.duration} minutes  
**Created:** ${new Date(metadata.createdAt).toLocaleDateString()}

---

${script}`;
        mimeType = 'text/markdown';
        filename = `${metadata.title}.md`;
        break;

      case 'json':
        content = JSON.stringify({
          title: metadata.title,
          topic: metadata.topic,
          duration: metadata.duration,
          script: script,
          createdAt: metadata.createdAt
        }, null, 2);
        mimeType = 'application/json';
        filename = `${metadata.title}.json`;
        break;

      case 'srt':
        const words = script.split(' ');
        const wordsPerSecond = 2.5;
        let currentTime = 0;
        let srtContent = '';
        let index = 1;
        
        for (let i = 0; i < words.length; i += 10) {
          const chunk = words.slice(i, i + 10).join(' ');
          const duration = chunk.split(' ').length / wordsPerSecond;
          const startTime = formatSRTTime(currentTime);
          const endTime = formatSRTTime(currentTime + duration);
          
          srtContent += `${index}\n${startTime} --> ${endTime}\n${chunk}\n\n`;
          currentTime += duration;
          index++;
        }
        
        content = srtContent;
        mimeType = 'application/x-subrip';
        filename = `${metadata.title}.srt`;
        break;

      case 'docx':
        content = `${metadata.title}\n\nTopic: ${metadata.topic}\nDuration: ${metadata.duration} minutes\n\n${script}`;
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${metadata.title}.docx`;
        break;

      case 'pdf':
        content = script;
        mimeType = 'application/pdf';
        filename = `${metadata.title}.pdf`;
        break;

      default:
        content = script;
        mimeType = 'text/plain';
        filename = `${metadata.title}.txt`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    apiLogger.error('Export error', error);
    return NextResponse.json(
      { error: 'Failed to export script' },
      { status: 500 }
    );
  }
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}