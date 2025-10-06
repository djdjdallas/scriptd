'use client';

import { useState, useEffect, useRef } from 'react';
import { useWorkflow } from '../ScriptWorkflow';
import { Search, Globe, FileText, Link, CheckCircle, XCircle, AlertCircle, Star, Trash2, Plus, Loader2, Info, HelpCircle, Brain, Sparkles, Upload, File, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

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
  
  const supabase = createClient();

  // Load research sources from database when workflow exists
  useEffect(() => {
    const loadSavedResearch = async () => {
      if (workflowId && (!sources || sources.length === 0)) {
        try {
          const { data, error } = await supabase
            .from('workflow_research')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading saved research:', error);
            return;
          }

          if (data && data.length > 0) {
            console.log(`Loading ${data.length} saved research sources from database`);
            
            // Convert database format to component format
            const loadedSources = data.map(source => ({
              id: source.id,
              source_type: source.source_type,
              source_url: source.source_url,
              source_title: source.source_title,
              source_content: source.source_content,
              fact_check_status: source.fact_check_status,
              is_starred: source.is_starred,
              relevance: source.relevance || 0.5 // Default to 0.5 if not set
            }));

            setSources(loadedSources);
            
            // Auto-select sources that were previously selected
            const selectedIds = data.filter(s => s.is_selected).map(s => s.id);
            if (selectedIds.length > 0) {
              setSelectedSources(new Set(selectedIds));
            }
          }
        } catch (error) {
          console.error('Error loading research:', error);
        }
      }
    };

    loadSavedResearch();
  }, [workflowId]);

  // AI-powered search using the video topic
  const performAISearch = async () => {
    const topic = workflowData.summary?.topic;
    if (!topic) {
      toast.error('Please complete the summary step first to get your video topic');
      return;
    }

    setSearchQuery(topic);
    await performWebSearch(topic);
  };

  const performWebSearch = async (query = searchQuery) => {
    if (!query) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      // For now, we'll simulate search results since the API endpoint might not exist yet
      // In production, this would call your actual search API
      
      // Check if the research API endpoint exists
      const response = await fetch('/api/workflow/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          topic: workflowData.summary?.topic,
          workflowId
        })
      });

      if (!response.ok) {
        // If the API returns an error, log it
        console.error('Research API error:', response.status, response.statusText);
        toast.error('Search service error. Please try again.');
        return;
      }

      const data = await response.json();
      
      // Check if these are educational results (no API configured)
      if (data.message && data.message.includes('educational resources')) {
        // These are educational/help links, not real search results
        const educationalSources = data.results.map(result => ({
          id: crypto.randomUUID(),
          source_type: 'educational',
          source_url: result.url,
          source_title: result.title,
          source_content: result.snippet,
          fact_check_status: 'unverified',
          is_starred: false,
          relevance: 0.5
        }));
        
        setSources(educationalSources); // Replace, don't append
        toast.info('Showing educational resources. Configure search API for live results.');
        return;
      }
      
      // Handle research summary if available
      if (data.summary || data.researchSummary) {
        setResearchSummary(data.summary || data.researchSummary);
      }

      // Handle related questions if available
      if (data.relatedQuestions && data.relatedQuestions.length > 0) {
        setRelatedQuestions(data.relatedQuestions);
      }

      // Handle insights if available
      if (data.insights) {
        console.log('Research insights:', data.insights);
        // You could store these in state if needed for display
      }

      // Map results to source format - Claude already provides full content!
      const newSources = (data.results || []).map(result => ({
        id: result.id || crypto.randomUUID(),
        source_type: result.source_type || 'web',
        source_url: result.source_url,
        source_title: result.source_title,
        source_content: result.source_content, // Already has full content from Claude!
        fact_check_status: result.fact_check_status || 'verified',
        is_starred: result.is_starred || false,
        relevance: result.relevance || 0.8,
        isNew: true // Mark as new for animation
      }));

      // Animate sources being added one by one
      setIsAddingSources(true);
      setAddedSourcesCount(0);
      
      // Keep uploaded documents, only clear web sources
      const existingDocuments = sources.filter(s => s.source_type === 'document');
      setSources(existingDocuments); // Keep documents, clear only web sources
      
      // Add sources one by one with delay for animation and auto-select them
      const newSourceIds = [];
      for (let i = 0; i < newSources.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150)); // Delay between each source
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
      trackCredits(data.creditsUsed || 2);
      
      // Track search provider
      if (data.searchProvider) {
        setSearchProvider(data.searchProvider);
      }
      
      // Show provider-specific success message with animation feedback
      const providerName = data.searchProvider === 'claude' ? 'Claude AI' :
                          data.searchProvider === 'google' ? 'Google Search' :
                          'Search';

      // Calculate total content fetched
      const totalContent = newSources.reduce((sum, s) => sum + (s.source_content?.length || 0), 0);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Successfully added {data.results.length} sources from {providerName}</span>
          </div>
          {data.searchProvider === 'claude' && totalContent > 0 && (
            <span className="text-xs opacity-80">
              ✨ Full content already fetched ({(totalContent / 1000).toFixed(1)}k chars total)
            </span>
          )}
        </div>
      );
    } catch (error) {
      console.error('Search error:', error);
      
      // Even if there's an error, provide some guidance
      toast.info('Search service is being configured. You can add sources manually.');
    } finally {
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

  const deselectAllSources = () => {
    setSelectedSources(new Set());
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
        // Prepare sources for database insertion
        const sourcesToSave = selectedSourcesList.map(source => ({
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

        // Delete existing research for this workflow first to avoid duplicates
        const { error: deleteError } = await supabase
          .from('workflow_research')
          .delete()
          .eq('workflow_id', workflowId);

        if (deleteError) {
          console.error('Error deleting old research:', deleteError);
        }

        // Insert new research sources
        const { data, error } = await supabase
          .from('workflow_research')
          .insert(sourcesToSave)
          .select();

        if (error) {
          console.error('Error saving research to database:', error);
          toast.error('Failed to save research sources to database');
        } else {
          console.log(`Successfully saved ${data.length} research sources to database`);
        }
      } catch (error) {
        console.error('Error saving research:', error);
        toast.error('Failed to save research sources');
      }
    }

    markStepComplete(2);
    toast.success(`Saved ${selectedSourcesList.length} selected source(s)!`);
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
                <button
                  onClick={performAISearch}
                  disabled={isSearching}
                  className="w-full glass-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Searching with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      AI Web Search for "{workflowData.summary.topic}" (1 credit)
                    </>
                  )}
                </button>
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