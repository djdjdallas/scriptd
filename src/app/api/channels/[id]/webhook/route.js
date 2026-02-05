import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { WEBHOOK_EVENTS } from '@/lib/voice-training/webhooks';

/**
 * GET - Get webhook configuration for a channel
 */
export async function GET(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: channel, error } = await supabase
    .from('channels')
    .select('id, webhook_url, webhook_events')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  return NextResponse.json({
    webhookUrl: channel.webhook_url,
    webhookEvents: channel.webhook_events || Object.values(WEBHOOK_EVENTS),
    availableEvents: WEBHOOK_EVENTS
  });
}

/**
 * PUT - Update webhook configuration
 */
export async function PUT(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { webhookUrl, webhookSecret, webhookEvents } = body;

  // Validate URL if provided
  if (webhookUrl) {
    try {
      const url = new URL(webhookUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return NextResponse.json(
          { error: 'Webhook URL must use HTTP or HTTPS' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }
  }

  // Validate events if provided
  if (webhookEvents) {
    const validEvents = Object.values(WEBHOOK_EVENTS);
    const invalidEvents = webhookEvents.filter(e => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      );
    }
  }

  const { error: updateError } = await supabase
    .from('channels')
    .update({
      webhook_url: webhookUrl || null,
      webhook_secret: webhookSecret || null,
      webhook_events: webhookEvents || null
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: webhookUrl ? 'Webhook configured' : 'Webhook removed'
  });
}

/**
 * DELETE - Remove webhook configuration
 */
export async function DELETE(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('channels')
    .update({
      webhook_url: null,
      webhook_secret: null
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to remove webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

/**
 * POST - Test webhook with a ping event
 */
export async function POST(request, { params }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: channel } = await supabase
    .from('channels')
    .select('webhook_url, webhook_secret')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!channel?.webhook_url) {
    return NextResponse.json(
      { error: 'No webhook URL configured' },
      { status: 400 }
    );
  }

  // Import and send test webhook
  const { sendWebhook } = await import('@/lib/voice-training/webhooks');
  const result = await sendWebhook(id, 'webhook.test', {
    message: 'This is a test webhook from GenScript',
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({
    success: result.success,
    statusCode: result.statusCode,
    error: result.error,
    attempts: result.attempts
  });
}
