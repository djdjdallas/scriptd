'use client';

import { ChevronLeft, ChevronRight, Calendar, List, Grid3x3 } from 'lucide-react';
import { formatMonthYear, formatWeekRange, navigateMonth } from '@/lib/calendar/calendar-utils';
import { addWeeks, subWeeks } from 'date-fns';

export default function CalendarHeader({ view, setView, currentDate, setCurrentDate }) {
  const handleNavigation = (direction) => {
    if (view === 'month') {
      setCurrentDate(navigateMonth(currentDate, direction));
    } else if (view === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateDisplay = () => {
    if (view === 'month') return formatMonthYear(currentDate);
    if (view === 'week') return formatWeekRange(currentDate);
    return formatMonthYear(currentDate);
  };

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigation('prev')}
            className="glass-button p-2 flex items-center justify-center h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleToday}
            className="glass-button px-4 py-2"
          >
            Today
          </button>
          
          <button
            onClick={() => handleNavigation('next')}
            className="glass-button p-2 flex items-center justify-center h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <h2 className="text-xl font-semibold text-white ml-4">
            {getDateDisplay()}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={view === 'month' ? 'glass-button bg-purple-600/30 hover:bg-purple-600/40 flex items-center px-3 py-1.5' : 'glass-button flex items-center px-3 py-1.5'}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Month
          </button>
          
          <button
            onClick={() => setView('week')}
            className={view === 'week' ? 'glass-button bg-purple-600/30 hover:bg-purple-600/40 flex items-center px-3 py-1.5' : 'glass-button flex items-center px-3 py-1.5'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Week
          </button>
          
          <button
            onClick={() => setView('list')}
            className={view === 'list' ? 'glass-button bg-purple-600/30 hover:bg-purple-600/40 flex items-center px-3 py-1.5' : 'glass-button flex items-center px-3 py-1.5'}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </button>
        </div>
      </div>
    </div>
  );
}