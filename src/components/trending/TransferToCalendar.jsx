'use client';

import { useState } from 'react';
import {
  Calendar,
  CalendarPlus,
  CheckCircle,
  AlertCircle,
  Settings,
  Clock,
  MapPin,
  Users,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function TransferToCalendar({ actionPlan, actionPlanId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    startDate: new Date().toISOString().split('T')[0],
    skipWeekends: false,
    autoSchedule: true,
    includeContentIdeas: true,
    includeKeywords: true,
    defaultTime: '10:00',
    timezone: 'UTC',
    reminderDays: 1,
    platform: 'youtube'
  });

  const handleTransfer = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/trending/transfer-to-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionPlan,
          actionPlanId,
          options
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transfer to calendar');
      }

      const result = await response.json();
      
      toast.success(
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          <div>
            <p className="font-semibold">Successfully added to calendar!</p>
            <p className="text-sm text-gray-400 mt-1">
              {result.data.eventsCreated} events created • {result.data.tasksAdded} tasks • {result.data.videosScheduled} videos
            </p>
          </div>
        </div>
      );
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error transferring to calendar:', error);
      toast.error(
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div>
            <p className="font-semibold">Failed to add to calendar</p>
            <p className="text-sm text-gray-400 mt-1">{error.message}</p>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const getEventCount = () => {
    let count = 0;
    if (actionPlan.weeklyPlan) {
      actionPlan.weeklyPlan.forEach(week => {
        count += week.tasks?.length || 0;
      });
    }
    if (options.includeContentIdeas && actionPlan.contentIdeas) {
      count += actionPlan.contentIdeas.length;
    }
    count += 4; // Milestones
    if (actionPlan.contentTemplates) {
      count += actionPlan.contentTemplates.length;
    }
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-200"
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Add to Content Calendar
          <Sparkles className="h-3 w-3 ml-2 animate-pulse" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-400" />
            Transfer Action Plan to Calendar
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            Configure how you want to schedule your 30-day action plan in your content calendar.
            This will create approximately {getEventCount()} calendar events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Schedule Settings */}
          <div className="glass-card p-4 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              Schedule Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  value={options.startDate}
                  onChange={(e) => setOptions({ ...options, startDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [color-scheme:dark]"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="defaultTime" className="text-gray-300">Default Time</Label>
                <input
                  id="defaultTime"
                  type="time"
                  value={options.defaultTime}
                  onChange={(e) => setOptions({ ...options, defaultTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                <Select
                  value={options.timezone}
                  onValueChange={(value) => setOptions({ ...options, timezone: value })}
                >
                  <SelectTrigger id="timezone" className="w-full mt-1 bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-700">
                    <SelectItem value="UTC" className="text-white hover:bg-gray-700 focus:bg-gray-700">UTC</SelectItem>
                    <SelectItem value="America/New_York" className="text-white hover:bg-gray-700 focus:bg-gray-700">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago" className="text-white hover:bg-gray-700 focus:bg-gray-700">Central Time</SelectItem>
                    <SelectItem value="America/Denver" className="text-white hover:bg-gray-700 focus:bg-gray-700">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles" className="text-white hover:bg-gray-700 focus:bg-gray-700">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London" className="text-white hover:bg-gray-700 focus:bg-gray-700">London</SelectItem>
                    <SelectItem value="Europe/Paris" className="text-white hover:bg-gray-700 focus:bg-gray-700">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo" className="text-white hover:bg-gray-700 focus:bg-gray-700">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reminderDays" className="text-gray-300">Reminder Days Before</Label>
                <Select
                  value={options.reminderDays.toString()}
                  onValueChange={(value) => setOptions({ ...options, reminderDays: parseInt(value) })}
                >
                  <SelectTrigger id="reminderDays" className="w-full mt-1 bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border border-gray-700">
                    <SelectItem value="0" className="text-white hover:bg-gray-700 focus:bg-gray-700">No reminder</SelectItem>
                    <SelectItem value="1" className="text-white hover:bg-gray-700 focus:bg-gray-700">1 day before</SelectItem>
                    <SelectItem value="2" className="text-white hover:bg-gray-700 focus:bg-gray-700">2 days before</SelectItem>
                    <SelectItem value="3" className="text-white hover:bg-gray-700 focus:bg-gray-700">3 days before</SelectItem>
                    <SelectItem value="7" className="text-white hover:bg-gray-700 focus:bg-gray-700">1 week before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content Options */}
          <div className="glass-card p-4 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-400" />
              Content Options
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="skipWeekends" className="text-gray-300">Skip weekends</Label>
                <Switch
                  id="skipWeekends"
                  checked={options.skipWeekends}
                  onCheckedChange={(checked) => setOptions({ ...options, skipWeekends: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSchedule" className="text-gray-300">Auto-schedule tasks</Label>
                <Switch
                  id="autoSchedule"
                  checked={options.autoSchedule}
                  onCheckedChange={(checked) => setOptions({ ...options, autoSchedule: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeContentIdeas" className="text-gray-300">Include content ideas</Label>
                <Switch
                  id="includeContentIdeas"
                  checked={options.includeContentIdeas}
                  onCheckedChange={(checked) => setOptions({ ...options, includeContentIdeas: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeKeywords" className="text-gray-300">Include keywords</Label>
                <Switch
                  id="includeKeywords"
                  checked={options.includeKeywords}
                  onCheckedChange={(checked) => setOptions({ ...options, includeKeywords: checked })}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <h3 className="text-white font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Tasks to schedule:</span>
                <span className="text-white font-medium">
                  {actionPlan.weeklyPlan?.reduce((acc, week) => acc + (week.tasks?.length || 0), 0) || 0}
                </span>
              </div>
              {options.includeContentIdeas && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Content ideas:</span>
                  <span className="text-white font-medium">{actionPlan.contentIdeas?.length || 0}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Milestones:</span>
                <span className="text-white font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Templates:</span>
                <span className="text-white font-medium">{actionPlan.contentTemplates?.length || 0}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-300">Total events:</span>
                  <span className="text-purple-400">{getEventCount()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="glass-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={loading}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding to Calendar...
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add {getEventCount()} Events
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}