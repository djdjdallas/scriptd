// Script Export API Route

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createApiHandler, ApiError } from '@/lib/api-handler';
import { EXPORT_FORMATS, CREDIT_COSTS } from '@/lib/constants';
import { validateCreditsWithBypass, conditionalCreditDeduction } from '@/lib/credit-bypass';
import { exportToPDF } from '@/lib/export/pdf-exporter';
import { exportToDOCX } from '@/lib/export/docx-exporter';
import { exportToGoogleDocs } from '@/lib/export/google-docs-exporter';
import { Packer } from 'docx';

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
  const { user, supabase } = await getAuthenticatedUser();

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
    .eq('user_id', user.id)
    .single();

  if (error || !script) {
    throw new ApiError('Script not found', 404);
  }

  // Check credits for premium formats
  const creditCost = [EXPORT_FORMATS.PDF, EXPORT_FORMATS.DOCX].includes(format) 
    ? CREDIT_COSTS.EXPORT_PDF 
    : 0;

  // Check credits if needed
  if (creditCost > 0) {
    const { data: userData } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!userData) {
      throw new ApiError('Failed to fetch user data', 500);
    }

    // Check user credits with bypass option
    const creditValidation = validateCreditsWithBypass(userData.credits, creditCost, user);
    if (!creditValidation.isValid) {
      throw new ApiError(creditValidation.message, 402);
    }

    // Deduct credits (with bypass check)
    const creditDeduction = await conditionalCreditDeduction(
      supabase,
      user.id,
      userData.credits,
      creditCost,
      user
    );

    if (!creditDeduction.success && !creditDeduction.bypassed) {
      console.error('Failed to deduct credits:', creditDeduction.error);
      // Don't throw error, export can continue
    }

    // Record transaction (only if credits weren't bypassed)
    if (!creditDeduction.bypassed) {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -creditCost,
          type: 'export',
          description: `Exported script: ${script.title} as ${format}`,
          metadata: { scriptId: script.id, format }
        });
    }
  }

  try {
    // Record export
    await supabase
      .from('script_exports')
      .insert({
        script_id: script.id,
        user_id: user.id,
        format,
        metadata: { creditCost }
      });

    // Handle PDF export
    if (format === EXPORT_FORMATS.PDF) {
      const { buffer, filename, contentType } = await exportToPDF(script);
      
      // Return base64 encoded PDF for client download
      return {
        format,
        filename,
        content: buffer.toString('base64'),
        contentType,
        encoding: 'base64',
        creditCost
      };
    }

    // Handle DOCX export
    if (format === EXPORT_FORMATS.DOCX) {
      const { document, filename, contentType } = await exportToDOCX(script);
      const buffer = await Packer.toBuffer(document);
      
      // Return base64 encoded DOCX for client download
      return {
        format,
        filename,
        content: buffer.toString('base64'),
        contentType,
        encoding: 'base64',
        creditCost
      };
    }

    // Handle Google Docs export
    if (format === EXPORT_FORMATS.GOOGLE_DOCS) {
      // Check if user has Google OAuth token
      const googleToken = body.googleAccessToken;
      
      if (!googleToken) {
        // Return OAuth URL if no token
        return {
          format,
          requiresAuth: true,
          authUrl: `/api/auth/google?scope=https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file&redirect=/scripts/${script.id}/export-google`
        };
      }
      
      // Export to Google Docs
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();
        
      const result = await exportToGoogleDocs(script, googleToken, userData?.email);
      
      return {
        format,
        documentId: result.documentId,
        url: result.url,
        title: result.title,
        creditCost: 0 // Google Docs export is free
      };
    }

    // Handle basic formats (TXT, MD, HTML)
    const converted = convertScript(script, format);
    
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