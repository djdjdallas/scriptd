'use client';

import { useState } from 'react';
import { Clock, Hash, Target, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { PLATFORMS, CONTENT_TYPES, CONTENT_STATUS, BEST_POSTING_TIMES } from '@/lib/calendar/constants';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function ContentForm({ content, onSave, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    type: '',
    status: 'IDEA',
    publishDate: new Date(),
    publishTime: '12:00 PM',
    description: '',
    tags: [],
    keywords: [],
    targetAudience: '',
    estimatedTime: 60,
    performanceGoals: '',
    notes: '',
    ...content
  });

  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.platform) newErrors.platform = 'Platform is required';
    if (!formData.type) newErrors.type = 'Content type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const suggestBestTime = () => {
    if (formData.platform) {
      const times = BEST_POSTING_TIMES[formData.platform];
      if (times && times.length > 0) {
        setFormData({
          ...formData,
          publishTime: times[0]
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card border border-white/10 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {content ? 'Edit Content' : 'Add New Content'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter content title"
              className={`glass-input w-full ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Platform and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className={`glass-input w-full ${errors.platform ? 'border-red-500' : ''}`}
              >
                <option value="" className="bg-gray-900">Select platform</option>
                {Object.entries(PLATFORMS).map(([key, platform]) => (
                  <option key={key} value={key} className="bg-gray-900">
                    {platform.name}
                  </option>
                ))}
              </select>
              {errors.platform && <p className="text-sm text-red-500 mt-1">{errors.platform}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className={`glass-input w-full ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="" className="bg-gray-900">Select type</option>
                {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                  <option key={key} value={key} className="bg-gray-900">
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
            </div>
          </div>

          {/* Date, Time, and Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Publish Date</label>
              <input
                type="date"
                value={format(formData.publishDate, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({...formData, publishDate: new Date(e.target.value)})}
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Publish Time</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={formData.publishTime}
                  onChange={(e) => setFormData({...formData, publishTime: e.target.value})}
                  placeholder="12:00 PM"
                  className="glass-input flex-1"
                />
                <button 
                  type="button"
                  onClick={suggestBestTime}
                  title="Suggest best time"
                  className="glass-button p-2 flex items-center justify-center h-10"
                >
                  <Clock className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="glass-input w-full"
              >
                {Object.entries(CONTENT_STATUS).map(([key, status]) => (
                  <option key={key} value={key} className="bg-gray-900">
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Content description, outline, or script..."
              rows={4}
              className="glass-input w-full resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm glass bg-white/10 border border-white/20">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tags (press Enter)"
              className="glass-input w-full"
            />
          </div>

          {/* Keywords/Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Hash className="inline h-4 w-4 mr-1" />
              Keywords/Hashtags
            </label>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              placeholder="Add keywords (press Enter)"
              className="glass-input w-full"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.keywords?.map((keyword, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm glass border border-white/20 text-gray-300">
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                placeholder="e.g., Young professionals, Parents"
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({...formData, estimatedTime: parseInt(e.target.value)})}
                min="0"
                className="glass-input w-full"
              />
            </div>
          </div>

          {/* Performance Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Target className="inline h-4 w-4 mr-1" />
              Performance Goals
            </label>
            <input
              type="text"
              value={formData.performanceGoals}
              onChange={(e) => setFormData({...formData, performanceGoals: e.target.value})}
              placeholder="e.g., 10K views, 500 likes, 50 comments"
              className="glass-input w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes or reminders..."
              rows={2}
              className="glass-input w-full resize-none"
            />
          </div>
        </form>

        <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
          <div>
            {content && onDelete && (
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: true })}
                className="glass-button bg-red-600/30 hover:bg-red-600/40 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="glass-button flex items-center">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="glass-button bg-purple-600/30 hover:bg-purple-600/40 flex items-center">
              {content ? 'Update' : 'Add'} Content
            </button>
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={() => {
          onDelete();
          onClose();
          setDeleteModal({ isOpen: false });
        }}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}