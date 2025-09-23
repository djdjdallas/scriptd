import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // This function will be called by pg_cron, so we don't need authentication
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
      // If not called with service role key, check if it's from pg_cron
      const caller = req.headers.get('x-supabase-caller')
      if (caller !== 'pg_cron') {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const now = new Date().toISOString()
    
    // Call your Next.js API endpoint to collect real YouTube metrics
    const apiUrl = Deno.env.get('NEXT_PUBLIC_URL') || 'https://subscribr.ai'
    const cronSecret = Deno.env.get('CRON_SECRET') || ''
    
    try {
      // Call the existing collect-metrics endpoint
      const response = await fetch(`${apiUrl}/api/cron/collect-metrics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'x-vercel-cron': 'true'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to collect metrics: ${response.status}`)
      }
      
      const result = await response.json()
      
      return new Response(
        JSON.stringify({
          success: true,
          metrics: result.metrics || {
            topicsCollected: 0,
            channelsCollected: 0,
            timestamp: now
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (metricsError) {
      console.error('Error calling metrics endpoint:', metricsError)
      
      // Fallback: collect basic metrics directly
      const topicMetrics = []
      const channelMetrics = []
      
      // Store some basic trending topics as fallback
      const fallbackTopics = [
        { name: 'trending now', category: 'general', score: 50 },
        { name: 'viral content', category: 'general', score: 45 }
      ]

      for (const topic of fallbackTopics) {
        topicMetrics.push({
          topic_name: topic.name,
          category: topic.category,
          score: topic.score,
          engagement_rate: 0,
          avg_views: 0,
          channel_count: 0,
          recorded_at: now
        })
      }

      // Insert fallback topic metrics if we have them
      if (topicMetrics.length > 0) {
        const { error: topicsError } = await supabaseClient
          .from('trending_topics_history')
          .insert(topicMetrics)
        
        if (topicsError) {
          console.error('Error storing topic metrics:', topicsError)
        }
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to collect metrics from API, stored fallback data',
          metrics: {
            topicsCollected: topicMetrics.length,
            channelsCollected: 0,
            timestamp: now
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})