'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ScriptEditor } from '@/components/script-builder/script-editor';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function ScriptPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScript();
  }, [params.id]);

  const fetchScript = async () => {
    try {
      const response = await fetch(`/api/scripts/${params.id}`);
      if (!response.ok) {
        throw new Error('Script not found');
      }
      const data = await response.json();
      setScript(data);
    } catch (error) {
      console.error('Error fetching script:', error);
      toast({
        title: "Error",
        description: "Failed to load script",
        variant: "destructive"
      });
      router.push('/scripts');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedScript) => {
    const response = await fetch(`/api/scripts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedScript)
    });

    if (!response.ok) {
      throw new Error('Failed to save script');
    }

    const data = await response.json();
    setScript(data);
    return data;
  };

  const handleExport = async (format) => {
    const response = await fetch(`/api/scripts/${params.id}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Export failed');
    }

    return response.json();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!script) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/scripts">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Scripts
        </Link>
      </Button>

      {/* Script editor */}
      <ScriptEditor
        script={script}
        onSave={handleSave}
        onExport={handleExport}
        readOnly={false}
      />
    </div>
  );
}