'use client';

import { useState } from 'react';
import { getWeekDays, getContentForDay, sortContentByTime } from '@/lib/calendar/calendar-utils';
import { format, isToday } from 'date-fns';
import ContentCard from './ContentCard';
import { cn } from '@/lib/utils';
import { Clock, CalendarDays } from 'lucide-react';

export default function WeekView({ contents, currentDate, onContentClick }) {
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'hour'
  const days = getWeekDays(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getContentForHour = (day, hour) => {
    const dayContents = getContentForDay(contents, day);
    return dayContents.filter(content => {
      if (!content.publishTime) {
        // If no time specified, show at default hour (10 AM)
        return hour === 10;
      }
      
      // Handle both 24-hour format (10:00) and 12-hour format (10:00 AM)
      const timeString = content.publishTime;
      let contentHour;
      
      if (timeString.includes('AM') || timeString.includes('PM')) {
        // 12-hour format
        const [time, period] = timeString.split(' ');
        contentHour = parseInt(time.split(':')[0]);
        if (period === 'PM' && contentHour !== 12) contentHour += 12;
        if (period === 'AM' && contentHour === 12) contentHour = 0;
      } else {
        // 24-hour format
        contentHour = parseInt(timeString.split(':')[0]);
      }
      
      return contentHour === hour;
    });
  };

  // Day View - Simple columns for each day
  const DayView = () => (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day, index) => (
        <div key={index} className="space-y-2">
          <div className={cn(
            "text-center p-2 rounded glass",
            isToday(day) && "bg-purple-500/20"
          )}>
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
          
          <div className="space-y-2 min-h-[200px]">
            {sortContentByTime(getContentForDay(contents, day)).map(content => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={onContentClick}
                compact={true}
              />
            ))}
            {getContentForDay(contents, day).length === 0 && (
              <div className="text-xs text-gray-500 text-center p-4">
                No events
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="glass rounded-lg p-2 flex gap-2 w-fit">
        <button
          onClick={() => setViewMode('day')}
          className={cn(
            "px-3 py-1 rounded flex items-center gap-2 text-sm",
            viewMode === 'day' ? "glass bg-purple-600/30" : "hover:bg-white/10"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Day Columns
        </button>
        <button
          onClick={() => setViewMode('hour')}
          className={cn(
            "px-3 py-1 rounded flex items-center gap-2 text-sm",
            viewMode === 'hour' ? "glass bg-purple-600/30" : "hover:bg-white/10"
          )}
        >
          <Clock className="h-4 w-4" />
          Hourly Grid
        </button>
      </div>

      {/* Content View */}
      <div className="glass rounded-lg p-4 overflow-x-auto">
        {viewMode === 'day' ? (
          <DayView />
        ) : (
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

        {/* Hour rows - only show hours that have content or are during typical work hours */}
        <div className="space-y-1">
          {hours.map(hour => {
            // Check if this hour has any content across all days
            const hasContent = days.some(day => getContentForHour(day, hour).length > 0);
            // Show typical work hours (8 AM - 8 PM) or hours with content
            const showHour = hasContent || (hour >= 8 && hour <= 20);
            
            if (!showHour) return null;
            
            return (
              <div key={hour} className="grid grid-cols-8 gap-2">
                <div className="text-xs text-gray-400 p-2 text-right">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {days.map((day, dayIndex) => {
                  const hourContents = getContentForHour(day, hour);
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "min-h-[60px] p-1 border border-white/5 rounded hover:border-purple-500/30 transition-colors",
                        hourContents.length > 0 && "bg-purple-500/5"
                      )}
                    >
                      <div className="space-y-1">
                        {hourContents.map(content => (
                          <ContentCard
                            key={content.id}
                            content={content}
                            onClick={onContentClick}
                            compact={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
          </div>
        )}
      </div>
    </div>
  );
}