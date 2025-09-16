'use client';

import { getMonthDays, getContentForDay, sortContentByTime } from '@/lib/calendar/calendar-utils';
import { format, isSameMonth, isToday } from 'date-fns';
import ContentCard from './ContentCard';
import { cn } from '@/lib/utils';

export default function CalendarGrid({ contents, currentDate, onContentClick }) {
  const days = getMonthDays(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass rounded-lg p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayContents = sortContentByTime(getContentForDay(contents, day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 rounded-lg border transition-all",
                isCurrentMonth 
                  ? "glass border-white/10 hover:border-purple-500/50" 
                  : "glass opacity-50 border-white/5",
                isTodayDate && "ring-2 ring-purple-500 border-purple-500"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentMonth ? "text-white" : "text-gray-500",
                  isTodayDate && "text-purple-400"
                )}>
                  {format(day, 'd')}
                </span>
                {dayContents.length > 0 && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                    {dayContents.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayContents.slice(0, 3).map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onClick={onContentClick}
                    compact={true}
                  />
                ))}
                {dayContents.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{dayContents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}