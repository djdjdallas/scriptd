'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Download, 
  Copy, 
  FileText, 
  Clock, 
  Hash,
  Wand2,
  Share2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EXPORT_FORMATS } from '@/lib/constants';

export function ScriptEditor({ script, onSave, onExport, readOnly = false }) {
  const { toast } = useToast();
  const [content, setContent] = useState(script.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    // Calculate word count and reading time
    const words = content.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 150)); // Average speaking rate
  }, [content]);

  const handleSave = async () => {
    if (readOnly || !onSave) return;
    
    setIsSaving(true);
    try {
      await onSave({ ...script, content });
      toast({
        title: "Script Saved",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format) => {
    if (!onExport) return;
    
    setIsExporting(true);
    try {
      const result = await onExport(format);
      
      if (format === EXPORT_FORMATS.GOOGLE_DOCS) {
        // Redirect to Google auth
        window.location.href = result.authUrl;
      } else if ([EXPORT_FORMATS.PDF, EXPORT_FORMATS.DOCX].includes(format)) {
        // Handle client-side generation
        toast({
          title: "Export Initiated",
          description: `Your ${format.toUpperCase()} export is being prepared...`
        });
      } else {
        // Download the file
        const blob = new Blob([result.content], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Complete",
          description: `Script exported as ${format.toUpperCase()}`
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Script copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const formatContent = (text) => {
    // Split content into sections
    const sections = text.split(/\n(?=[A-Z\s]+:)/);
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const header = lines[0];
      const content = lines.slice(1).join('\n');
      
      if (header.match(/^[A-Z\s]+:/)) {
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-primary">{header}</h3>
            <div className="whitespace-pre-wrap text-muted-foreground">{content}</div>
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-4 whitespace-pre-wrap">
          {section}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{script.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{script.type}</Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {script.length} min
            </span>
            <span className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              ~{readingTime} min read
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                readOnly={readOnly}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Your script content..."
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none">
              {formatContent(content)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Script
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport(EXPORT_FORMATS.TXT)}
              disabled={isExporting}
            >
              Text File
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport(EXPORT_FORMATS.MARKDOWN)}
              disabled={isExporting}
            >
              Markdown
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport(EXPORT_FORMATS.PDF)}
              disabled={isExporting}
            >
              PDF
              <Badge variant="secondary" className="ml-2 text-xs">2 credits</Badge>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport(EXPORT_FORMATS.GOOGLE_DOCS)}
              disabled={isExporting}
            >
              Google Docs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Enhancement Tools */}
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" disabled>
                Improve Hook
              </Button>
              <Button variant="outline" disabled>
                Add Transitions
              </Button>
              <Button variant="outline" disabled>
                Generate Thumbnail Ideas
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              AI enhancement tools coming soon...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}