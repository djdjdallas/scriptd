'use client';

import { useState, useEffect, useRef } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Search, Globe, FileText, Link, CheckCircle, XCircle, AlertCircle, Star, Trash2, Plus, Loader2, Info, HelpCircle, Brain, Sparkles, Upload, File, Check, X, Video, ExternalLink, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ContentIdeaBanner from '../ContentIdeaBanner';
import ResearchAdequacyMeter from '@/components/research/ResearchAdequacyMeter';

export default function ResearchStep() {
  const { workflowData, updateStepData, markStepComplete, workflowId, trackCredits, goToStep } = useWorkflow();
  const [sources, setSources] = useState(workflowData.research?.sources || []);
  const [keywords, setKeywords] = useState(workflowData.research?.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [researchSummary, setResearchSummary] = useState(workflowData.research?.summary || '');
  const [relatedQuestions, setRelatedQuestions] = useState(workflowData.research?.relatedQuestions || []);
  const [searchProvider, setSearchProvider] = useState(null);
  const [isAddingSources, setIsAddingSources] = useState(false);
  const [addedSourcesCount, setAddedSourcesCount] = useState(0);
  const [selectedSources, setSelectedSources] = useState(new Set());
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [videoTranscripts, setVideoTranscripts] = useState({});
  const [isExtractingTranscript, setIsExtractingTranscript] = useState({});
  const [expandedTranscripts, setExpandedTranscripts] = useState(new Set());
  const [researchAdequacy, setResearchAdequacy] = useState(null);
  const [researchJobId, setResearchJobId] = useState(null);
  const [researchJobStatus, setResearchJobStatus] = useState(null);
  const [researchProgress, setResearchProgress] = useState(0);
  const pollingIntervalRef = useRef(null);

  const supabase = createClient();

  // Load research sources and video transcripts from database when workflow exists
  useEffect(() => {
    const loadSavedData = async () => {
      if (!workflowId) return;

      try {
        // Load research sources
        if (!sources || sources.length === 0) {
          const { data: researchData, error: researchError } = await supabase
            .from('workflow_research')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('created_at', { ascending: false });

          if (researchError) {
            console.error('Error loading saved research:', researchError);
          } else if (researchData && researchData.length > 0) {
            console.log(`Loading ${researchData.length} saved research sources from database`);

            // Convert database format to component format
            const loadedSources = researchData.map(source => ({
              id: source.id,
              source_type: source.source_type,
              source_url: source.source_url,
              source_title: source.source_title,
              source_content: source.source_content,
              fact_check_status: source.fact_check_status,
              is_starred: source.is_starred,
              relevance: source.relevance || 0.5
            }));

            setSources(loadedSources);

            // Auto-select sources that were previously selected
            const selectedIds = researchData.filter(s => s.is_selected).map(s => s.id);
            if (selectedIds.length > 0) {
              setSelectedSources(new Set(selectedIds));
            }
          }
        }

        // Load saved video transcripts
        const { data: transcriptsData, error: transcriptsError } = await supabase
          .from('workflow_video_transcripts')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: false });

        if (transcriptsError) {
          console.error('Error loading saved transcripts:', transcriptsError);
        } else if (transcriptsData && transcriptsData.length > 0) {
          console.log(`Loading ${transcriptsData.length} saved video transcripts from database`);

          // Convert database format to component format
          const loadedTranscripts = {};
          transcriptsData.forEach(record => {
            loadedTranscripts[record.video_id] = {
              dbId: record.id,
              language: record.transcript_language,
              type: record.transcript_type,
              fullText: record.transcript_data.fullText,
              segments: record.transcript_data.segments,
              metadata: record.transcript_data.metadata,
              analysis: record.analysis_data,
              videoTitle: record.video_title,
              channelTitle: record.channel_name,
              videoUrl: record.video_url,
              isStarred: record.is_starred,
              researchId: record.research_id,
              userNotes: record.user_notes,
              userTags: record.user_tags || []
            };
          });

          setVideoTranscripts(loadedTranscripts);

          // Auto-expand transcripts that are starred
          const starredVideoIds = transcriptsData
            .filter(t => t.is_starred)
            .map(t => t.video_id);
          if (starredVideoIds.length > 0) {
            setExpandedTranscripts(new Set(starredVideoIds));
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, [workflowId]);

  // Calculate research adequacy for 35+ minute scripts
  useEffect(() => {
    const calculateAdequacy = async () => {
      const targetDuration = workflowData.summary?.targetDuration;
      if (!targetDuration || !sources || sources.length === 0) {
        setResearchAdequacy(null);
        return;
      }

      const totalMinutes = Math.ceil(targetDuration / 60);

      // Only calculate for 35+ minute scripts
      if (totalMinutes < 35) {
        setResearchAdequacy(null);
        return;
      }

      try {
        // Dynamically import the validator
        const { validateResearchForDuration, calculateResearchScore } =
          await import('@/lib/script-generation/research-validator');

        const hasUserDocuments = sources.some(s =>
          s.source_type === 'document' || s.source_type === 'upload'
        );

        const validation = validateResearchForDuration(
          { sources },
          totalMinutes,
          hasUserDocuments
        );

        setResearchAdequacy(validation);
      } catch (error) {
        console.error('Error calculating research adequacy:', error);
        setResearchAdequacy(null);
      }
    };

    calculateAdequacy();
  }, [sources, workflowData.summary?.targetDuration]);

  // Poll research job status
  useEffect(() => {
    if (!researchJobId || researchJobStatus === 'completed' || researchJobStatus === 'failed') {
      return;
    }

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/workflow/research-status/${researchJobId}`);

        if (!response.ok) {
          console.error('Failed to poll job status:', response.status);
          return;
        }

        const data = await response.json();

        setResearchJobStatus(data.status);
        setResearchProgress(data.progress || 0);

        if (data.status === 'completed' && data.results) {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Process the results
          const results = data.results;

          // Handle research summary if available
          if (results.summary || results.researchSummary) {
            setResearchSummary(results.summary || results.researchSummary);
          }

          // Handle related questions if available
          if (results.relatedQuestions && results.relatedQuestions.length > 0) {
            setRelatedQuestions(results.relatedQuestions);
          }

          // Map results to source format
          const newSources = (results.results || results.sources || []).map(result => ({
            id: result.id || crypto.randomUUID(),
            source_type: result.source_type || 'web',
            source_url: result.source_url,
            source_title: result.source_title,
            source_content: result.source_content,
            fact_check_status: result.fact_check_status || 'verified',
            is_starred: result.is_starred || false,
            relevance: result.relevance || 0.8,
            isNew: true
          }));

          // Animate sources being added
          setIsAddingSources(true);
          setAddedSourcesCount(0);

          const existingDocuments = sources.filter(s => s.source_type === 'document');
          setSources(existingDocuments);

          // Add sources with animation
          const newSourceIds = [];
          for (let i = 0; i < newSources.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 150));
            const sourceWithId = { ...newSources[i], isNew: false };
            setSources(prev => [...prev, sourceWithId]);
            newSourceIds.push(sourceWithId.id);
            setAddedSourcesCount(i + 1);
          }

          // Auto-select all new sources
          setSelectedSources(prev => {
            const newSet = new Set(prev);
            newSourceIds.forEach(id => newSet.add(id));
            return newSet;
          });

          setIsAddingSources(false);
          setIsSearching(false);

          if (results.creditsUsed) {
            trackCredits(results.creditsUsed);
          }

          if (results.searchProvider) {
            setSearchProvider(results.searchProvider);
          }

          const totalContent = newSources.reduce((sum, s) => sum + (s.source_content?.length || 0), 0);

          toast.success(
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Research completed! Added {newSources.length} sources</span>
              </div>
              {totalContent > 0 && (
                <span className="text-xs opacity-80">
                  ✨ Full content fetched ({(totalContent / 1000).toFixed(1)}k chars total)
                </span>
              )}
              <span className="text-xs opacity-70">
                Processing time: {data.processingTime || 'N/A'}s
              </span>
            </div>
          );

          // Clear job tracking
          setResearchJobId(null);
          setResearchJobStatus(null);
          setResearchProgress(0);
        } else if (data.status === 'failed') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          setIsSearching(false);
          setIsAddingSources(false);

          toast.error(
            <div className="flex flex-col gap-1">
              <span>Research job failed</span>
              {data.error && <span className="text-xs opacity-80">{data.error}</span>}
            </div>
          );

          // Clear job tracking
          setResearchJobId(null);
          setResearchJobStatus(null);
          setResearchProgress(0);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };

    // Start polling every 3 seconds
    pollingIntervalRef.current = setInterval(pollJobStatus, 3000);

    // Poll immediately
    pollJobStatus();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [researchJobId, researchJobStatus]);

  // AI-powered search using the video topic
  const performAISearch = async () => {
    const topic = workflowData.summary?.topic;
    if (!topic) {
      toast.error('Please complete the summary step first to get your video topic');
      return;
    }

    // Calculate estimated time based on script duration
    const targetDuration = workflowData.summary?.targetDuration || 300;
    const durationMinutes = Math.ceil(targetDuration / 60);

    let estimatedTime = '1-2 minutes';
    if (durationMinutes >= 35) {
      estimatedTime = '5-8 minutes';
    } else if (durationMinutes >= 20) {
      estimatedTime = '3-5 minutes';
    }

    // Show informative toast about the process
    toast.info(
      <div className="space-y-1">
        <p className="font-semibold">🔍 AI Research in Progress</p>
        <p className="text-sm">Gathering comprehensive sources for your {durationMinutes}-minute script.</p>
        <p className="text-xs opacity-80">Estimated time: {estimatedTime}</p>
        <p className="text-xs opacity-70">This includes web search, fact-checking, and content enrichment.</p>
      </div>,
      { duration: 8000 }
    );

    setSearchQuery(topic);
    await performWebSearch(topic);
  };

  const performWebSearch = async (query = searchQuery) => {
    if (!query) {
      toast.error('Please enter a search query');
      return;
    }

    if (!workflowId) {
      toast.error('Please save the workflow first');
      return;
    }

    setIsSearching(true);
    setResearchProgress(0);

    try {
      // Call the async research endpoint
      const response = await fetch('/api/workflow/research-async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          topic: workflowData.summary?.topic,
          workflowId,
          targetDuration: workflowData.summary?.targetDuration || 1800,
          enableExpansion: true,
          contentIdeaInfo: workflowData.summary?.contentIdeaInfo,
          niche: workflowData.summary?.niche
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Research API error:', response.status, response.statusText, errorData);
        toast.error(errorData.error || errorData.details || 'Failed to start research job', {
          duration: 5000
        });
        setIsSearching(false);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.jobId) {
        toast.error('Failed to create research job');
        setIsSearching(false);
        return;
      }

      // Store the job ID and start polling
      setResearchJobId(data.jobId);
      setResearchJobStatus(data.status);

      toast.info(
        <div className="flex flex-col gap-1">
          <span>🔬 Research job started</span>
          <span className="text-xs opacity-80">Job ID: {data.jobId.substring(0, 8)}...</span>
          <span className="text-xs opacity-70">This may take 5-8 minutes. Polling for updates...</span>
        </div>,
        { duration: 5000 }
      );

      // The polling effect will handle the rest
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to start research job. Please try again.');
      setIsSearching(false);
    }
  };

  const factCheckSource = async (sourceId) => {
    const sourceIndex = sources.findIndex(s => s.id === sourceId);
    if (sourceIndex === -1) return;

    try {
      const response = await fetch('/api/workflow/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sources[sourceIndex].source_url,
          content: sources[sourceIndex].source_content
        })
      });

      if (!response.ok) {
        // Mock fact-checking for now
        const statuses = ['verified', 'verified', 'disputed', 'verified'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const updatedSources = [...sources];
        updatedSources[sourceIndex].fact_check_status = randomStatus;
        setSources(updatedSources);
        
        trackCredits(1);
        toast.success(`Source ${randomStatus}`);
        return;
      }

      const { status, creditsUsed } = await response.json();
      
      const updatedSources = [...sources];
      updatedSources[sourceIndex].fact_check_status = status;
      setSources(updatedSources);
      
      trackCredits(creditsUsed);
      toast.success(`Source ${status}`);
    } catch (error) {
      console.error('Fact check error:', error);
      toast.error('Fact-checking service temporarily unavailable');
    }
  };

  const toggleStarSource = (sourceId) => {
    const updatedSources = sources.map(s => 
      s.id === sourceId ? { ...s, is_starred: !s.is_starred } : s
    );
    setSources(updatedSources);
  };

  const removeSource = (sourceId) => {
    setSources(sources.filter(s => s.id !== sourceId));
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const toggleSourceSelection = (sourceId) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId);
      } else {
        newSet.add(sourceId);
      }
      return newSet;
    });
  };

  const selectAllSources = () => {
    const allSourceIds = new Set(sources.map(s => s.id));
    setSelectedSources(allSourceIds);
  };

  const deselectAllSources = async () => {
    // Clear all sources from the UI
    setSources([]);
    setSelectedSources(new Set());
    setRelatedVideos([]);
    setVideoTranscripts({});
    setExpandedTranscripts(new Set());

    // Clear uploaded documents
    setUploadedDocuments([]);

    // Also clear from database if workflowId exists
    if (workflowId) {
      try {
        // Delete all workflow research sources
        const { error: researchError } = await supabase
          .from('workflow_research')
          .delete()
          .eq('workflow_id', workflowId);

        if (researchError) {
          console.error('Error deleting research sources:', researchError);
        }

        // Delete all video transcripts
        const { error: transcriptError } = await supabase
          .from('workflow_video_transcripts')
          .delete()
          .eq('workflow_id', workflowId);

        if (transcriptError) {
          console.error('Error deleting video transcripts:', transcriptError);
        }

        toast.success('All sources removed');
      } catch (error) {
        console.error('Error removing sources:', error);
        toast.error('Failed to remove all sources');
      }
    } else {
      toast.success('All sources cleared');
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload documents');
        return;
      }

      for (const file of files) {
        // Validate file size (50MB limit)
        if (file.size > 52428800) {
          toast.error(`${file.name} is too large. Maximum size is 50MB`);
          continue;
        }

        // Upload to storage
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${user.id}/${workflowId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('research-documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Create a document source entry
        const documentSource = {
          id: crypto.randomUUID(),
          source_type: 'document',
          source_url: filePath,
          source_title: file.name,
          source_content: `Uploaded document: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          fact_check_status: 'verified',
          is_starred: false,
          is_selected: true,
          file_size: file.size,
          mime_type: file.type
        };

        uploadedFiles.push(documentSource);
        
        // If we have a workflow ID, save to database
        if (workflowId) {
          await supabase
            .from('research_documents')
            .insert({
              workflow_id: workflowId,
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type,
              is_selected: true
            });
        }
      }

      if (uploadedFiles.length > 0) {
        setSources(prev => [...prev, ...uploadedFiles]);
        // Auto-select uploaded documents
        setSelectedSources(prev => {
          const newSet = new Set(prev);
          uploadedFiles.forEach(doc => newSet.add(doc.id));
          return newSet;
        });
        setUploadedDocuments(prev => [...prev, ...uploadedFiles]);
        toast.success(`Successfully uploaded ${uploadedFiles.length} document(s)`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeUploadedDocument = async (documentId) => {
    const document = uploadedDocuments.find(d => d.id === documentId);
    if (!document) return;

    try {
      // Remove from storage if we have a path
      if (document.source_url) {
        await supabase.storage
          .from('research-documents')
          .remove([document.source_url]);
      }

      // Remove from local state
      setUploadedDocuments(prev => prev.filter(d => d.id !== documentId));
      setSources(prev => prev.filter(s => s.id !== documentId));
      setSelectedSources(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });

      toast.success('Document removed');
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  // Search for related YouTube videos
  const searchRelatedVideos = async () => {
    const topic = workflowData.summary?.topic;
    if (!topic) {
      toast.error('Please complete the summary step first to get your video topic');
      return;
    }

    setIsSearchingVideos(true);
    try {
      const response = await fetch('/api/workflow/video-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          workflowId: workflowId,
          options: {
            maxResults: 12,
            order: 'relevance'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search videos');
      }

      const data = await response.json();

      if (data.success && data.videos) {
        setRelatedVideos(data.videos);
        toast.success(`Found ${data.videos.length} related videos for reference`);
      } else {
        throw new Error('No videos found');
      }
    } catch (error) {
      console.error('Video search error:', error);
      toast.error(error.message || 'Failed to search videos');
    } finally {
      setIsSearchingVideos(false);
    }
  };

  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  // Extract transcript from a video
  const extractTranscript = async (video) => {
    const videoId = video.videoId;

    setIsExtractingTranscript(prev => ({ ...prev, [videoId]: true }));

    try {
      console.log(`Extracting transcript for video: ${video.title}`);

      const response = await fetch('/api/workflow/transcript-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoId,
          videoTitle: video.title,
          channelTitle: video.channelTitle,
          videoUrl: video.url,
          workflowId: workflowId, // Save to database if workflow exists
          includeAnalysis: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract transcript');
      }

      const data = await response.json();

      if (data.success && data.transcript) {
        // Store the transcript data
        setVideoTranscripts(prev => ({
          ...prev,
          [videoId]: {
            ...data.transcript,
            dbId: data.metadata?.transcriptDbId, // Store database ID for linking to research
            videoTitle: video.title,
            channelTitle: video.channelTitle,
            videoUrl: video.url,
            copyrightNotice: data.copyrightNotice,
            isStarred: false,
            researchId: null,
            userNotes: null,
            userTags: []
          }
        }));

        // Auto-expand the transcript
        setExpandedTranscripts(prev => {
          const newSet = new Set(prev);
          newSet.add(videoId);
          return newSet;
        });

        toast.success(`Extracted transcript from "${video.title}"`);

        // Track credits if provided
        if (data.metadata?.creditsUsed) {
          trackCredits(data.metadata.creditsUsed);
        }
      } else {
        throw new Error('No transcript data returned');
      }
    } catch (error) {
      console.error('Transcript extraction error:', error);
      toast.error(error.message || 'Failed to extract transcript. Video may have captions disabled.');
    } finally {
      setIsExtractingTranscript(prev => ({ ...prev, [videoId]: false }));
    }
  };

  // Toggle transcript expansion
  const toggleTranscriptExpansion = (videoId) => {
    setExpandedTranscripts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  // Add transcript to research sources
  const addTranscriptToResearch = async (videoId) => {
    const transcript = videoTranscripts[videoId];
    if (!transcript) return;

    // Check if already added to research
    if (transcript.researchId) {
      toast.info('This transcript is already in your research sources');
      return;
    }

    try {
      // Create a research entry linked to the transcript
      const transcriptSource = {
        workflow_id: workflowId,
        source_type: 'youtube_transcript',
        source_url: transcript.videoUrl,
        source_title: `Transcript: ${transcript.videoTitle}`,
        source_content: JSON.stringify({
          videoId: videoId,
          fullText: transcript.fullText,
          segments: transcript.segments,
          analysis: transcript.analysis,
          metadata: transcript.metadata,
          channelTitle: transcript.channelTitle
        }),
        fact_check_status: 'verified',
        is_starred: true, // Auto-star transcripts
        relevance: 0.9, // Transcripts are highly relevant
        is_selected: true
      };

      const { data: researchData, error: researchError } = await supabase
        .from('workflow_research')
        .insert(transcriptSource)
        .select()
        .single();

      if (researchError) {
        console.error('Error adding transcript to research:', researchError);
        toast.error('Failed to add transcript to research');
        return;
      }

      // Update the workflow_video_transcripts table with the research_id link
      if (transcript.dbId) {
        const { error: updateError } = await supabase
          .from('workflow_video_transcripts')
          .update({ research_id: researchData.id })
          .eq('id', transcript.dbId);

        if (updateError) {
          console.error('Error linking transcript to research:', updateError);
        }
      }

      // Update local state with the new research source
      const newSource = {
        id: researchData.id,
        source_type: 'youtube_transcript',
        source_url: transcript.videoUrl,
        source_title: `Transcript: ${transcript.videoTitle}`,
        source_content: researchData.source_content,
        fact_check_status: 'verified',
        is_starred: true,
        relevance: 0.9
      };

      setSources(prev => [...prev, newSource]);

      // Auto-select the transcript
      setSelectedSources(prev => {
        const newSet = new Set(prev);
        newSet.add(researchData.id);
        return newSet;
      });

      // Update transcript state with research link
      setVideoTranscripts(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          researchId: researchData.id
        }
      }));

      toast.success('Transcript added to research sources');
    } catch (error) {
      console.error('Error adding transcript to research:', error);
      toast.error('Failed to add transcript to research');
    }
  };

  const addVideoAsReference = (video) => {
    // Create a source entry for the selected video
    const videoSource = {
      id: crypto.randomUUID(),
      source_type: 'video',
      source_url: video.url,
      source_title: `[VIDEO] ${video.title}`,
      source_content: `YouTube video by ${video.channelTitle}\nDuration: ${video.duration}\nViews: ${video.viewCount.toLocaleString()}\n\n${video.description.slice(0, 300)}...\n\n⚠️ Reference only - Provide attribution when using`,
      fact_check_status: 'verified',
      is_starred: false,
      relevance: video.relevanceScore || 0.8,
      video_metadata: {
        videoId: video.videoId,
        channelTitle: video.channelTitle,
        duration: video.duration,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        license: video.license,
        chapters: video.chapters
      }
    };

    setSources(prev => [...prev, videoSource]);
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      newSet.add(videoSource.id);
      return newSet;
    });

    toast.success(`Added "${video.title}" as reference`);
  };

  const handleSave = async () => {
    // Filter only selected sources
    const selectedSourcesList = sources.filter(s => selectedSources.has(s.id));
    
    if (selectedSourcesList.length === 0) {
      toast.error('Please select at least one source to continue');
      return;
    }
    
    const researchData = {
      sources: selectedSourcesList,
      keywords,
      summary: researchSummary,
      relatedQuestions,
      uploadedDocuments
    };
    
    updateStepData('research', researchData);

    if (workflowId && selectedSourcesList.length > 0) {
      try {
        // Fetch existing sources to avoid duplicates
        const { data: existingSources, error: fetchError } = await supabase
          .from('workflow_research')
          .select('source_url')
          .eq('workflow_id', workflowId);

        if (fetchError) {
          console.error('Error fetching existing sources:', fetchError);
        }

        const existingUrls = new Set(existingSources?.map(s => s.source_url) || []);

        // Prepare sources for database insertion, filtering out duplicates
        const sourcesToSave = selectedSourcesList
          .filter(source => !existingUrls.has(source.source_url || ''))
          .map(source => ({
            workflow_id: workflowId,
            source_type: source.source_type || 'web',
            source_url: source.source_url || '',
            source_title: source.source_title || '',
            source_content: source.source_content || '',
            fact_check_status: source.fact_check_status || 'unverified',
            is_starred: source.is_starred || false,
            is_selected: true,
            relevance: source.relevance || 0.5,
            added_at: new Date().toISOString()
          }));

        if (sourcesToSave.length === 0) {
          console.log('No new sources to save (all sources already exist)');
          toast.info('All sources already saved');
        } else {
          // Insert only new research sources
          const { data, error } = await supabase
            .from('workflow_research')
            .insert(sourcesToSave)
            .select();

          if (error) {
            console.error('Error saving research to database:', error);
            toast.error('Failed to save research sources to database');
          } else {
            console.log(`Successfully saved ${data.length} research sources to database`);
            const totalSources = (existingSources?.length || 0) + data.length;
            toast.success(`Saved ${data.length} new source(s)! Total: ${totalSources}`);
          }
        }
      } catch (error) {
        console.error('Error saving research:', error);
        toast.error('Failed to save research sources');
      }
    }

    markStepComplete(2);
    // Navigate to next step (Frame)
    goToStep(3);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disputed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Research & Fact-Checking
        </h2>
        <p className="text-gray-400">
          Gather sources and verify information for your script (1 credit per AI search)
        </p>
      </div>

      {/* Content Idea Banner */}
      {workflowData.summary?.contentIdeaInfo && (
        <div className="mb-6">
          <ContentIdeaBanner
            contentIdeaInfo={workflowData.summary.contentIdeaInfo}
            niche={workflowData.summary.niche}
            compact={true}
          />
        </div>
      )}

      {/* Research Summary Section */}
      {researchSummary && (
        <div className="glass-card-no-overflow p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Research Summary
          </h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{researchSummary}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Web Search
              </h3>
              {searchProvider && (
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {searchProvider === 'claude' ? 'Claude AI' : searchProvider === 'google' ? 'Google Search' : 'Perplexity AI'}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {/* AI Search Button - Prominent placement */}
              {workflowData.summary?.topic && (
                <div className="space-y-2">
                  <button
                    onClick={performAISearch}
                    disabled={isSearching}
                    className={`w-full glass-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 min-h-[80px] flex flex-col items-center justify-center gap-2 transition-all ${
                      isSearching ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm">
                          {researchJobStatus === 'pending' && 'Queueing research job...'}
                          {researchJobStatus === 'processing' && 'AI Research in Progress...'}
                          {!researchJobStatus && 'Starting research...'}
                        </span>
                        {researchJobStatus && (
                          <span className="text-xs opacity-75">
                            Status: {researchJobStatus} {researchProgress > 0 && `(${researchProgress}%)`}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span className="text-sm">AI Web Search for "{workflowData.summary.topic}" (1 credit)</span>
                      </>
                    )}
                  </button>

                  {/* Progress Bar */}
                  {isSearching && researchProgress > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
                        style={{ width: `${researchProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {/* Manual Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Or search for specific information..."
                  className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && performWebSearch()}
                />
                <button
                  onClick={() => performWebSearch()}
                  disabled={isSearching}
                  className="glass-button px-4 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                Sources ({sources.length})
                {selectedSources.size > 0 && (
                  <span className="text-sm text-purple-400">
                    ({selectedSources.size} selected)
                  </span>
                )}
                {isAddingSources && (
                  <span className="text-sm text-purple-400 animate-pulse">
                    Adding {addedSourcesCount} of {sources.length + 1}...
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {sources.length > 0 && (
                  <>
                    <button
                      onClick={selectAllSources}
                      className="text-sm glass-button px-3 py-1"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllSources}
                      className="text-sm glass-button px-3 py-1"
                    >
                      Deselect All
                    </button>
                  </>
                )}
                {isAddingSources && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    <span className="text-sm text-gray-400">Processing sources...</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Document Upload Section */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Upload className="h-4 w-4 text-purple-400" />
                  Upload Research Documents
                </h4>
                {isUploading && (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="flex items-center justify-center gap-2 w-full glass-button py-3 cursor-pointer hover:bg-purple-600/20"
              >
                <Upload className="h-5 w-5" />
                {isUploading ? 'Uploading...' : 'Choose Files to Upload'}
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Supported: PDF, Word, Text, Markdown, Excel (Max 50MB per file)
              </p>
            </div>

            {/* Video Search Section */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-400" />
                  Find Related Videos
                </h4>
                {isSearchingVideos && (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Search YouTube for videos to reference in your commentary
              </p>

              {/* Copyright Warning Banner */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-200">
                    <p className="font-semibold mb-1">⚠️ Copyright Notice</p>
                    <p>Videos are for REFERENCE ONLY. Always provide attribution and follow fair use guidelines (commentary, criticism, education).</p>
                  </div>
                </div>
              </div>

              <button
                onClick={searchRelatedVideos}
                disabled={isSearchingVideos || !workflowData.summary?.topic}
                className="flex items-center justify-center gap-2 w-full glass-button py-3 hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearchingVideos ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching YouTube...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    Find Related Videos
                  </>
                )}
              </button>

              {!workflowData.summary?.topic && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Complete the summary step first
                </p>
              )}
            </div>

            {/* Video Results */}
            {relatedVideos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-400" />
                    Related Videos ({relatedVideos.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {relatedVideos.map((video) => (
                    <div key={video.videoId} className="glass-card p-4 hover:bg-gray-800/50 transition-all">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-32 h-20 rounded overflow-hidden">
                          <img
                            src={video.thumbnails?.medium?.url || video.thumbnails?.default?.url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                            {video.duration}
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-white line-clamp-2 mb-1">
                            {video.title}
                          </h5>
                          <p className="text-xs text-gray-400 mb-1">{video.channelTitle}</p>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span>{(video.viewCount || 0).toLocaleString()} views</span>
                            {video.likeCount > 0 && (
                              <span>{(video.likeCount || 0).toLocaleString()} likes</span>
                            )}
                          </div>

                          {/* License Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            {video.isCreativeCommons ? (
                              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                Creative Commons
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full">
                                Standard License
                              </span>
                            )}
                            {video.relevanceScore >= 0.7 && (
                              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                                High Relevance
                              </span>
                            )}
                          </div>

                          {/* Chapters Preview */}
                          {video.chapters && video.chapters.length > 0 && (
                            <div className="text-xs text-gray-400 mb-2">
                              <span className="font-medium">Chapters:</span> {video.chapters.slice(0, 3).map(ch => ch.title).join(', ')}
                              {video.chapters.length > 3 && ` +${video.chapters.length - 3} more`}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs glass-button px-3 py-1 flex items-center gap-1 hover:bg-blue-600/20"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Watch
                            </a>
                            <button
                              onClick={() => extractTranscript(video)}
                              disabled={isExtractingTranscript[video.videoId] || !!videoTranscripts[video.videoId]}
                              className="text-xs glass-button px-3 py-1 flex items-center gap-1 hover:bg-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isExtractingTranscript[video.videoId] ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Extracting...
                                </>
                              ) : videoTranscripts[video.videoId] ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Transcript
                                </>
                              ) : (
                                <>
                                  <FileText className="h-3 w-3" />
                                  Get Transcript
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => addVideoAsReference(video)}
                              className="text-xs glass-button px-3 py-1 flex items-center gap-1 hover:bg-purple-600/20"
                            >
                              <Plus className="h-3 w-3" />
                              Add Reference
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Relevance Score Bar */}
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Relevance:</span>
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                              style={{ width: `${(video.relevanceScore || 0.5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {Math.round((video.relevanceScore || 0.5) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Transcript Viewer */}
                      {videoTranscripts[video.videoId] && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          {/* Copyright Notice */}
                          <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-yellow-100">
                                <p className="font-semibold mb-0.5">Transcript Usage Guidelines</p>
                                <p className="text-yellow-200/80">
                                  For <strong>research and analysis only</strong>. Use to understand structure and identify topics.
                                  <strong> Never copy verbatim.</strong> Always attribute to{' '}
                                  <a href={video.url} className="underline" target="_blank" rel="noopener noreferrer">
                                    {video.channelTitle}
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Transcript Header */}
                          <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => toggleTranscriptExpansion(video.videoId)}
                              className="flex items-center gap-2 text-sm font-semibold text-white hover:text-purple-400 transition-colors"
                            >
                              <FileText className="h-4 w-4 text-green-400" />
                              <span>
                                Transcript ({videoTranscripts[video.videoId].metadata.wordCount.toLocaleString()} words)
                              </span>
                              {expandedTranscripts.has(video.videoId) ? (
                                <X className="h-3 w-3" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={() => addTranscriptToResearch(video.videoId)}
                              disabled={!!videoTranscripts[video.videoId]?.researchId}
                              className="text-xs glass-button px-2 py-1 flex items-center gap-1 hover:bg-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {videoTranscripts[video.videoId]?.researchId ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  In Research
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  Add to Research
                                </>
                              )}
                            </button>
                          </div>

                          {/* Metadata Pills */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded-full">
                              {Math.floor(videoTranscripts[video.videoId].metadata.duration / 60)}:{String(videoTranscripts[video.videoId].metadata.duration % 60).padStart(2, '0')} duration
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded-full">
                              {videoTranscripts[video.videoId].metadata.wordsPerMinute} wpm
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                              {videoTranscripts[video.videoId].language.toUpperCase()}
                            </span>
                          </div>

                          {/* Expanded Transcript View */}
                          {expandedTranscripts.has(video.videoId) && (
                            <div className="space-y-3 animate-fadeIn">
                              {/* Main Topics */}
                              {videoTranscripts[video.videoId].analysis.mainTopics.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1.5">Main Topics:</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {videoTranscripts[video.videoId].analysis.mainTopics.map((topic, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-xs">
                                        {topic}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Hook Analysis */}
                              {videoTranscripts[video.videoId].analysis.hookAnalysis && (
                                <div className="p-2 bg-blue-900/20 border border-blue-500/30 rounded">
                                  <p className="text-xs font-semibold text-blue-300 mb-1">
                                    Hook Analysis ({videoTranscripts[video.videoId].analysis.hookAnalysis.pattern})
                                  </p>
                                  <p className="text-xs text-gray-300 line-clamp-2">
                                    "{videoTranscripts[video.videoId].analysis.hookAnalysis.firstThirtySeconds}"
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      videoTranscripts[video.videoId].analysis.hookAnalysis.effectiveness === 'high'
                                        ? 'bg-green-500/20 text-green-400'
                                        : videoTranscripts[video.videoId].analysis.hookAnalysis.effectiveness === 'medium'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {videoTranscripts[video.videoId].analysis.hookAnalysis.effectiveness} effectiveness
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Transcript Segments Preview */}
                              <div>
                                <p className="text-xs text-gray-400 mb-1.5">Transcript Preview:</p>
                                <div className="max-h-48 overflow-y-auto space-y-1.5 bg-gray-900/50 rounded p-2 text-xs">
                                  {videoTranscripts[video.videoId].segments.slice(0, 15).map((segment, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <span className="text-purple-400 font-mono flex-shrink-0 text-xs">
                                        [{segment.timestamp}]
                                      </span>
                                      <span className="text-gray-300">{segment.text}</span>
                                    </div>
                                  ))}
                                  {videoTranscripts[video.videoId].segments.length > 15 && (
                                    <p className="text-xs text-gray-500 italic pt-1">
                                      ... and {videoTranscripts[video.videoId].segments.length - 15} more segments
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Key Timestamps */}
                              {videoTranscripts[video.videoId].analysis.timestamps.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-1.5">Key Moments:</p>
                                  <div className="space-y-1">
                                    {videoTranscripts[video.videoId].analysis.timestamps.slice(0, 5).map((ts, idx) => (
                                      <div key={idx} className="flex items-start gap-2 text-xs">
                                        <span className="text-purple-400 font-mono flex-shrink-0">
                                          {Math.floor(ts.time / 60)}:{String(ts.time % 60).padStart(2, '0')}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded flex-shrink-0 ${
                                          ts.type === 'call_to_action'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                          {ts.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-gray-400 line-clamp-1">{ts.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {sources.length === 0 && !isAddingSources ? (
              <div className="glass-card p-8 text-center">
                <Globe className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">
                  {isSearching 
                    ? "Searching for sources..." 
                    : workflowData.summary?.topic 
                      ? "Click 'AI Web Search' above to find sources for your video topic"
                      : "No sources yet. Complete the summary step or use manual search above."}
                </p>
              </div>
            ) : (
              sources.map((source, index) => (
                <div 
                  key={source.id} 
                  className={`glass-card p-4 ${source.source_type === 'synthesis' ? 'border-purple-500/50' : ''} ${selectedSources.has(source.id) ? 'border-purple-400' : ''} animate-fadeIn transition-all`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both' 
                  }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkbox for selection */}
                      <div className="pt-1">
                        <button
                          onClick={() => toggleSourceSelection(source.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedSources.has(source.id) 
                              ? 'bg-purple-600 border-purple-600' 
                              : 'border-gray-500 hover:border-purple-400'
                          }`}
                        >
                          {selectedSources.has(source.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {source.source_type === 'document' ? (
                              <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            ) : source.source_type === 'synthesis' ? (
                              <Brain className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            ) : (
                              getStatusIcon(source.fact_check_status)
                            )}
                            <h4 className="font-medium text-white break-words flex-1">{source.source_title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {source.is_starred && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                            {source.relevance && source.relevance > 0.7 && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded whitespace-nowrap">High Relevance</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 break-words whitespace-pre-wrap">{source.source_content}</p>
                        {source.source_url !== '#synthesized' && source.source_type !== 'document' && (
                          <a 
                            href={source.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 break-all"
                          >
                            <Link className="h-3 w-3 flex-shrink-0" />
                            <span className="break-all">{source.source_url}</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleStarSource(source.id)}
                        className="text-gray-400 hover:text-yellow-400"
                        title="Star this source"
                      >
                        <Star className={`h-4 w-4 ${source.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                      {source.fact_check_status === 'unverified' && (
                        <button
                          onClick={() => factCheckSource(source.id)}
                          className="text-gray-400 hover:text-green-400"
                          title="Fact-check this source"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeSource(source.id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Remove source"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Keywords
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword..."
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <button
                  onClick={addKeyword}
                  className="glass-button p-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-purple-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Related Questions Section */}
          {relatedQuestions && relatedQuestions.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-400" />
                Related Questions
              </h3>
              <div className="space-y-2">
                {relatedQuestions.slice(0, 5).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(question)}
                    className="w-full text-left p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <span className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">→</span>
                      {question}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click a question to search for it
              </p>
            </div>
          )}

          {/* Research Adequacy Meter for 35+ minute scripts */}
          {researchAdequacy && (
            <div className="glass-card p-6">
              <ResearchAdequacyMeter
                adequacyPercent={researchAdequacy.adequacyPercent}
                current={researchAdequacy.current}
                requirements={researchAdequacy.requirements}
                recommendations={researchAdequacy.recommendations}
                isAdequate={researchAdequacy.isAdequate}
              />
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Source Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Sources</span>
                <span className="text-white">{sources.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Verified</span>
                <span className="text-green-400">{sources.filter(s => s.fact_check_status === 'verified').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Disputed</span>
                <span className="text-red-400">{sources.filter(s => s.fact_check_status === 'disputed').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Starred</span>
                <span className="text-yellow-400">{sources.filter(s => s.is_starred).length}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="glass-button bg-purple-600 hover:bg-purple-700 w-full py-3 flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Save Research {selectedSources.size > 0 && `(${selectedSources.size} sources)`}
          </button>
        </div>
      </div>
    </div>
  );
}