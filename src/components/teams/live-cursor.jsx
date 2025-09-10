'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

export default function LiveCursor({ cursors = [], className = '' }) {
  const [visibleCursors, setVisibleCursors] = useState([]);
  const containerRef = useRef(null);
  const cursorTimeouts = useRef(new Map());

  /**
   * Calculate cursor position relative to container
   */
  const calculateCursorPosition = (cursor) => {
    if (!containerRef.current || !cursor.position) return null;

    const container = containerRef.current;
    const field = cursor.field;
    
    // Find the input/textarea element for the field
    const fieldElement = container.querySelector(`[data-field="${field}"]`) || 
                        container.querySelector(`textarea[placeholder*="${field}"]`) ||
                        container.querySelector(`input[placeholder*="${field}"]`);
    
    if (!fieldElement) return null;

    const fieldRect = fieldElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate position within the text field
    const position = cursor.position;
    const text = fieldElement.value || '';
    
    // For textareas, we need to calculate line and column
    let x = 0;
    let y = 0;

    if (fieldElement.tagName === 'TEXTAREA') {
      // Calculate line breaks up to cursor position
      const textBeforeCursor = text.substring(0, position);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length - 1;
      const currentColumn = lines[lines.length - 1].length;

      // Estimate character width and line height
      const style = window.getComputedStyle(fieldElement);
      const fontSize = parseInt(style.fontSize);
      const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
      const charWidth = fontSize * 0.6; // Rough estimate for monospace

      x = currentColumn * charWidth + parseInt(style.paddingLeft);
      y = currentLine * lineHeight + parseInt(style.paddingTop);
    } else {
      // For input fields, it's simpler
      const style = window.getComputedStyle(fieldElement);
      const fontSize = parseInt(style.fontSize);
      const charWidth = fontSize * 0.6;
      
      x = position * charWidth + parseInt(style.paddingLeft);
      y = parseInt(style.paddingTop) + fontSize / 2;
    }

    return {
      x: fieldRect.left - containerRect.left + x,
      y: fieldRect.top - containerRect.top + y,
      field: field,
      fieldRect: {
        left: fieldRect.left - containerRect.left,
        top: fieldRect.top - containerRect.top,
        width: fieldRect.width,
        height: fieldRect.height
      }
    };
  };

  /**
   * Update cursor visibility with timeout
   */
  useEffect(() => {
    const updatedCursors = cursors
      .map(cursor => ({
        ...cursor,
        position: calculateCursorPosition(cursor),
        timestamp: Date.now()
      }))
      .filter(cursor => cursor.position !== null);

    setVisibleCursors(updatedCursors);

    // Set timeout to hide inactive cursors
    cursors.forEach(cursor => {
      const timeoutKey = cursor.userId;
      
      // Clear existing timeout
      if (cursorTimeouts.current.has(timeoutKey)) {
        clearTimeout(cursorTimeouts.current.get(timeoutKey));
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        setVisibleCursors(prev => prev.filter(c => c.userId !== cursor.userId));
        cursorTimeouts.current.delete(timeoutKey);
      }, 5000); // Hide after 5 seconds of inactivity

      cursorTimeouts.current.set(timeoutKey, timeout);
    });

    return () => {
      // Clean up timeouts
      for (const timeout of cursorTimeouts.current.values()) {
        clearTimeout(timeout);
      }
      cursorTimeouts.current.clear();
    };
  }, [cursors]);

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      for (const timeout of cursorTimeouts.current.values()) {
        clearTimeout(timeout);
      }
    };
  }, []);

  if (visibleCursors.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-20 ${className}`}
    >
      {visibleCursors.map(cursor => {
        if (!cursor.position) return null;
        
        const { x, y, field, fieldRect } = cursor.position;
        const profile = cursor.profile;

        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translateX(-1px)'
            }}
          >
            {/* Cursor line */}
            <div
              className="w-0.5 h-5 animate-pulse"
              style={{ backgroundColor: profile.color || '#8b5cf6' }}
            />
            
            {/* User label */}
            <div
              className="absolute -top-8 left-0 whitespace-nowrap transform -translate-x-1/2"
              style={{ minWidth: 'fit-content' }}
            >
              <Badge
                className="px-2 py-1 text-xs font-medium border-0 shadow-lg"
                style={{
                  backgroundColor: profile.color || '#8b5cf6',
                  color: 'white'
                }}
              >
                {profile.full_name || profile.email}
              </Badge>
            </div>

            {/* Selection highlight */}
            {cursor.selection && (
              <div
                className="absolute rounded opacity-30"
                style={{
                  backgroundColor: profile.color || '#8b5cf6',
                  left: `${Math.min(cursor.selection.start, cursor.selection.end) * 0.6}px`,
                  width: `${Math.abs(cursor.selection.end - cursor.selection.start) * 0.6}px`,
                  height: '20px',
                  top: '-2px'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Cursor component for individual text fields
 */
export function FieldCursor({ field, cursors = [], className = '' }) {
  const [fieldCursors, setFieldCursors] = useState([]);
  const fieldRef = useRef(null);

  useEffect(() => {
    const relevantCursors = cursors.filter(cursor => cursor.field === field);
    setFieldCursors(relevantCursors);
  }, [cursors, field]);

  const calculateRelativePosition = (position, element) => {
    if (!element) return null;

    const style = window.getComputedStyle(element);
    const fontSize = parseInt(style.fontSize);
    const charWidth = fontSize * 0.6;
    const paddingLeft = parseInt(style.paddingLeft);

    if (element.tagName === 'TEXTAREA') {
      const text = element.value || '';
      const textBeforeCursor = text.substring(0, position);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length - 1;
      const currentColumn = lines[lines.length - 1].length;

      const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
      const paddingTop = parseInt(style.paddingTop);

      return {
        x: currentColumn * charWidth + paddingLeft,
        y: currentLine * lineHeight + paddingTop
      };
    } else {
      return {
        x: position * charWidth + paddingLeft,
        y: parseInt(style.paddingTop) + fontSize / 2
      };
    }
  };

  if (fieldCursors.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {fieldCursors.map(cursor => {
        const position = calculateRelativePosition(cursor.position, fieldRef.current);
        if (!position) return null;

        return (
          <div
            key={cursor.userId}
            className="absolute"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`
            }}
          >
            <div
              className="w-0.5 h-4 animate-pulse"
              style={{ backgroundColor: cursor.profile.color }}
            />
            <div className="absolute -top-6 left-0 transform -translate-x-1/2">
              <Badge
                className="px-1 py-0.5 text-xs"
                style={{
                  backgroundColor: cursor.profile.color,
                  color: 'white'
                }}
              >
                {cursor.profile.full_name || cursor.profile.email}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Typing indicator component
 */
export function TypingIndicator({ users = [], field = null, className = '' }) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].full_name || users[0].email} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].full_name || users[0].email} and ${users[1].full_name || users[1].email} are typing...`;
    } else {
      return `${users[0].full_name || users[0].email} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-400 animate-pulse ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
      <span className="text-green-300">{getTypingText()}</span>
    </div>
  );
}

/**
 * Active editors indicator
 */
export function ActiveEditorsIndicator({ editors = [], field = null, className = '' }) {
  if (editors.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-1">
        {editors.slice(0, 3).map(editor => (
          <div
            key={editor.id}
            className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: editor.color }}
            title={editor.full_name || editor.email}
          >
            {(editor.full_name || editor.email)[0].toUpperCase()}
          </div>
        ))}
        {editors.length > 3 && (
          <div className="w-4 h-4 rounded-full border border-white bg-gray-600 flex items-center justify-center text-xs font-bold">
            +{editors.length - 3}
          </div>
        )}
      </div>
      <span className="text-xs text-blue-300">
        {editors.length} editing
      </span>
    </div>
  );
}