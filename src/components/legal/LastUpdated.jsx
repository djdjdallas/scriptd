import React from 'react';
import { Calendar } from 'lucide-react';

export default function LastUpdated({ date }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-8">
      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
        Last Updated: {date}
      </span>
    </div>
  );
}
