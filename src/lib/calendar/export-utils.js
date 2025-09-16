import { format } from 'date-fns';
import { PLATFORMS, CONTENT_STATUS, CONTENT_TYPES } from './constants';

export const exportToCSV = (contents, filename = 'content-calendar') => {
  const headers = [
    'Title', 'Platform', 'Type', 'Status', 'Publish Date', 
    'Publish Time', 'Description', 'Tags', 'Keywords', 
    'Target Audience', 'Estimated Time', 'Performance Goals', 'Notes'
  ];

  const rows = contents.map(content => [
    content.title,
    PLATFORMS[content.platform]?.name || content.platform,
    CONTENT_TYPES[content.type] || content.type,
    CONTENT_STATUS[content.status]?.name || content.status,
    format(new Date(content.publishDate), 'yyyy-MM-dd'),
    content.publishTime,
    content.description,
    content.tags?.join(', ') || '',
    content.keywords?.join(', ') || '',
    content.targetAudience || '',
    content.estimatedTime || '',
    content.performanceGoals || '',
    content.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportToICS = (contents, filename = 'content-calendar') => {
  const icsEvents = contents.map(content => {
    const startDate = new Date(content.publishDate);
    const endDate = new Date(startDate.getTime() + (content.estimatedTime || 60) * 60000);
    
    return `BEGIN:VEVENT
UID:${content.id}@contentcalendar
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${content.title}
DESCRIPTION:${content.description || ''}
LOCATION:${PLATFORMS[content.platform]?.name || content.platform}
STATUS:CONFIRMED
END:VEVENT`;
  }).join('\n');

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Content Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsEvents}
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.ics`;
  link.click();
};

function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}