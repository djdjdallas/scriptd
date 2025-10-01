import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const supabase = await createClient();

    // Get trending topics with growth rates
    // Note: RPC functions have SQL ambiguity issues, using direct queries instead
    let topicsWithGrowth = [];
    let channelsWithGrowth = [];
    
    try {
      // Fetch recent topic history data
      const { data: recentTopics, error: topicsError } = await supabase
        .from('trending_topics_history')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit * 2);
      
      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
      } else if (recentTopics && recentTopics.length > 0) {
        // Group by topic and calculate growth
        const topicGroups = {};
        recentTopics.forEach(record => {
          if (!topicGroups[record.topic_name]) {
            topicGroups[record.topic_name] = [];
          }
          topicGroups[record.topic_name].push(record);
        });
        
        topicsWithGrowth = Object.entries(topicGroups)
          .map(([topicName, records]) => {
            const latestScore = records[0]?.score || 0;
            const previousScore = records[1]?.score || latestScore;
            let growthRate = 0;
            
            // Only calculate growth if we have at least 2 data points
            if (records.length > 1 && previousScore > 0) {
              growthRate = ((latestScore - previousScore) / previousScore * 100);
            } else if (records.length === 1) {
              // New topic, show as "New" in UI
              growthRate = null; // Will be handled in UI as "New"
            }
            
            console.log(`Topic: ${topicName}, Records: ${records.length}, Latest: ${latestScore}, Previous: ${previousScore}, Growth: ${growthRate}`);
            
            return {
              topic_name: topicName,
              category: records[0]?.category || 'unknown',
              current_score: latestScore,
              growth_rate: growthRate !== null ? growthRate.toFixed(2) : null,
              is_new: records.length === 1
            };
          })
          .sort((a, b) => {
            // Sort nulls (new items) to the top
            if (a.growth_rate === null) return -1;
            if (b.growth_rate === null) return 1;
            return parseFloat(b.growth_rate) - parseFloat(a.growth_rate);
          })
          .slice(0, limit);
      }
    } catch (err) {
      console.error('Error processing topics:', err);
    }
    
    try {
      // Fetch recent channel history data
      const { data: recentChannels, error: channelsError } = await supabase
        .from('trending_channels_history')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit * 2);
      
      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
      } else if (recentChannels && recentChannels.length > 0) {
        // Group by channel and calculate growth
        const channelGroups = {};
        recentChannels.forEach(record => {
          if (!channelGroups[record.channel_name]) {
            channelGroups[record.channel_name] = [];
          }
          channelGroups[record.channel_name].push(record);
        });
        
        channelsWithGrowth = Object.entries(channelGroups)
          .map(([channelName, records]) => {
            const latestViews = records[0]?.avg_views || 0;
            const previousViews = records[1]?.avg_views || latestViews;
            let growthRate = 0;
            
            // Only calculate growth if we have at least 2 data points
            if (records.length > 1 && previousViews > 0) {
              growthRate = ((latestViews - previousViews) / previousViews * 100);
            } else if (records.length === 1) {
              // New channel, show as "New" in UI
              growthRate = null;
            }
            
            return {
              channel_name: channelName,
              channel_id: records[0]?.channel_id,
              category: records[0]?.category || 'unknown',
              current_views: latestViews,
              view_growth_rate: growthRate !== null ? growthRate.toFixed(2) : null,
              is_new: records.length === 1
            };
          })
          .sort((a, b) => {
            // Sort nulls (new items) to the top
            if (a.view_growth_rate === null) return -1;
            if (b.view_growth_rate === null) return 1;
            return parseFloat(b.view_growth_rate) - parseFloat(a.view_growth_rate);
          })
          .slice(0, limit);
      }
    } catch (err) {
      console.error('Error processing channels:', err);
    }

    // Calculate historical growth trends from topics history
    const { data: historicalData, error: histError } = await supabase
      .from('trending_topics_history')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (histError) {
      console.error('Error fetching historical data:', histError);
    }

    // Process data for charts
    const growthTrends = processGrowthTrends(historicalData || []);

    const avgTopicGrowth = calculateAvgGrowth(topicsWithGrowth || []);
    const avgChannelGrowth = calculateAvgChannelGrowth(channelsWithGrowth || []);
    
    console.log('Growth Summary:', {
      topicsCount: topicsWithGrowth?.length || 0,
      channelsCount: channelsWithGrowth?.length || 0,
      avgTopicGrowth,
      avgChannelGrowth
    });

    return NextResponse.json({
      success: true,
      data: {
        topicsWithGrowth: topicsWithGrowth || [],
        channelsWithGrowth: channelsWithGrowth || [],
        growthTrends,
        summary: {
          avgTopicGrowth,
          avgChannelGrowth,
          topGrowthCategory: findTopGrowthCategory(topicsWithGrowth || [])
        }
      }
    });
  } catch (error) {
    console.error('Error fetching growth metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth metrics', details: error.message },
      { status: 500 }
    );
  }
}

function processGrowthTrends(data) {
  const trends = {};
  
  // Group data by date and topic to calculate daily growth
  const topicsByDate = {};
  
  data.forEach(item => {
    const date = new Date(item.recorded_at).toLocaleDateString();
    const topic = item.topic_name;
    
    if (!topicsByDate[date]) {
      topicsByDate[date] = {};
    }
    
    if (!topicsByDate[date][topic]) {
      topicsByDate[date][topic] = [];
    }
    
    topicsByDate[date][topic].push(item);
  });
  
  // Calculate growth rates for each day
  Object.entries(topicsByDate).forEach(([date, topics]) => {
    if (!trends[date]) {
      trends[date] = {
        date,
        avgGrowth: 0,
        count: 0,
        topics: []
      };
    }
    
    Object.entries(topics).forEach(([topicName, records]) => {
      // Calculate growth if we have multiple records for this topic
      if (records.length > 1) {
        const latestScore = records[0]?.score || 0;
        const previousScore = records[records.length - 1]?.score || latestScore;
        const growthRate = previousScore > 0 ? ((latestScore - previousScore) / previousScore * 100) : 0;
        
        trends[date].avgGrowth += growthRate;
        trends[date].count += 1;
        trends[date].topics.push({
          name: topicName,
          growth: growthRate
        });
      }
    });
  });

  return Object.values(trends).map(day => ({
    ...day,
    avgGrowth: day.count > 0 ? day.avgGrowth / day.count : 0
  }));
}

function calculateAvgGrowth(topics) {
  if (!topics || topics.length === 0) return "0.00";
  // Filter out new topics (null growth rate) for average calculation
  const topicsWithGrowth = topics.filter(t => t.growth_rate !== null && t.growth_rate !== undefined);
  if (topicsWithGrowth.length === 0) {
    // If all topics are new, return N/A or a placeholder
    return "N/A";
  }
  const total = topicsWithGrowth.reduce((sum, topic) => sum + parseFloat(topic.growth_rate || 0), 0);
  const average = total / topicsWithGrowth.length;
  return average.toFixed(2);
}

function calculateAvgChannelGrowth(channels) {
  if (!channels || channels.length === 0) return "0.00";
  // Filter out new channels (null growth rate) for average calculation
  const channelsWithGrowth = channels.filter(c => c.view_growth_rate !== null && c.view_growth_rate !== undefined);
  if (channelsWithGrowth.length === 0) {
    // If all channels are new, return N/A or a placeholder
    return "N/A";
  }
  const total = channelsWithGrowth.reduce((sum, channel) => sum + parseFloat(channel.view_growth_rate || 0), 0);
  const average = total / channelsWithGrowth.length;
  return average.toFixed(2);
}

function findTopGrowthCategory(topics) {
  const categoryGrowth = {};
  
  topics.forEach(topic => {
    if (!categoryGrowth[topic.category]) {
      categoryGrowth[topic.category] = {
        total: 0,
        count: 0
      };
    }
    categoryGrowth[topic.category].total += topic.growth_rate || 0;
    categoryGrowth[topic.category].count += 1;
  });

  let topCategory = null;
  let topAvg = 0;

  Object.entries(categoryGrowth).forEach(([category, data]) => {
    const avg = data.total / data.count;
    if (avg > topAvg) {
      topAvg = avg;
      topCategory = category;
    }
  });

  return topCategory;
}