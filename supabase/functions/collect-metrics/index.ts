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
    
    // For now, we'll create placeholder metrics
    // In production, you'd integrate with YouTube API here
    const topicMetrics = []
    const channelMetrics = []
    
    // Sample trending topics (in production, fetch from YouTube)
    const sampleTopics = [
      { name: 'ai tools', category: 'technology', score: 95 },
      { name: 'web development', category: 'technology', score: 88 },
      { name: 'react tutorial', category: 'education', score: 82 },
      { name: 'gaming setup', category: 'gaming', score: 79 },
      { name: 'music production', category: 'music', score: 75 }
    ]

    // Store topic metrics
    for (const topic of sampleTopics) {
      topicMetrics.push({
        topic_name: topic.name,
        category: topic.category,
        score: topic.score,
        engagement_rate: Math.random() * 10, // Random for demo
        avg_views: Math.floor(Math.random() * 100000),
        channel_count: Math.floor(Math.random() * 20) + 5,
        recorded_at: now
      })
    }

    // Insert topic metrics
    if (topicMetrics.length > 0) {
      const { error: topicsError } = await supabaseClient
        .from('trending_topics_history')
        .insert(topicMetrics)
      
      if (topicsError) {
        console.error('Error storing topic metrics:', topicsError)
      }
    }

    // Get all channels to update metrics
    const { data: channels } = await supabaseClient
      .from('channels')
      .select('id, youtube_channel_id, subscriber_count, view_count, video_count')
      .limit(10)

    if (channels && channels.length > 0) {
      for (const channel of channels) {
        // In production, fetch real stats from YouTube
        // For demo, simulate growth
        const growthFactor = 1 + (Math.random() * 0.05) // 0-5% growth
        
        channelMetrics.push({
          channel_id: channel.id,
          subscriber_count: Math.floor((channel.subscriber_count || 0) * growthFactor),
          view_count: Math.floor((channel.view_count || 0) * growthFactor),
          video_count: channel.video_count || 0,
          average_views: Math.floor(((channel.view_count || 0) * growthFactor) / Math.max(channel.video_count || 1, 1)),
          engagement_rate: Math.random() * 5, // Random 0-5% for demo
          snapshot_date: now
        })
      }

      // Store channel metrics
      if (channelMetrics.length > 0) {
        const { error: channelsError } = await supabaseClient
          .from('channel_metrics_history')
          .insert(channelMetrics)
        
        if (channelsError) {
          console.error('Error storing channel metrics:', channelsError)
        }
      }
    }

    // Clean up old metrics (keep only last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    await supabaseClient
      .from('trending_topics_history')
      .delete()
      .lt('recorded_at', thirtyDaysAgo.toISOString())
    
    await supabaseClient
      .from('channel_metrics_history')
      .delete()
      .lt('snapshot_date', thirtyDaysAgo.toISOString())

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          topicsCollected: topicMetrics.length,
          channelsCollected: channelMetrics.length,
          timestamp: now
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

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