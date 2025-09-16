'use client';

import { PLATFORMS, CONTENT_STATUS } from '@/lib/calendar/constants';
import { Clock, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContentCard({ content, onClick, compact = false }) {
  const platform = PLATFORMS[content.platform];
  const status = CONTENT_STATUS[content.status];

  if (compact) {
    return (
      <div
        onClick={() => onClick(content)}
        className="glass p-2 rounded cursor-pointer hover:scale-105 transition-transform"
        style={{ borderLeft: `3px solid ${platform?.color}` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-white truncate flex-1">{content.title}</p>
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 ml-1" 
            style={{ backgroundColor: status?.color }}
            title={status?.name}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{content.publishTime}</p>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(content)}
      className="glass p-4 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ borderTop: `4px solid ${platform?.color}` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-white">{content.title}</h4>
          <p className="text-sm text-gray-400 mt-1">{platform?.name}</p>
        </div>
        <div 
          className="px-2 py-1 rounded text-xs font-medium text-white"
          style={{ backgroundColor: status?.color }}
        >
          {status?.name}
        </div>
      </div>

      {content.description && (
        <p className="text-sm text-gray-300 line-clamp-2 mb-2">
          {content.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400">
        {content.publishTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {content.publishTime}
          </div>
        )}
        
        {content.targetAudience && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {content.targetAudience}
          </div>
        )}
        
        {content.performanceGoals && (
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {content.performanceGoals}
          </div>
        )}
      </div>

      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {content.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
            >
              {tag}
            </span>
          ))}
          {content.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{content.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}