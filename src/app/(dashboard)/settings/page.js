'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TiltCard } from '@/components/ui/tilt-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  CreditCard,
  LogOut,
  Save,
  Sparkles,
  Moon,
  Sun,
  Volume2,
  Zap,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Trash2,
  FileText
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    // Profile
    displayName: '',
    email: '',
    
    // Notifications
    emailNotifications: true,
    scriptCompleted: true,
    weeklyReport: false,
    marketingEmails: false,
    
    // Preferences
    theme: 'dark',
    language: 'en',
    autoSave: true,
    
    // Privacy
    shareAnalytics: true,
    publicProfile: false
  });
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setSettings(prev => ({
          ...prev,
          email: user.email,
          displayName: user.user_metadata?.full_name || ''
        }));

        // Fetch user settings from database
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userSettings) {
          setSettings(prev => ({
            ...prev,
            ...userSettings.preferences
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: settings.displayName }
      });

      if (updateError) throw updateError;

      // Save settings to database
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferences: {
            emailNotifications: settings.emailNotifications,
            scriptCompleted: settings.scriptCompleted,
            weeklyReport: settings.weeklyReport,
            marketingEmails: settings.marketingEmails,
            theme: settings.theme,
            language: settings.language,
            autoSave: settings.autoSave,
            shareAnalytics: settings.shareAnalytics,
            publicProfile: settings.publicProfile
          }
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteModal({ isOpen: true });
  };

  const handleDeleteAccount = async () => {
    try {
      // In production, this would call an API endpoint to delete the account
      toast({
        title: "Account Deletion",
        description: "Please contact support to delete your account"
      });
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setDeleteModal({ isOpen: false });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <Settings className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
          <p className="mt-4 text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Settings className="h-10 w-10 text-purple-400 neon-glow" />
          Settings
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 animate-reveal" style={{ animationDelay: '0.1s' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`glass-button px-4 py-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <TiltCard>
        <div className="glass-card p-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                    className="glass-input text-white mt-2"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    disabled
                    className="glass-input text-gray-400 mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="glass p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Subscription</p>
                        <p className="text-sm text-gray-400">Free Plan</p>
                      </div>
                    </div>
                    <Button className="glass-button text-white">
                      Upgrade
                      <Zap className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between glass p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="ml-12 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Script Completed</p>
                      <p className="text-sm text-gray-400">When your script is ready</p>
                    </div>
                    <Switch
                      checked={settings.scriptCompleted}
                      onCheckedChange={(checked) => setSettings({ ...settings, scriptCompleted: checked })}
                      disabled={!settings.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Weekly Report</p>
                      <p className="text-sm text-gray-400">Performance summary</p>
                    </div>
                    <Switch
                      checked={settings.weeklyReport}
                      onCheckedChange={(checked) => setSettings({ ...settings, weeklyReport: checked })}
                      disabled={!settings.emailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Marketing Emails</p>
                      <p className="text-sm text-gray-400">Product updates and offers</p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
                      disabled={!settings.emailNotifications}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">App Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Theme</Label>
                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`glass-button px-6 py-3 flex items-center gap-2 ${
                        settings.theme === 'light' ? 'bg-white/20' : ''
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`glass-button px-6 py-3 flex items-center gap-2 ${
                        settings.theme === 'dark' ? 'bg-white/20' : ''
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Language</Label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="glass-input text-white mt-2 w-full"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="flex items-center justify-between glass p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Save className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Auto-Save</p>
                      <p className="text-sm text-gray-400">Automatically save your work</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Privacy & Security</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between glass p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Share Analytics</p>
                      <p className="text-sm text-gray-400">Help improve our service</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.shareAnalytics}
                    onCheckedChange={(checked) => setSettings({ ...settings, shareAnalytics: checked })}
                  />
                </div>

                <div className="flex items-center justify-between glass p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Public Profile</p>
                      <p className="text-sm text-gray-400">Show your profile to others</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
                  />
                </div>

                <div className="glass p-4 rounded-xl border border-red-500/20">
                  <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Once you delete your account, there is no going back.
                  </p>
                  <Button
                    onClick={handleDeleteAccountClick}
                    className="glass-button text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </TiltCard>

      {/* Quick Links */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="/docs" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
            <FileText className="h-4 w-4" />
            Documentation
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
          <a href="/support" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
            <Mail className="h-4 w-4" />
            Support
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
          <a href="/api" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
            <Key className="h-4 w-4" />
            API Access
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
        cancelText="Cancel"
      />
    </div>
  );
}