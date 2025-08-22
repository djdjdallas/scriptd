/**
 * Streaming utilities for AI responses
 * @module lib/ai/streaming
 */

/**
 * Create a Server-Sent Events (SSE) response
 * @param {AsyncGenerator|ReadableStream} stream - Stream to convert to SSE
 * @param {Object} options - SSE options
 * @param {Object} [options.headers={}] - Additional headers
 * @param {Function} [options.onError] - Error handler
 * @returns {Response} SSE response
 */
export function createSSEResponse(stream, options = {}) {
  const { headers = {}, onError } = options;

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const data = formatSSEMessage(chunk);
          controller.enqueue(encoder.encode(data));
        }
        
        // Send final done message
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        if (onError) {
          onError(error);
        }
        
        // Send error message
        const errorData = formatSSEMessage({
          type: 'error',
          error: error.message
        });
        controller.enqueue(encoder.encode(errorData));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...headers
    }
  });
}

/**
 * Format a message for SSE
 * @param {Object} data - Data to format
 * @returns {string} Formatted SSE message
 */
export function formatSSEMessage(data) {
  const json = JSON.stringify(data);
  return `data: ${json}\n\n`;
}

/**
 * Parse SSE stream
 * @param {ReadableStream} stream - SSE stream
 * @returns {AsyncGenerator} Parsed messages
 */
export async function* parseSSEStream(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') {
          return;
        }
        
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (error) {
            console.warn('Failed to parse SSE data:', line, error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Transform stream with accumulation
 * @param {AsyncGenerator} stream - Input stream
 * @param {Function} transformer - Transform function
 * @returns {AsyncGenerator} Transformed stream
 */
export async function* transformStream(stream, transformer) {
  let accumulated = '';
  
  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      accumulated += chunk.content;
      const transformed = await transformer(chunk, accumulated);
      if (transformed !== null) {
        yield transformed;
      }
    } else {
      yield chunk;
    }
  }
}

/**
 * Buffer stream chunks
 * @param {AsyncGenerator} stream - Input stream
 * @param {number} bufferSize - Buffer size in characters
 * @returns {AsyncGenerator} Buffered stream
 */
export async function* bufferStream(stream, bufferSize = 100) {
  let buffer = '';
  
  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      buffer += chunk.content;
      
      while (buffer.length >= bufferSize) {
        const content = buffer.slice(0, bufferSize);
        buffer = buffer.slice(bufferSize);
        yield {
          ...chunk,
          content,
          buffered: true
        };
      }
    } else if (chunk.type === 'done' && buffer.length > 0) {
      // Flush remaining buffer
      yield {
        type: 'content',
        content: buffer,
        buffered: true
      };
      yield chunk;
    } else {
      yield chunk;
    }
  }
}

/**
 * Throttle stream chunks
 * @param {AsyncGenerator} stream - Input stream
 * @param {number} delay - Delay between chunks in ms
 * @returns {AsyncGenerator} Throttled stream
 */
export async function* throttleStream(stream, delay = 50) {
  let lastEmit = 0;
  
  for await (const chunk of stream) {
    const now = Date.now();
    const timeSinceLastEmit = now - lastEmit;
    
    if (timeSinceLastEmit < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastEmit));
    }
    
    lastEmit = Date.now();
    yield chunk;
  }
}

/**
 * Merge multiple streams
 * @param {Array<AsyncGenerator>} streams - Streams to merge
 * @returns {AsyncGenerator} Merged stream
 */
export async function* mergeStreams(streams) {
  const iterators = streams.map(s => s[Symbol.asyncIterator]());
  const results = new Array(streams.length).fill(null);
  const done = new Array(streams.length).fill(false);
  
  while (!done.every(d => d)) {
    for (let i = 0; i < iterators.length; i++) {
      if (!done[i] && !results[i]) {
        iterators[i].next().then(
          result => {
            if (result.done) {
              done[i] = true;
            } else {
              results[i] = result.value;
            }
          },
          error => {
            done[i] = true;
            throw error;
          }
        );
      }
    }
    
    // Yield available results
    for (let i = 0; i < results.length; i++) {
      if (results[i] !== null) {
        yield {
          streamIndex: i,
          ...results[i]
        };
        results[i] = null;
      }
    }
    
    // Small delay to prevent tight loop
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

/**
 * Split stream content by delimiter
 * @param {AsyncGenerator} stream - Input stream
 * @param {string} delimiter - Delimiter to split by
 * @returns {AsyncGenerator} Split stream
 */
export async function* splitStream(stream, delimiter = '\n') {
  let buffer = '';
  
  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      buffer += chunk.content;
      const parts = buffer.split(delimiter);
      buffer = parts.pop() || '';
      
      for (const part of parts) {
        if (part.trim()) {
          yield {
            type: 'content',
            content: part + delimiter,
            split: true
          };
        }
      }
    } else if (chunk.type === 'done' && buffer.trim()) {
      // Yield remaining buffer
      yield {
        type: 'content',
        content: buffer,
        split: true
      };
      yield chunk;
    } else {
      yield chunk;
    }
  }
}

/**
 * Create a stream transformer for Next.js API routes
 * @param {AsyncGenerator} stream - AI stream
 * @param {Object} options - Options
 * @param {Function} [options.onStart] - Called when stream starts
 * @param {Function} [options.onToken] - Called for each token
 * @param {Function} [options.onComplete] - Called when stream completes
 * @param {Function} [options.onError] - Called on error
 * @returns {ReadableStream} Transformed stream
 */
export function createNextJSStream(stream, options = {}) {
  const { onStart, onToken, onComplete, onError } = options;
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      if (onStart) {
        onStart();
      }

      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content') {
            if (onToken) {
              onToken(chunk.content);
            }
            controller.enqueue(encoder.encode(chunk.content));
          } else if (chunk.type === 'done') {
            if (onComplete) {
              onComplete(chunk);
            }
          }
        }
      } catch (error) {
        if (onError) {
          onError(error);
        }
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });
}

/**
 * Stream response handler for API routes
 * @param {Function} handler - Async handler function
 * @returns {Function} API route handler
 */
export function streamHandler(handler) {
  return async (req, res) => {
    try {
      const stream = await handler(req, res);
      
      if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
        throw new Error('Handler must return an async iterator');
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      for await (const chunk of stream) {
        const data = formatSSEMessage(chunk);
        res.write(data);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('Stream handler error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        const errorData = formatSSEMessage({
          type: 'error',
          error: error.message
        });
        res.write(errorData);
        res.end();
      }
    }
  };
}