import { createApiHandler, ApiError } from '@/lib/api-handler';
import { createServiceClient } from '@/lib/supabase/service';

const ALLOWED_TOOLS = [
  'title-generator',
  'hook-generator',
  'idea-generator',
  'hashtag-generator',
  'thumbnail-ideas',
  'transcript-extraction',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = createApiHandler(
  async (req) => {
    const { email, sourceTool } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ApiError('Please enter a valid email address', 400);
    }

    if (!sourceTool || !ALLOWED_TOOLS.includes(sourceTool)) {
      throw new ApiError('Invalid source tool', 400);
    }

    const supabase = createServiceClient();

    // Check if email already exists for this tool (soft dedup)
    const { data: existing } = await supabase
      .from('tool_leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('source_tool', sourceTool)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('tool_leads').insert({
        email: email.toLowerCase(),
        source_tool: sourceTool,
      });

      if (error) {
        console.error('Failed to insert tool lead:', error);
        throw new ApiError('Failed to save email', 500);
      }
    }

    return Response.json({ success: true });
  },
  {
    rateLimit: true,
    rateLimitOptions: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
    },
  }
);
