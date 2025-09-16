'use client';

import CalendarGrid from './CalendarGrid';
import WeekView from './WeekView';
import ListView from './ListView';

export default function CalendarView({ contents, view, currentDate, onContentClick, onContentDrop }) {
  switch (view) {
    case 'week':
      return (
        <WeekView
          contents={contents}
          currentDate={currentDate}
          onContentClick={onContentClick}
        />
      );
    case 'list':
      return (
        <ListView
          contents={contents}
          currentDate={currentDate}
          onContentClick={onContentClick}
        />
      );
    case 'month':
    default:
      return (
        <CalendarGrid
          contents={contents}
          currentDate={currentDate}
          onContentClick={onContentClick}
        />
      );
  }
}