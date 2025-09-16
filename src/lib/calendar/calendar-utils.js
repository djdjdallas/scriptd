import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, format, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

export const getMonthDays = (date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const startWeek = startOfWeek(start);
  const endWeek = endOfWeek(end);
  
  return eachDayOfInterval({ start: startWeek, end: endWeek });
};

export const getWeekDays = (date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  
  return eachDayOfInterval({ start, end });
};

export const navigateMonth = (currentDate, direction) => {
  return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
};

export const formatMonthYear = (date) => {
  return format(date, 'MMMM yyyy');
};

export const formatWeekRange = (date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  
  if (isSameMonth(start, end)) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
  } else {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
};

export const getContentForDay = (contents, day) => {
  return contents.filter(content => 
    isSameDay(new Date(content.publishDate), day)
  );
};

export const sortContentByTime = (contents) => {
  return contents.sort((a, b) => {
    const timeA = parseTime(a.publishTime);
    const timeB = parseTime(b.publishTime);
    return timeA - timeB;
  });
};

const parseTime = (timeString) => {
  if (!timeString) return 0;
  
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour = hours;
  if (period === 'PM' && hours !== 12) hour += 12;
  if (period === 'AM' && hours === 12) hour = 0;
  
  return hour * 60 + (minutes || 0);
};