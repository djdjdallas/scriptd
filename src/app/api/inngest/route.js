import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { generateScriptFunction } from '@/lib/inngest/functions/generate-script';
import { voiceTrainingFunction } from '@/lib/inngest/functions/voice-training';
import { researchFunction } from '@/lib/inngest/functions/research';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateScriptFunction, voiceTrainingFunction, researchFunction],
});
