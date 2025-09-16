'use client';

import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import ContentCard from './ContentCard';
import { PLATFORMS } from '@/lib/calendar/constants';

export default function ListView({ contents, currentDate, onContentClick }) {
  // Group contents by date
  const groupedContents = contents.reduce((groups, content) => {
    const date = format(new Date(content.publishDate), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(content);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedContents).sort();

  // Filter to show current month and upcoming
  const filteredDates = sortedDates.filter(date => {
    const contentDate = new Date(date);
    const monthStart = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    return isAfter(contentDate, monthStart) || format(contentDate, 'yyyy-MM-dd') === format(monthStart, 'yyyy-MM-dd');
  });

  return (
    <div className="glass rounded-lg p-4">
      <div className="space-y-6">
        {filteredDates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No content scheduled</p>
          </div>
        ) : (
          filteredDates.map(date => {
            const dayContents = groupedContents[date].sort((a, b) => {
              const timeA = a.publishTime || '00:00';
              const timeB = b.publishTime || '00:00';
              return timeA.localeCompare(timeB);
            });

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {dayContents.length} item{dayContents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {dayContents.map(content => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onClick={onContentClick}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}