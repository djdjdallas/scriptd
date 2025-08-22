// Script Export API Route

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { supabase } from '@/lib/supabase';
import { EXPORT_FORMATS, CREDIT_COSTS } from '@/lib/constants';

// Helper to convert script to different formats
function convertScript(script, format) {
  const { title, content, metadata } = script;

  switch (format) {
    case EXPORT_FORMATS.TXT:
      return {
        content: `${title}\n${'='.repeat(title.length)}\n\n${content}`,
        mimeType: 'text/plain',
        extension: 'txt'
      };

    case EXPORT_FORMATS.MARKDOWN:
      return {
        content: `# ${title}\n\n${content.replace(/\n([A-Z\s]+:)/g, '\n## $1')}`,
        mimeType: 'text/markdown',
        extension: 'md'
      };

    case EXPORT_FORMATS.HTML:
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        p { line-height: 1.6; }
        .metadata { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="metadata">
        <p><strong>Type:</strong> ${metadata?.type || 'General'}</p>
        <p><strong>Length:</strong> ${metadata?.length || 'N/A'} minutes</p>
        <p><strong>Created:</strong> ${new Date(script.created_at).toLocaleDateString()}</p>
    </div>
    <div class="content">
        ${content.split('\n').map(line => {
          if (line.match(/^[A-Z\s]+:/)) {
            return `<h2>${line}</h2>`;
          }
          return `<p>${line}</p>`;
        }).join('\n')}
    </div>
</body>
</html>`;
      return {
        content: html,
        mimeType: 'text/html',
        extension: 'html'
      };

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// POST /api/scripts/[id]/export - Export script
export const POST = createApiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError('Authentication required', 401);
  }

  const body = await req.json();
  const format = body.format || EXPORT_FORMATS.TXT;

  // Validate format
  if (!Object.values(EXPORT_FORMATS).includes(format)) {
    throw new ApiError('Invalid export format', 400);
  }

  // Get script
  const { data: script, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (error || !script) {
    throw new ApiError('Script not found', 404);
  }

  // Check credits for premium formats
  const creditCost = [EXPORT_FORMATS.PDF, EXPORT_FORMATS.DOCX].includes(format) 
    ? CREDIT_COSTS.EXPORT_PDF 
    : 0;

  if (creditCost > 0) {
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', session.user.id)
      .single();

    if (!user || user.credits < creditCost) {
      throw new ApiError('Insufficient credits for this export format', 402);
    }

    // Deduct credits
    await supabase
      .from('users')
      .update({ credits: user.credits - creditCost })
      .eq('id', session.user.id);

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: session.user.id,
        amount: -creditCost,
        type: 'export',
        description: `Exported script: ${script.title} as ${format}`,
        metadata: { scriptId: script.id, format }
      });
  }

  try {
    // Convert script
    const converted = convertScript(script, format);

    // Record export
    await supabase
      .from('script_exports')
      .insert({
        script_id: script.id,
        user_id: session.user.id,
        format,
        metadata: { creditCost }
      });

    // For PDF and DOCX, we'd integrate with a conversion service
    // For now, return the content for client-side handling
    if ([EXPORT_FORMATS.PDF, EXPORT_FORMATS.DOCX].includes(format)) {
      return {
        format,
        title: script.title,
        content: script.content,
        message: 'Use client-side library to generate ' + format.toUpperCase()
      };
    }

    // For Google Docs, return OAuth URL
    if (format === EXPORT_FORMATS.GOOGLE_DOCS) {
      return {
        format,
        authUrl: '/api/auth/google?scope=drive.file&redirect=/scripts/' + script.id + '/export-success'
      };
    }

    // Return the converted content
    return {
      format,
      filename: `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${converted.extension}`,
      content: converted.content,
      mimeType: converted.mimeType,
      creditCost
    };

  } catch (error) {
    console.error('Export error:', error);
    throw new ApiError('Failed to export script', 500);
  }
});