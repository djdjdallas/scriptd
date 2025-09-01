'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiltCard } from '@/components/ui/tilt-card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
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
  TrendingUp
} from 'lucide-react';

export default function VoiceTrainingPage() {
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVoiceProfiles();
  }, []);

  const fetchVoiceProfiles = async () => {
    try {
      const response = await fetch('/api/voice');
      const result = await response.json();

      if (result.success) {
        setVoiceProfiles(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load voice profiles",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching voice profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load voice profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const startTraining = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a file before training",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    setTrainingStatus('Preparing training data...');
    
    try {
      // In a real implementation, you would:
      // 1. Extract text from audio/video files
      // 2. Process and prepare samples
      // 3. Send to the training API
      
      // For now, we'll use mock samples
      const mockSamples = [
        "Hey everyone, welcome back to my channel! Today we're going to explore something really exciting that I've been working on for the past few weeks. I know you've been asking about this topic in the comments, so I'm thrilled to finally share it with you.",
        "So let me break this down for you in a way that's super easy to understand. I always like to start with the basics because I know not everyone watching has the same level of experience, and that's totally okay! We all start somewhere, right?",
        "What I love about this approach is how practical it is. You don't need any fancy equipment or years of experience. Anyone can do this from home, and I'm going to show you exactly how step by step. Make sure you stick around until the end because I have a special bonus tip that will really take your results to the next level.",
        "Before we dive in, I want to thank everyone who's been supporting the channel. Your comments and feedback mean the world to me, and they help me create better content for you. If you're new here, consider subscribing and hitting that notification bell so you don't miss any future videos."
      ];

      const response = await fetch('/api/voice/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileName: 'My Voice Profile',
          samples: mockSamples,
          description: 'Voice profile trained from uploaded content'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show progress steps
        const steps = [
          'Extracting voice features...',
          'Building neural model...',
          'Optimizing parameters...',
          'Validating accuracy...',
          'Training complete!'
        ];
        
        for (let i = 0; i < steps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setTrainingStatus(steps[i]);
        }

        toast({
          title: "Training Complete",
          description: "Your voice model has been trained successfully!"
        });
        
        // Reset state
        setSelectedFile(null);
        setUploadProgress(0);
        fetchVoiceProfiles();
      } else {
        throw new Error(result.error || 'Training failed');
      }
    } catch (error) {
      console.error('Training error:', error);
      toast({
        title: "Training Failed",
        description: error.message || "Failed to train voice model",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
      setTrainingStatus(null);
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
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Header */}
      <div className="animate-reveal">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <Mic className="h-10 w-10 text-purple-400 neon-glow" />
          Voice Training
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-2">
          Train AI to match your unique voice and style
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-4 text-center">
          <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">{voiceProfiles.length}</div>
          <p className="text-sm text-gray-400">Voice Profiles</p>
        </div>
        <div className="glass-card p-4 text-center">
          <FileAudio className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">20</div>
          <p className="text-sm text-gray-400">Total Samples</p>
        </div>
        <div className="glass-card p-4 text-center">
          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">92%</div>
          <p className="text-sm text-gray-400">Avg. Accuracy</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold gradient-text">5m</div>
          <p className="text-sm text-gray-400">Training Time</p>
        </div>
      </div>

      {/* Upload Section */}
      <TiltCard>
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
              <Button className="glass-button text-white w-full">
                Connect Channel
              </Button>
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

            {/* Audio Upload */}
            <div className="glass p-6 rounded-xl group cursor-pointer hover:bg-white/5 transition-all">
              <FileAudio className="h-10 w-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-2">Upload Audio</h3>
              <p className="text-sm text-gray-400 mb-4">
                Direct audio samples for training
              </p>
              <label className="glass-button text-white w-full inline-block text-center cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                Choose Audio
              </label>
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
          {uploadProgress === 100 && !isTraining && (
            <Button
              onClick={startTraining}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white mt-6 w-full"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Start Voice Training
            </Button>
          )}

          {/* Training Status */}
          {isTraining && (
            <div className="mt-6 glass p-6 rounded-xl animate-reveal">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-5 w-5 text-purple-400 animate-spin" />
                <span className="text-white font-medium">{trainingStatus}</span>
              </div>
              <div className="space-y-2">
                {['Analyzing', 'Extracting', 'Building', 'Optimizing', 'Validating'].map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      trainingStatus?.includes(step) ? 'bg-purple-400' : 'bg-gray-600'
                    }`} />
                    <span className={`text-sm ${
                      trainingStatus?.includes(step) ? 'text-white' : 'text-gray-500'
                    }`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TiltCard>

      {/* Voice Profiles */}
      <div className="space-y-4 animate-reveal" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" />
          Your Voice Profiles
        </h2>
        
        <div className="grid gap-4">
          {voiceProfiles.map((profile) => (
            <TiltCard key={profile.id}>
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
                      {profile.status === 'trained' && (
                        <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-green-400 bg-black rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profile.profile_name || profile.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
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
                      {profile.status === 'trained' ? (
                        <Button className="glass-button text-white">
                          <Play className="h-4 w-4 mr-2" />
                          Use Voice
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
                          <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
                          <span className="text-sm text-yellow-400">Training...</span>
                        </div>
                      )}
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

                {activeProfile === profile.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-reveal">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        This voice profile is optimized for {profile.name.toLowerCase()} content
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="glass-button text-white">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retrain
                        </Button>
                        <Button size="sm" className="glass-button text-white">
                          <Zap className="h-3 w-3 mr-1" />
                          Enhance
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TiltCard>
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
    </div>
  );
}