'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentIdeaBanner({ contentIdeaInfo, niche, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  console.log('ContentIdeaBanner render:', { contentIdeaInfo, niche, compact });

  if (!contentIdeaInfo) {
    console.log('ContentIdeaBanner: No contentIdeaInfo, returning null');
    return null;
  }

  const truncateText = (text, maxLength = 60) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const copyAllToClipboard = async () => {
    try {
      // Compile all content idea info into formatted text
      let textToCopy = '';

      if (contentIdeaInfo.title) {
        textToCopy += `Title: ${contentIdeaInfo.title}\n\n`;
      }
      if (contentIdeaInfo.hook) {
        textToCopy += `Hook: ${contentIdeaInfo.hook}\n\n`;
      }
      if (contentIdeaInfo.description) {
        textToCopy += `Description: ${contentIdeaInfo.description}\n\n`;
      }
      if (contentIdeaInfo.basedOnEvent) {
        textToCopy += `Based on Event: ${contentIdeaInfo.basedOnEvent}\n\n`;
      }
      if (contentIdeaInfo.specifics) {
        textToCopy += `Specifics: ${contentIdeaInfo.specifics}\n\n`;
      }
      if (contentIdeaInfo.estimatedViews) {
        textToCopy += `Estimated Views: ${contentIdeaInfo.estimatedViews}\n\n`;
      }
      if (niche) {
        textToCopy += `Niche: ${niche}`;
      }

      await navigator.clipboard.writeText(textToCopy.trim());
      setCopiedField('all');
      toast.success('Copied all content idea details to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  if (!compact) {
    // Full display (for Summary step)
    return (
      <div className="glass-card-no-overflow p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Content Idea Loaded</h3>
              <button
                onClick={copyAllToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-lg text-green-400 text-sm font-medium transition-all"
                title="Copy all content idea details"
              >
                {copiedField === 'all' ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {contentIdeaInfo.title && (
                <div>
                  <span className="text-green-400 font-medium">Title: </span>
                  <span className="text-gray-300">{contentIdeaInfo.title}</span>
                </div>
              )}
              {contentIdeaInfo.hook && (
                <div>
                  <span className="text-green-400 font-medium">Hook: </span>
                  <span className="text-gray-300">{contentIdeaInfo.hook}</span>
                </div>
              )}
              {contentIdeaInfo.description && (
                <div>
                  <span className="text-green-400 font-medium">Description: </span>
                  <span className="text-gray-300">{contentIdeaInfo.description}</span>
                </div>
              )}
              {contentIdeaInfo.basedOnEvent && (
                <div>
                  <span className="text-green-400 font-medium">Based on Event: </span>
                  <span className="text-gray-300">{contentIdeaInfo.basedOnEvent}</span>
                </div>
              )}
              {contentIdeaInfo.specifics && (
                <div>
                  <span className="text-green-400 font-medium">Specifics: </span>
                  <span className="text-gray-300">{contentIdeaInfo.specifics}</span>
                </div>
              )}
              {contentIdeaInfo.estimatedViews && (
                <div>
                  <span className="text-green-400 font-medium">Est. Views: </span>
                  <span className="text-green-300 font-semibold">{contentIdeaInfo.estimatedViews}</span>
                </div>
              )}
              {niche && (
                <div>
                  <span className="text-green-400 font-medium">Niche: </span>
                  <span className="text-gray-300">{niche}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact display (for other steps) - collapsible
  const handleToggle = () => {
    console.log('Toggle clicked! Current state:', isExpanded);
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="glass-card p-4 bg-gradient-to-r from-green-500/5 to-blue-500/5 border border-green-500/20">
      <div className="flex items-center justify-between gap-3 mb-2">
        <button
          onClick={handleToggle}
          type="button"
          className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">Content Idea</h4>
            <p className="text-xs text-gray-400 truncate">
              {truncateText(contentIdeaInfo.title || contentIdeaInfo.basedOnEvent || 'Content Idea Loaded', 80)}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </button>
        <button
          onClick={copyAllToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded text-green-400 text-xs font-medium transition-all flex-shrink-0"
          title="Copy all content idea details"
        >
          {copiedField === 'all' ? (
            <>
              <Check className="h-3 w-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
          {contentIdeaInfo.title && (
            <div>
              <span className="text-green-400 font-medium">Title: </span>
              <span className="text-gray-300">{contentIdeaInfo.title}</span>
            </div>
          )}
          {contentIdeaInfo.hook && (
            <div>
              <span className="text-green-400 font-medium">Hook: </span>
              <span className="text-gray-300">{contentIdeaInfo.hook}</span>
            </div>
          )}
          {contentIdeaInfo.description && (
            <div>
              <span className="text-green-400 font-medium">Description: </span>
              <span className="text-gray-300">{contentIdeaInfo.description}</span>
            </div>
          )}
          {contentIdeaInfo.basedOnEvent && (
            <div>
              <span className="text-green-400 font-medium">Based on Event: </span>
              <span className="text-gray-300">{contentIdeaInfo.basedOnEvent}</span>
            </div>
          )}
          {contentIdeaInfo.specifics && (
            <div>
              <span className="text-green-400 font-medium">Specifics: </span>
              <span className="text-gray-300">{contentIdeaInfo.specifics}</span>
            </div>
          )}
          {contentIdeaInfo.estimatedViews && (
            <div>
              <span className="text-green-400 font-medium">Est. Views: </span>
              <span className="text-green-300 font-semibold">{contentIdeaInfo.estimatedViews}</span>
            </div>
          )}
          {niche && (
            <div>
              <span className="text-green-400 font-medium">Niche: </span>
              <span className="text-gray-300">{niche}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
