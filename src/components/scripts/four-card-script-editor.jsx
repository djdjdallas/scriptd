'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Clock, 
  User, 
  History, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Search,
  Video,
  BarChart3,
  ScrollText,
  Sparkles,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AUTOSAVE_DELAY = 30000; // 30 seconds

// Card templates
const CARD_TEMPLATES = {
  mainScript: {
    sections: [
      { name: 'HOOK', time: '0:00-0:15', placeholder: 'Write a compelling opening line that grabs attention immediately...' },
      { name: 'PVSS STRUCTURE', time: '0:15-0:30', subsections: [
        { name: 'PROOF', placeholder: 'Your credibility statement...' },
        { name: 'VALUE', placeholder: 'What they\'ll learn today...' },
        { name: 'STRUCTURE', placeholder: 'How you\'ll teach it...' },
        { name: 'STAKES', placeholder: 'Why this matters now...' }
      ]},
      { name: 'MAIN CONTENT', time: '0:30-[end]', placeholder: 'The main content of your script organized by sections...' },
      { name: 'CONCLUSION', time: '[timestamp]', placeholder: 'Summary and call to action...' }
    ]
  }
};

export default function FourCardScriptEditor({ 
  script, 
  onSave, 
  onVersionSave,
  onRevert,
  canEdit = true,
  className = ''
}) {
  const { toast } = useToast();
  const [activeCard, setActiveCard] = useState('main');
  const [copied, setCopied] = useState(false);
  
  // Parse existing content into 4 cards or initialize with script content
  const parseScriptContent = (content, scriptData) => {
    if (!content) {
      // Initialize with default structure based on script metadata
      return {
        mainScript: '',
        research: scriptData?.metadata?.research_sources ? 
          `## Research Sources\n${scriptData.metadata.research_sources} sources verified` : '',
        production: '',
        metadata: scriptData?.metadata ? 
          `## Video Metadata\n- Target Length: ${Math.floor((scriptData.metadata.target_duration || 600) / 60)} minutes\n- Primary Keywords: ${scriptData.metadata.keywords?.join(', ') || 'Not set'}\n- Target Audience: ${scriptData.metadata.target_audience || 'General'}\n- Tone: ${scriptData.metadata.tone || 'Professional'}` : ''
      };
    }

    // Check if content already has the 4-card structure
    const cardDivider = '---';
    const cardHeaders = {
      main: '## 📝 CARD 1: MAIN SCRIPT',
      research: '## 🔍 CARD 2: RESEARCH & VERIFICATION',
      production: '## 🎬 CARD 3: PRODUCTION GUIDE',
      metadata: '## 📊 CARD 4: METADATA & OPTIMIZATION'
    };

    // Try to parse existing 4-card structure
    if (content.includes(cardHeaders.main)) {
      const cards = {};
      const sections = content.split(cardDivider);
      
      sections.forEach(section => {
        if (section.includes(cardHeaders.main)) {
          cards.mainScript = section.replace(cardHeaders.main, '').trim();
        } else if (section.includes(cardHeaders.research)) {
          cards.research = section.replace(cardHeaders.research, '').trim();
        } else if (section.includes(cardHeaders.production)) {
          cards.production = section.replace(cardHeaders.production, '').trim();
        } else if (section.includes(cardHeaders.metadata)) {
          cards.metadata = section.replace(cardHeaders.metadata, '').trim();
        }
      });

      return {
        mainScript: cards.mainScript || content,
        research: cards.research || '',
        production: cards.production || '',
        metadata: cards.metadata || ''
      };
    }

    // If not 4-card structure, put all content in main script and generate metadata
    return {
      mainScript: content,
      research: scriptData?.metadata?.research_sources ? 
        `## Research Sources\n${scriptData.metadata.research_sources} sources verified` : '',
      production: '',
      metadata: scriptData?.metadata ? 
        `## Video Metadata\n- Target Length: ${Math.floor((scriptData.metadata.target_duration || 600) / 60)} minutes\n- Primary Keywords: ${scriptData.metadata.keywords?.join(', ') || scriptData.tags?.join(', ') || 'Not set'}\n- Target Audience: ${scriptData.metadata.target_audience || 'General'}\n- Tone: ${scriptData.metadata.tone || 'Professional'}` : ''
    };
  };

  const initialCards = parseScriptContent(script.content, script);
  
  const [title, setTitle] = useState(script.title || '');
  const [cards, setCards] = useState(initialCards);
  const [searchQueries, setSearchQueries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Editor state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(script.updated_at ? new Date(script.updated_at) : null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Character and timing calculations
  const [stats, setStats] = useState({
    characters: 0,
    words: 0,
    estimatedDuration: 0
  });
  
  const autoSaveTimeoutRef = useRef(null);
  const initialDataRef = useRef({
    title: script.title || '',
    cards: initialCards
  });

  // Validate all cards are populated
  const validateCards = () => {
    const errors = [];
    if (!cards.mainScript || cards.mainScript.trim().length < 100) {
      errors.push('Main Script must have at least 100 characters');
    }
    if (!cards.research || cards.research.trim().length < 50) {
      errors.push('Research card must have at least 50 characters');
    }
    if (!cards.production || cards.production.trim().length < 50) {
      errors.push('Production card must have at least 50 characters');
    }
    if (!cards.metadata || cards.metadata.trim().length < 50) {
      errors.push('Metadata card must have at least 50 characters');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Calculate stats whenever content changes
  useEffect(() => {
    const mainText = cards.mainScript || '';
    const characters = mainText.length;
    const words = mainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const estimatedDuration = Math.max(1, Math.round(words / 150)); // 150 words per minute average speaking rate
    
    setStats({ characters, words, estimatedDuration });
  }, [cards.mainScript]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      title !== initialDataRef.current.title ||
      JSON.stringify(cards) !== JSON.stringify(initialDataRef.current.cards);
    setHasUnsavedChanges(hasChanges);
  }, [title, cards]);

  // Combine cards into single content for saving
  const combineCardsToContent = () => {
    return `## 📝 CARD 1: MAIN SCRIPT
${cards.mainScript}

---

## 🔍 CARD 2: RESEARCH & VERIFICATION
${cards.research}

---

## 🎬 CARD 3: PRODUCTION GUIDE
${cards.production}

---

## 📊 CARD 4: METADATA & OPTIMIZATION
${cards.metadata}`;
  };

  // Auto-save functionality
  const performSave = useCallback(async (isAutoSave = false) => {
    if (!canEdit || saving) return;
    
    // Validate before saving
    if (!isAutoSave && !validateCards()) {
      toast({
        title: "Incomplete Script",
        description: "Please fill all 4 cards with sufficient content before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const combinedContent = combineCardsToContent();
      const updatedScript = {
        ...script,
        title: title.trim(),
        content: combinedContent,
        hook: cards.mainScript.split('\n')[0]?.substring(0, 300) || '', // First line as hook
        description: script.description || '',
        tags: script.tags || [],
        updated_at: new Date().toISOString(),
        edit_count: (script.edit_count || 0) + 1,
        metadata: {
          ...script.metadata,
          fourCardStructure: true,
          lastCardUpdate: new Date().toISOString()
        }
      };
      
      await onSave(updatedScript);
      
      setLastSaved(new Date());
      initialDataRef.current = { title, cards: { ...cards } };
      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast({
          title: "Script Saved",
          description: "All 4 cards have been saved successfully.",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveError(error.message);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [canEdit, saving, script, title, cards, onSave, toast]);

  // Auto-save timer
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || !canEdit) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave(true);
    }, AUTOSAVE_DELAY);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSaveEnabled, hasUnsavedChanges, canEdit, performSave]);

  // Manual save
  const handleSave = () => {
    performSave(false);
  };

  // Copy full script to clipboard
  const copyToClipboard = async () => {
    const content = combineCardsToContent();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Full script copied to clipboard",
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy script to clipboard",
        variant: "destructive"
      });
    }
  };

  // Perform web search for fact-checking
  const performWebSearch = async (query) => {
    setSearching(true);
    try {
      // This would integrate with your search API
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(prev => [...prev, { query, results }]);
        
        // Auto-append to research card
        const researchEntry = `### Search: "${query}"
Result: ${results.summary || 'No results found'}
Source: ${results.source || 'N/A'}
Confidence: ${results.confidence || 'Low'}

`;
        setCards(prev => ({
          ...prev,
          research: prev.research + researchEntry
        }));
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Could not perform web search",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'k':
            e.preventDefault();
            copyToClipboard();
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const cardIcons = {
    main: <ScrollText className="h-5 w-5" />,
    research: <Search className="h-5 w-5" />,
    production: <Video className="h-5 w-5" />,
    metadata: <BarChart3 className="h-5 w-5" />
  };

  const cardDescriptions = {
    main: 'Clean, performable script content only',
    research: 'Fact-checking, sources, and verification',
    production: 'Visual and audio production notes',
    metadata: 'SEO, analytics, and optimization'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Editor Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">4-Card Script System</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {lastSaved && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                  </span>
                )}
                {stats.words > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {stats.words.toLocaleString()} words • ~{stats.estimatedDuration} min
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                Unsaved changes
              </Badge>
            )}
            
            {saving && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Saving...
              </Badge>
            )}
            
            {!hasUnsavedChanges && lastSaved && !saving && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                All cards saved
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <div className="font-semibold mb-2">Please complete all 4 cards:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Title Input */}
      <div className="glass-card p-4">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Video Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your video title..."
          className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50"
          maxLength={200}
        />
      </div>

      {/* 4-Card Tabs */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="w-full">
          <div className="border-b border-white/5">
            <div className="flex">
              <button
                onClick={() => setActiveCard('main')}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all relative ${
                  activeCard === 'main' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <ScrollText className="h-4 w-4" />
                <span className="text-sm">Main Script</span>
                {activeCard === 'main' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                )}
              </button>
              <button
                onClick={() => setActiveCard('research')}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all relative ${
                  activeCard === 'research' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Research</span>
                {activeCard === 'research' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                )}
              </button>
              <button
                onClick={() => setActiveCard('production')}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all relative ${
                  activeCard === 'production' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Video className="h-4 w-4" />
                <span className="text-sm">Production</span>
                {activeCard === 'production' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                )}
              </button>
              <button
                onClick={() => setActiveCard('metadata')}
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all relative ${
                  activeCard === 'metadata' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Metadata</span>
                {activeCard === 'metadata' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Main Script Card */}
            {activeCard === 'main' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-3 bg-purple-500/10 rounded-lg">
                  <strong>Card 1:</strong> {cardDescriptions.main}
                </div>
                <Textarea
                  value={cards.mainScript}
                  onChange={(e) => setCards(prev => ({ ...prev, mainScript: e.target.value }))}
                  placeholder={`**HOOK (0:00-0:15)**
[Your compelling opening line here - pure dialogue only]

**PVSS STRUCTURE (0:15-0:30)**
PROOF: [Your credibility statement]
VALUE: [What they'll learn today]
STRUCTURE: [How you'll teach it]
STAKES: [Why this matters now]

**MAIN CONTENT (0:30-[end])**
[All spoken content organized by sections]

**CONCLUSION ([timestamp])**
[Summary and call to action]`}
                  className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-purple-500/50 min-h-[500px] font-mono"
                  disabled={!canEdit}
                />
              </div>
            )}

            {/* Research Card */}
            {activeCard === 'research' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-3 bg-blue-500/10 rounded-lg">
                  <strong>Card 2:</strong> {cardDescriptions.research}
                </div>
                
                {/* Quick Search */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter search query for fact-checking..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        performWebSearch(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="glass-input bg-gray-900/50"
                    disabled={searching}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={searching}
                    className="glass-button"
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Textarea
                  value={cards.research}
                  onChange={(e) => setCards(prev => ({ ...prev, research: e.target.value }))}
                  placeholder={`### Web Search Verification Log
**REQUIRED: Minimum 5 searches performed**
1. Search: "[query]" → Result: [finding]
2. Search: "[query]" → Result: [finding]

### Verified Claims & Sources
✅ **Claim 1**: [Specific claim]
   - Source: [Publication]
   - URL: [Full URL]
   - Confidence: [High/Medium/Low]

### Statistics Used
📊 **Stat 1**: [Number/percentage]
   - Context: [How used]
   - Source: [Origin]`}
                  className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-blue-500/50 min-h-[500px] font-mono"
                  disabled={!canEdit}
                />
              </div>
            )}

            {/* Production Card */}
            {activeCard === 'production' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-3 bg-green-500/10 rounded-lg">
                  <strong>Card 3:</strong> {cardDescriptions.production}
                </div>
                <Textarea
                  value={cards.production}
                  onChange={(e) => setCards(prev => ({ ...prev, production: e.target.value }))}
                  placeholder={`### Visual Timeline
**0:00-0:15 - HOOK**
- B-roll needed: [Footage description]
- Text overlay: "[Text to display]"
- Graphics: [Animations/graphics]

**0:15-0:30 - PVSS**
- Visual style: [Presentation style]
- Text overlays: [Key points]

### Audio Requirements
**Background Music**
- Intro: [Style/mood]
- Main content: [Style/mood]

**Sound Effects**
- [Timestamp]: [Effect] - [Purpose]

### Pattern Interrupt Markers
1. [Timestamp]: [Type] - [Change]`}
                  className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-green-500/50 min-h-[500px] font-mono"
                  disabled={!canEdit}
                />
              </div>
            )}

            {/* Metadata Card */}
            {activeCard === 'metadata' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4 p-3 bg-orange-500/10 rounded-lg">
                  <strong>Card 4:</strong> {cardDescriptions.metadata}
                </div>
                <Textarea
                  value={cards.metadata}
                  onChange={(e) => setCards(prev => ({ ...prev, metadata: e.target.value }))}
                  placeholder={`### SEO Optimization
**Primary Keyword**: [Main keyword]
**Secondary Keywords**: 
1. [Keyword 2]
2. [Keyword 3]

**Title Options for A/B Testing**:
1. [Title 1] - Focus: [emphasis]
2. [Title 2] - Focus: [emphasis]

**Description Template**:
[First 125 characters]
[Rest of description]

**Tags** (in order):
1. [Tag 1]
2. [Tag 2]

### Performance Predictions
**Expected Metrics**:
- CTR: X% (benchmark: Y%)
- 30-sec retention: X%
- Average view duration: X%

### Thumbnail Requirements
**Key Elements**:
1. [Visual element] - [Why important]
2. [Text overlay]: "[Text]"`}
                  className="glass-input bg-gray-900/50 text-white placeholder-gray-500 border-gray-700/50 focus:border-orange-500/50 min-h-[500px] font-mono"
                  disabled={!canEdit}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-500 bg-gray-900/50 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-gray-300">Auto-save every 30s</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="glass-button"
              disabled={!cards.mainScript}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy Full Script
            </Button>
            
            {onRevert && (
              <Button
                onClick={onRevert}
                variant="outline"
                className="glass-button"
                disabled={saving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Revert
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50"
              disabled={saving || !hasUnsavedChanges}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save All Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Card Completion Status */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(cards).map(([key, value]) => {
            const filled = value.trim().length > 50;
            const cardName = key === 'mainScript' ? 'Main Script' : 
                           key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="text-center">
                <div className={`p-3 rounded-lg ${filled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  {filled ? (
                    <CheckCircle className="h-6 w-6 text-green-400 mx-auto" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-gray-400 mx-auto" />
                  )}
                </div>
                <p className="text-xs mt-2 text-gray-400">{cardName}</p>
                <p className="text-xs text-gray-500">
                  {value.trim().length} chars
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}