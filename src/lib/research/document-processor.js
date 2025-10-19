/**
 * Document Processing Pipeline for User-Uploaded Research
 *
 * Extracts text from PDF, DOCX, TXT files and processes them
 * into structured research sources with quality metrics.
 */

/**
 * Process uploaded document and extract content
 * Note: For full PDF/DOCX support, you'll need to install:
 * - pdf-parse for PDF files
 * - mammoth for DOCX files
 *
 * This is a simplified version that works with text-based content.
 * For production, implement proper PDF/DOCX parsing.
 */
async function processDocument(file, fileContent) {
  const fileName = file.name || file.file_name;
  const fileType = file.type || file.mime_type || '';
  const fileSize = file.size || file.file_size;

  let extractedText = '';
  let processingMethod = 'unknown';

  try {
    // Determine file type and extract accordingly
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractFromPDF(fileContent);
      processingMethod = 'pdf';
    } else if (fileType.includes('word') || fileType.includes('document') ||
               fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
      extractedText = await extractFromDOCX(fileContent);
      processingMethod = 'docx';
    } else if (fileType.includes('text') || fileName.toLowerCase().endsWith('.txt')) {
      extractedText = fileContent.toString('utf-8');
      processingMethod = 'text';
    } else if (fileType.includes('json')) {
      const jsonData = JSON.parse(fileContent.toString('utf-8'));
      extractedText = JSON.stringify(jsonData, null, 2);
      processingMethod = 'json';
    } else {
      // Attempt to treat as text
      extractedText = fileContent.toString('utf-8');
      processingMethod = 'fallback-text';
    }

    // Process the extracted text
    const processed = processExtractedText(extractedText);

    return {
      success: true,
      fileName,
      fileType,
      fileSize,
      processingMethod,
      content: processed.content,
      metadata: {
        originalLength: extractedText.length,
        processedLength: processed.content.length,
        wordCount: processed.wordCount,
        lineCount: processed.lineCount,
        chunkCount: processed.chunks.length,
        quality: calculateDocumentQuality(processed)
      },
      chunks: processed.chunks
    };
  } catch (error) {
    console.error('Error processing document:', error);
    return {
      success: false,
      fileName,
      error: error.message,
      processingMethod
    };
  }
}

/**
 * Extract text from PDF (placeholder - requires pdf-parse library)
 */
async function extractFromPDF(fileContent) {
  // TODO: Implement with pdf-parse library
  // For now, return a placeholder
  console.warn('PDF extraction not fully implemented. Install pdf-parse for full support.');

  // Attempt basic extraction if possible
  try {
    // If pdf-parse is available
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(fileContent);
    return data.text;
  } catch (err) {
    // Fallback: return instruction for user
    return `[PDF Document: ${fileContent.length} bytes]\n\nTo fully process PDF files, please install pdf-parse library:\nnpm install pdf-parse\n\nAlternatively, please copy and paste the PDF content as text.`;
  }
}

/**
 * Extract text from DOCX (placeholder - requires mammoth library)
 */
async function extractFromDOCX(fileContent) {
  // TODO: Implement with mammoth library
  console.warn('DOCX extraction not fully implemented. Install mammoth for full support.');

  try {
    // If mammoth is available
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: fileContent });
    return result.value;
  } catch (err) {
    // Fallback: return instruction for user
    return `[Word Document: ${fileContent.length} bytes]\n\nTo fully process Word documents, please install mammoth library:\nnpm install mammoth\n\nAlternatively, please save as PDF or copy and paste the content as text.`;
  }
}

/**
 * Process extracted text into structured format
 */
function processExtractedText(text) {
  // Clean up the text
  let cleaned = text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .trim();

  // Count words
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Count lines
  const lines = cleaned.split('\n').filter(l => l.trim().length > 0);
  const lineCount = lines.length;

  // Split into chunks for processing (approx 500 words per chunk)
  const chunks = chunkText(cleaned, 500);

  return {
    content: cleaned,
    wordCount,
    lineCount,
    chunks
  };
}

/**
 * Split text into manageable chunks
 */
function chunkText(text, wordsPerChunk = 500) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    const chunkText = chunkWords.join(' ');

    chunks.push({
      index: chunks.length,
      content: chunkText,
      wordCount: chunkWords.length,
      startWord: i,
      endWord: Math.min(i + wordsPerChunk, words.length)
    });
  }

  return chunks;
}

/**
 * Calculate quality score for a document
 */
function calculateDocumentQuality(processed) {
  let score = 0.7; // Base score for user-uploaded documents

  const { wordCount, lineCount, content } = processed;

  // Word count bonus
  if (wordCount > 5000) score += 0.15;
  else if (wordCount > 2000) score += 0.10;
  else if (wordCount > 1000) score += 0.05;
  else if (wordCount < 200) score -= 0.2;

  // Structure bonus (has headings, lists, etc.)
  const hasHeadings = /#{1,6}\s|^[A-Z][^.!?]*:$/m.test(content);
  const hasBullets = /^[\s]*[-*•]\s/m.test(content);
  const hasNumbers = /\d{1,2}%|\$\d+|\d+,\d{3}/.test(content);

  if (hasHeadings) score += 0.05;
  if (hasBullets) score += 0.03;
  if (hasNumbers) score += 0.02;

  // Line density (not too sparse, not too dense)
  const avgWordsPerLine = wordCount / lineCount;
  if (avgWordsPerLine >= 8 && avgWordsPerLine <= 20) {
    score += 0.05;
  }

  return Math.min(1.0, Math.max(0, score));
}

/**
 * Process multiple documents in batch
 */
async function processBatchDocuments(files, fileContents) {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const result = await processDocument(files[i], fileContents[i]);
    results.push(result);
  }

  const stats = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    totalWords: results.reduce((sum, r) => sum + (r.metadata?.wordCount || 0), 0),
    totalChunks: results.reduce((sum, r) => sum + (r.metadata?.chunkCount || 0), 0)
  };

  return { results, stats };
}

/**
 * Convert processed document to research source format
 */
function documentToResearchSource(processed, userId, workflowId) {
  return {
    id: null, // Will be generated by database
    workflow_id: workflowId,
    user_id: userId,
    source_type: 'document',
    source_url: `#uploaded-doc-${Date.now()}`,
    source_title: processed.fileName,
    source_content: processed.content,
    fact_check_status: 'user-provided',
    is_starred: true, // User documents are automatically starred
    is_selected: true,
    word_count: processed.metadata.wordCount,
    content_length: processed.metadata.processedLength,
    quality_score: processed.metadata.quality,
    source_metadata: {
      file_type: processed.fileType,
      file_size: processed.fileSize,
      processing_method: processed.processingMethod,
      chunk_count: processed.metadata.chunkCount,
      original_length: processed.metadata.originalLength
    }
  };
}

/**
 * Validate document before processing
 */
function validateDocumentForProcessing(file) {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'application/json'
  ];

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.json'];

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Check file type
  const fileName = file.name.toLowerCase();
  const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  const hasAllowedType = allowedTypes.includes(file.type);

  if (!hasAllowedExtension && !hasAllowedType) {
    errors.push('File type not supported. Please use PDF, DOCX, DOC, TXT, or JSON files.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  processDocument,
  processBatchDocuments,
  documentToResearchSource,
  validateDocumentForProcessing,
  chunkText,
  calculateDocumentQuality
};
