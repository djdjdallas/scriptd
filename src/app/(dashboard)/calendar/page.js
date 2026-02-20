'use client';

import { useState, useEffect } from 'react';
import CalendarView from '@/components/calendar/CalendarView';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import ContentForm from '@/components/calendar/ContentForm';
import { Plus, Download, Filter, Loader2, Trash2 } from 'lucide-react';
import { loadFromStorage, saveToStorage } from '@/lib/calendar/storage';
import { exportToCSV, exportToICS } from '@/lib/calendar/export-utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function CalendarPage() {
  const [contents, setContents] = useState([]);
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteAllModal, setDeleteAllModal] = useState({ isOpen: false });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const supabase = createClient();

  // Fetch content from Supabase on mount
  useEffect(() => {
    fetchCalendarContent();
  }, []);

  const handleDeleteAll = () => {
    setDeleteAllModal({ isOpen: true });
  };

  const handleDeleteAllConfirm = async () => {
    setDeleteAllModal({ isOpen: false });
    setDeleteLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Delete all calendar events for the current user
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Clear local state
      setContents([]);
      toast.success('All calendar events deleted successfully');
    } catch (error) {
      console.error('Error deleting all events:', error);
      toast.error('Failed to delete all events');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAllCancel = () => {
    setDeleteAllModal({ isOpen: false });
  };

  const fetchCalendarContent = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        setLoading(false);
        return;
      }

      // Fetch calendar content from Supabase
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('user_id', user.id)
        .order('publish_date', { ascending: true });

      if (error) {
        console.error('Error fetching calendar:', error);
        toast.error('Failed to load calendar content');
      } else {
        // Transform data to match the expected format
        const transformedData = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          contentType: item.content_type,
          platform: item.platform,
          status: item.status,
          publishDate: item.publish_date,
          publishTime: item.publish_time,
          tags: item.tags || [],
          keywords: item.keywords || [],
          targetAudience: item.target_audience,
          estimatedDuration: item.estimated_duration_minutes,
          notes: item.notes,
          createdAt: item.created_at
        }));
        setContents(transformedData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (newContent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Log the content being inserted for debugging
      console.log('Inserting content:', newContent);

      const insertData = {
        user_id: user.id,
        title: newContent.title,
        description: newContent.description,
        content_type: newContent.type,  // Changed from contentType to type
        platform: newContent.platform,
        status: newContent.status || 'IDEA',
        publish_date: newContent.publishDate,
        publish_time: newContent.publishTime,
        tags: newContent.tags || [],
        keywords: newContent.keywords || [],
        target_audience: newContent.targetAudience,
        estimated_duration_minutes: newContent.estimatedTime,  // Changed from estimatedDuration to estimatedTime
        notes: newContent.notes
      };

      const { data, error } = await supabase
        .from('content_calendar')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      await fetchCalendarContent();
      setIsFormOpen(false);
      toast.success('Content added successfully');
    } catch (error) {
      console.error('Error adding content:', error.message || error);
      toast.error(error.message || 'Failed to add content');
    }
  };

  const handleEditContent = async (updatedContent) => {
    try {
      const { error } = await supabase
        .from('content_calendar')
        .update({
          title: updatedContent.title,
          description: updatedContent.description,
          content_type: updatedContent.type,  // Changed from contentType to type
          platform: updatedContent.platform,
          status: updatedContent.status,
          publish_date: updatedContent.publishDate,
          publish_time: updatedContent.publishTime,
          tags: updatedContent.tags || [],
          keywords: updatedContent.keywords || [],
          target_audience: updatedContent.targetAudience,
          estimated_duration_minutes: updatedContent.estimatedTime,  // Changed from estimatedDuration to estimatedTime
          notes: updatedContent.notes
        })
        .eq('id', updatedContent.id);

      if (error) throw error;
      
      await fetchCalendarContent();
      setSelectedContent(null);
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      
      await fetchCalendarContent();
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="vb-card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">
              Content Calendar
            </h1>
            <p className="text-gray-400 mt-2">
              Plan and organize your content across all platforms
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* Refresh Button */}
            <button 
              onClick={fetchCalendarContent}
              disabled={loading}
              className="vb-btn-outline flex items-center"
            >
              <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="vb-btn-outline flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/[0.04] border border-white/[0.06] rounded-xl border-white/10">
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

            {/* Delete All Button */}
            {contents.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                disabled={deleteLoading}
                variant="destructive"
                className="bg-red-600/30 hover:bg-red-600/40 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            )}

            {/* Add Content Button */}
            <button 
              onClick={() => setIsFormOpen(true)}
              className="vb-btn-outline bg-violet-600/20 hover:bg-violet-600/30 flex items-center"
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
      {loading ? (
        <div className="vb-card p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <span className="ml-3 text-gray-400">Loading calendar...</span>
        </div>
      ) : (
        <CalendarView
          contents={contents}
          view={view}
          currentDate={currentDate}
          onContentClick={setSelectedContent}
          onContentDrop={handleEditContent}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="vb-card p-4">
          <p className="text-gray-400 text-sm">Total Content</p>
          <p className="text-2xl font-bold text-white">{contents.length}</p>
        </div>
        
        <div className="vb-card p-4">
          <p className="text-gray-400 text-sm">This Month</p>
          <p className="text-2xl font-bold text-white">
            {contents.filter(c => {
              const contentMonth = new Date(c.publishDate).getMonth();
              return contentMonth === currentDate.getMonth();
            }).length}
          </p>
        </div>
        
        <div className="vb-card p-4">
          <p className="text-gray-400 text-sm">Scheduled</p>
          <p className="text-2xl font-bold text-white">
            {contents.filter(c => c.status === 'SCHEDULED').length}
          </p>
        </div>
        
        <div className="vb-card p-4">
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

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteAllModal.isOpen}
        onClose={handleDeleteAllCancel}
        onConfirm={handleDeleteAllConfirm}
        title="Delete All Calendar Events"
        message={`Are you sure you want to delete all ${contents.length} calendar events? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        loading={deleteLoading}
      />
    </div>
  );
}