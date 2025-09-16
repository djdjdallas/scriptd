'use client';

import { getWeekDays, getContentForDay, sortContentByTime } from '@/lib/calendar/calendar-utils';
import { format, isToday } from 'date-fns';
import ContentCard from './ContentCard';
import { cn } from '@/lib/utils';

export default function WeekView({ contents, currentDate, onContentClick }) {
  const days = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getContentForHour = (day, hour) => {
    const dayContents = getContentForDay(contents, day);
    return dayContents.filter(content => {
      const contentHour = parseInt(content.publishTime?.split(':')[0] || '0');
      return contentHour === hour || (contentHour === 12 && hour === 0 && content.publishTime?.includes('AM'));
    });
  };

  return (
    <div className="glass rounded-lg p-4 overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-2 mb-2">
          <div className="text-sm font-medium text-gray-400 p-2">Time</div>
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "text-center p-2 rounded",
                isToday(day) && "glass bg-purple-500/20"
              )}
            >
              <div className="text-sm font-medium text-gray-400">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isToday(day) ? "text-purple-400" : "text-white"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Hour rows */}
        <div className="space-y-1">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-2">
              <div className="text-xs text-gray-400 p-2">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              {days.map((day, dayIndex) => {
                const hourContents = getContentForHour(day, hour);
                return (
                  <div
                    key={dayIndex}
                    className="min-h-[60px] p-1 border border-white/5 rounded hover:border-purple-500/30 transition-colors"
                  >
                    {hourContents.map(content => (
                      <ContentCard
                        key={content.id}
                        content={content}
                        onClick={onContentClick}
                        compact={true}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}