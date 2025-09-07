import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const supabase = await createClient();

    // Get trending topics with growth rates
    const { data: topicsWithGrowth, error: topicsError } = await supabase
      .rpc('get_trending_topics_with_growth', {
        p_category: category === 'all' ? null : category,
        p_limit: limit
      });

    if (topicsError) {
      console.error('Error fetching topics with growth:', topicsError);
    }

    // Get trending channels with growth rates
    const { data: channelsWithGrowth, error: channelsError } = await supabase
      .rpc('get_trending_channels_with_growth', {
        p_category: category === 'all' ? null : category,
        p_limit: limit
      });

    if (channelsError) {
      console.error('Error fetching channels with growth:', channelsError);
    }

    // Calculate historical growth trends
    const { data: historicalData, error: histError } = await supabase
      .from('trending_topics_growth')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (histError) {
      console.error('Error fetching historical data:', histError);
    }

    // Process data for charts
    const growthTrends = processGrowthTrends(historicalData || []);

    return NextResponse.json({
      success: true,
      data: {
        topicsWithGrowth: topicsWithGrowth || [],
        channelsWithGrowth: channelsWithGrowth || [],
        growthTrends,
        summary: {
          avgTopicGrowth: calculateAvgGrowth(topicsWithGrowth || []),
          avgChannelGrowth: calculateAvgChannelGrowth(channelsWithGrowth || []),
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
  
  data.forEach(item => {
    const date = new Date(item.recorded_at).toLocaleDateString();
    if (!trends[date]) {
      trends[date] = {
        date,
        avgGrowth: 0,
        count: 0,
        topics: []
      };
    }
    
    trends[date].avgGrowth += item.growth_rate || 0;
    trends[date].count += 1;
    trends[date].topics.push({
      name: item.topic_name,
      growth: item.growth_rate || 0
    });
  });

  return Object.values(trends).map(day => ({
    ...day,
    avgGrowth: day.count > 0 ? day.avgGrowth / day.count : 0
  }));
}

function calculateAvgGrowth(topics) {
  if (topics.length === 0) return 0;
  const total = topics.reduce((sum, topic) => sum + (topic.growth_rate || 0), 0);
  return (total / topics.length).toFixed(2);
}

function calculateAvgChannelGrowth(channels) {
  if (channels.length === 0) return 0;
  const total = channels.reduce((sum, channel) => sum + (channel.view_growth_rate || 0), 0);
  return (total / channels.length).toFixed(2);
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