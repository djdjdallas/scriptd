'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaticCard } from '@/components/ui/static-card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { VoiceTrainingStatus } from '@/components/voice/voice-training-status';
import { Gift } from 'lucide-react';
import {
  Mic,
  Upload,
  Youtube,
  FileText,
  Sparkles,
  Brain,
  Wand2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Volume2,
  FileAudio,
  Clock,
  TrendingUp,
  Trash2
} from 'lucide-react';

export default function VoiceTrainingPage() {
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for voice training updates
    const supabase = createClient();
    const subscription = supabase
      .channel('voice-training-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'channels'
      }, (payload) => {
        const { voice_training_status, voice_training_progress } = payload.new;
        
        // If training just completed, refresh voice profiles
        if (voice_training_status === 'completed') {
          setTimeout(() => {
            fetchVoiceProfiles();
            setIsTraining(false);
            setTrainingStatus(null);
            toast({
              title: "Training Complete",
              description: "Your voice model has been trained successfully!"
            });
          }, 1000);
        }
        
        // Update training status if it's in progress
        if (voice_training_status === 'in_progress' && isTraining) {
          const progressMessages = {
            30: 'Extracting voice features...',
            60: 'Building neural model...',
            80: 'Optimizing parameters...',
            100: 'Training complete!'
          };
          const message = progressMessages[voice_training_progress] || 'Processing...';
          setTrainingStatus(message);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isTraining]);

  const fetchData = async () => {
    await Promise.all([
      fetchVoiceProfiles(),
      fetchChannels()
    ]);
  };

  const fetchVoiceProfiles = async () => {
    try {
      const response = await fetch('/api/voice');
      const result = await response.json();

      if (result.success) {
        setVoiceProfiles(result.data);
      }
    } catch (error) {
      console.error('Error fetching voice profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: channelsData, error } = await supabase
          .from('channels')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && channelsData) {
          setChannels(channelsData);
          if (channelsData.length > 0 && !selectedChannel) {
            setSelectedChannel(channelsData[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          toast({
            title: "Upload Complete",
            description: "Your file has been uploaded successfully."
          });
        }
      }, 200);
    }
  };

  const deleteVoiceProfile = async (profileId) => {
    try {
      const response = await fetch(`/api/voice/${profileId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Profile Deleted",
          description: "Voice profile has been deleted successfully"
        });
        
        // Remove from local state
        setVoiceProfiles(voiceProfiles.filter(p => p.id !== profileId));
        setShowDeleteConfirm(false);
        setDeletingProfile(null);
      } else {
        throw new Error(result.error || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting voice profile:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete voice profile",
        variant: "destructive"
      });
    }
  };

  const startTraining = async () => {
    if (!selectedChannel) {
      toast({
        title: "No channel selected",
        description: "Please select a YouTube channel first",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile && !selectedChannel.video_count) {
      toast({
        title: "No training data",
        description: "Please upload a file or import from YouTube",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    setTrainingStatus('Preparing training data...');
    setTrainingProgress(0);
    
    // Start simulated progress animation
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95; // Stay at 95% until actually complete
        }
        return prev + Math.random() * 5; // Increment by 0-5%
      });
    }, 1000);
    
    try {
      // Prepare training data
      let trainingSamples = [];
      
      // Use uploaded file content if available
      if (selectedFile) {
        // In a real implementation, extract text from the file
        // For now, we'll pass an indicator that a file was uploaded
        trainingSamples = [`Content from uploaded file: ${selectedFile.name}`];
      }
      
      // If no file but channel has videos, the API will fetch from YouTube
      // The API now handles fetching real video data and analyzing it
      
      const profileName = `${selectedChannel.title || selectedChannel.name} Voice`;
      
      const response = await fetch('/api/voice/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          profileName: profileName,
          samples: trainingSamples, // Empty array will trigger YouTube fetch in API
          description: `Voice profile for ${selectedChannel.title || selectedChannel.name} channel`
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Training has been initiated - real-time updates will handle the rest
        setTrainingStatus('Initializing voice training...');
        
        // Wait a bit for the completion (since API is synchronous)
        setTimeout(async () => {
          clearInterval(progressInterval);
          setTrainingProgress(100);
          setTrainingStatus('Training complete!');
          
          // Refresh profiles after a short delay
          setTimeout(async () => {
            await fetchVoiceProfiles();
            setIsTraining(false);
            setTrainingStatus(null);
            setTrainingProgress(0);
            toast({
              title: "Training Complete",
              description: "Your voice model has been trained successfully!"
            });
          }, 1500);
        }, 3000);
        
        // Reset file state
        setSelectedFile(null);
        setUploadProgress(0);
      } else {
        clearInterval(progressInterval);
        throw new Error(result.error || 'Training failed');
      }
    } catch (error) {
      console.error('Training error:', error);
      clearInterval(progressInterval);
      toast({
        title: "Training Failed",
        description: error.message || "Failed to train voice model",
        variant: "destructive"
      });
      setIsTraining(false);
      setTrainingStatus(null);
      setTrainingProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <Mic className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-300">Loading voice profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Background - no animations for performance */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Mic className="h-10 w-10 text-purple-400 neon-glow" />
              Voice Training
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 mt-2">
              Train AI to match your unique voice and style
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full">
            <Gift className="h-5 w-5 text-green-400" />
            <span className="text-lg font-semibold text-green-400">100% FREE</span>
            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Voice Training Status for Active Channels */}
      {channels.filter(c => c.voice_training_status && c.voice_training_status !== 'completed' && c.voice_training_status !== 'skipped').map(channel => (
        <VoiceTrainingStatus 
          key={channel.id} 
          channelId={channel.id} 
          initialStatus={channel.voice_training_status} 
        />
      ))}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-4 text-center">
          <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">{voiceProfiles.length}</div>
          <p className="text-sm text-gray-400">Voice Profiles</p>
        </div>
        <div className="glass-card p-4 text-center">
          <FileAudio className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">
            {voiceProfiles.reduce((total, profile) => 
              total + (profile.training_data?.sampleCount || profile.samples || 0), 0
            )}
          </div>
          <p className="text-sm text-gray-400">Total Samples</p>
        </div>
        <div className="glass-card p-4 text-center">
          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">
            {voiceProfiles.length > 0 
              ? Math.round(
                  voiceProfiles.reduce((sum, profile) => 
                    sum + (profile.parameters?.accuracy || profile.accuracy || 0), 0
                  ) / voiceProfiles.length
                ) || 0
              : 0}%
          </div>
          <p className="text-sm text-gray-400">Avg. Accuracy</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">
            {voiceProfiles.length > 0 ? '~5m' : '0m'}
          </div>
          <p className="text-sm text-gray-400">Training Time</p>
        </div>
      </div>

      {/* Upload Section */}
      <div>
        <div className="glass-card p-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Upload className="h-6 w-6 text-purple-400" />
            Upload Training Data
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* YouTube Import */}
            <div className="glass p-6 rounded-xl group cursor-pointer hover:bg-white/5 transition-all">
              <Youtube className="h-10 w-10 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Import from YouTube</h3>
              <p className="text-sm text-gray-400 mb-4">
                Extract audio from your existing videos
              </p>
              {channels.length > 0 ? (
                <select 
                  className="glass-button text-white w-full px-3 py-2 rounded-lg bg-black/50"
                  value={selectedChannel?.id || ''}
                  onChange={(e) => {
                    const channel = channels.find(c => c.id === e.target.value);
                    setSelectedChannel(channel);
                  }}
                >
                  <option value="" disabled>Select Channel</option>
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.title || channel.name || channel.youtube_channel_id}
                    </option>
                  ))}
                </select>
              ) : (
                <Button 
                  className="glass-button text-white w-full"
                  onClick={() => window.location.href = '/channels/connect'}
                >
                  Connect Channel
                </Button>
              )}
            </div>

            {/* Script Upload */}
            <div className="glass p-6 rounded-xl group cursor-pointer hover:bg-white/5 transition-all">
              <FileText className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Upload Scripts</h3>
              <p className="text-sm text-gray-400 mb-4">
                Upload text scripts for voice analysis
              </p>
              <Button className="glass-button text-white w-full">
                Choose Files
              </Button>
            </div>

            {/* Audio Upload - Coming Soon */}
            <div className="glass p-6 rounded-xl group opacity-50 cursor-not-allowed relative">
              <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-400/30">
                Coming Soon
              </div>
              <FileAudio className="h-10 w-10 text-green-400 mb-4" />
              <h3 className="font-semibold text-white mb-2">Upload Audio</h3>
              <p className="text-sm text-gray-400 mb-4">
                Direct audio samples for training
              </p>
              <Button className="glass-button text-white w-full opacity-50 cursor-not-allowed" disabled>
                Choose Audio
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {selectedFile && (
            <div className="mt-6 glass p-4 rounded-xl animate-reveal">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{selectedFile.name}</span>
                <span className="text-sm text-purple-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 glass rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Training Button */}
          {(uploadProgress === 100 || selectedChannel) && !isTraining && (
            <div className="mt-6">
              <Button
                onClick={startTraining}
                className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white w-full relative"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Start Voice Training {selectedChannel ? `for ${selectedChannel.title || selectedChannel.name}` : ''}
              </Button>
              <p className="text-xs text-center text-gray-400 mt-2">
                No credits required - Voice training is always FREE!
              </p>
            </div>
          )}

          {/* Training Status */}
          {isTraining && (
            <div className="mt-6 glass p-6 rounded-xl animate-reveal">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-5 w-5 text-purple-400 animate-spin" />
                <span className="text-white font-medium">{trainingStatus}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(trainingProgress)}%</span>
                </div>
                <div className="w-full h-2 glass rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  { step: 'Analyzing', threshold: 20 },
                  { step: 'Extracting', threshold: 40 },
                  { step: 'Building', threshold: 60 },
                  { step: 'Optimizing', threshold: 80 },
                  { step: 'Validating', threshold: 95 }
                ].map(({ step, threshold }) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${
                      trainingProgress >= threshold ? 'bg-purple-400' : 'bg-gray-600'
                    }`} />
                    <span className={`text-sm transition-colors ${
                      trainingProgress >= threshold ? 'text-white' : 'text-gray-500'
                    }`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Profiles */}
      <div className="space-y-4 animate-reveal" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" />
          Your Voice Profiles
        </h2>
        
        <div className="grid gap-4">
          {voiceProfiles.map((profile) => (
            <StaticCard key={profile.id}>
              <div 
                className={`glass-card glass-hover p-6 cursor-pointer ${
                  activeProfile === profile.id ? 'ring-2 ring-purple-400' : ''
                }`}
                onClick={() => setActiveProfile(profile.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 glass rounded-full flex items-center justify-center">
                        <Volume2 className="h-8 w-8 text-purple-400" />
                      </div>
                      {(profile.parameters?.status === 'trained' || profile.status === 'trained') && (
                        <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-green-400 bg-black rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profile.profile_name || profile.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <Youtube className="h-3 w-3" />
                          {profile.channels?.name || 'Channel'}
                        </span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <FileAudio className="h-3 w-3" />
                          {profile.training_data?.sampleCount || profile.samples || 0} samples
                        </span>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(profile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Accuracy Meter */}
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text">
                        {profile.parameters?.accuracy || profile.accuracy || 85}%
                      </div>
                      <p className="text-xs text-gray-400">Accuracy</p>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <Button className="glass-button text-white">
                        <Play className="h-4 w-4 mr-2" />
                        Use Voice
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full h-2 glass rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${profile.accuracy}%` }}
                    />
                  </div>
                </div>

                {/* Style Analysis Details */}
                {activeProfile === profile.id && profile.parameters && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-reveal space-y-4">
                    {/* Style Characteristics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="glass p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Tone</p>
                        <p className="text-sm text-white capitalize">{profile.parameters.formality || 'Neutral'}</p>
                      </div>
                      <div className="glass p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Enthusiasm</p>
                        <p className="text-sm text-white capitalize">{profile.parameters.enthusiasm || 'Medium'}</p>
                      </div>
                      <div className="glass p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Avg Words/Sentence</p>
                        <p className="text-sm text-white">{profile.parameters.avgWordsPerSentence || 15}</p>
                      </div>
                      <div className="glass p-3 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Readability</p>
                        <p className="text-sm text-white">{profile.parameters.readability || 70}/100</p>
                      </div>
                    </div>

                    {/* Common Patterns */}
                    {(profile.parameters.catchphrases?.length > 0 || profile.parameters.greetings?.length > 0) && (
                      <div className="glass p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-white mb-2">Detected Patterns</h4>
                        <div className="space-y-2">
                          {profile.parameters.greetings?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Common Greetings:</p>
                              <div className="flex flex-wrap gap-2">
                                {profile.parameters.greetings.map((greeting, i) => (
                                  <span key={i} className="text-xs glass px-2 py-1 rounded text-purple-300">
                                    {greeting}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {profile.parameters.catchphrases?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Catchphrases:</p>
                              <div className="flex flex-wrap gap-2">
                                {profile.parameters.catchphrases.map((phrase, i) => (
                                  <span key={i} className="text-xs glass px-2 py-1 rounded text-pink-300">
                                    {phrase}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Top Words */}
                    {profile.parameters.topWords?.length > 0 && (
                      <div className="glass p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-white mb-2">Vocabulary Focus</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.parameters.topWords.slice(0, 8).map((item, i) => (
                            <span key={i} className="text-xs glass px-2 py-1 rounded">
                              <span className="text-white">{item.word || item}</span>
                              {item.count && <span className="text-gray-400 ml-1">({item.count})</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        Based on {profile.training_data?.totalWords || 0} words analyzed
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="glass-button text-white">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retrain
                        </Button>
                        <Button size="sm" className="glass-button text-white">
                          <Zap className="h-3 w-3 mr-1" />
                          Use Style
                        </Button>
                        <Button 
                          size="sm" 
                          className="glass-button text-red-400 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingProfile(profile);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </StaticCard>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card p-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Voice Training Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Quality Over Quantity</p>
              <p className="text-xs text-gray-400">10 high-quality samples beat 100 poor ones</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="glass w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Variety Matters</p>
              <p className="text-xs text-gray-400">Include different tones and styles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deletingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-reveal">
          <div className="glass-card p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Voice Profile?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the voice profile "{deletingProfile.profile_name || deletingProfile.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                className="glass-button text-gray-300"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingProfile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="glass-button bg-red-500/20 text-red-400 hover:bg-red-500/30"
                onClick={() => deleteVoiceProfile(deletingProfile.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}