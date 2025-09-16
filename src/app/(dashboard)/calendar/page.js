'use client';

import { useState, useEffect } from 'react';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import ContentForm from '@/components/calendar/ContentForm';
import { Plus, Download, Filter, Sparkles } from 'lucide-react';
import { loadFromStorage, saveToStorage } from '@/lib/calendar/storage';
import { exportToCSV, exportToICS } from '@/lib/calendar/export-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CalendarPage() {
  const [contents, setContents] = useState([]);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = loadFromStorage('contentCalendar');
    if (savedContent) {
      setContents(savedContent);
    }
  }, []);

  // Save content whenever it changes
  useEffect(() => {
    saveToStorage('contentCalendar', contents);
  }, [contents]);

  const handleAddContent = (newContent) => {
    const contentWithId = {
      ...newContent,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setContents([...contents, contentWithId]);
    setIsFormOpen(false);
  };

  const handleEditContent = (updatedContent) => {
    setContents(contents.map(c => 
      c.id === updatedContent.id ? updatedContent : c
    ));
    setSelectedContent(null);
  };

  const handleDeleteContent = (contentId) => {
    setContents(contents.filter(c => c.id !== contentId));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Content Calendar
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 mt-2">
              Plan and organize your content across all platforms
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Export Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="glass-button flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass border-white/10">
                <DropdownMenuItem 
                  onClick={() => exportToCSV(contents)}
                  className="hover:bg-white/10"
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => exportToICS(contents)}
                  className="hover:bg-white/10"
                >
                  Export to Calendar (.ics)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Content Button */}
            <button 
              onClick={() => setIsFormOpen(true)}
              className="glass-button bg-purple-600/30 hover:bg-purple-600/40 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Header with Navigation */}
      <CalendarHeader
        view={view}
        setView={setView}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      {/* Calendar View */}
      <CalendarView
        contents={contents}
        view={view}
        currentDate={currentDate}
        onContentClick={setSelectedContent}
        onContentDrop={handleEditContent}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total Content</p>
          <p className="text-2xl font-bold text-white">{contents.length}</p>
        </div>
        
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">This Month</p>
          <p className="text-2xl font-bold text-white">
            {contents.filter(c => {
              const contentMonth = new Date(c.publishDate).getMonth();
              return contentMonth === currentDate.getMonth();
            }).length}
          </p>
        </div>
        
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Scheduled</p>
          <p className="text-2xl font-bold text-white">
            {contents.filter(c => c.status === 'SCHEDULED').length}
          </p>
        </div>
        
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Published</p>
          <p className="text-2xl font-bold text-white">
            {contents.filter(c => c.status === 'PUBLISHED').length}
          </p>
        </div>
      </div>

      {/* Content Form Modal */}
      {(isFormOpen || selectedContent) && (
        <ContentForm
          content={selectedContent}
          onSave={selectedContent ? handleEditContent : handleAddContent}
          onDelete={selectedContent ? () => handleDeleteContent(selectedContent.id) : null}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedContent(null);
          }}
        />
      )}
    </div>
  );
}