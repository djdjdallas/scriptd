import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email/email-service';

export const maxDuration = 30;

export async function GET(request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const emailService = new EmailService();
  const results = { sent: 0, errors: 0, skipped: 0 };
  const MAX_EMAILS_PER_RUN = 50;

  try {
    // 1. Re-engage users who haven't visited in 3+ days (completed onboarding)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: inactiveUsers, error: inactiveError } = await supabase
      .from('users')
      .select('id, email, name, credits, last_login')
      .eq('onboarding_completed', true)
      .lt('last_login', threeDaysAgo)
      .not('email', 'is', null)
      .limit(MAX_EMAILS_PER_RUN);

    if (inactiveError) {
      console.error('Error querying inactive users:', inactiveError);
    }

    // 2. Nudge users who signed up but never completed onboarding (1+ day old)
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const { data: incompleteUsers, error: incompleteError } = await supabase
      .from('users')
      .select('id, email, name, credits')
      .eq('onboarding_completed', false)
      .lt('created_at', oneDayAgo)
      .not('email', 'is', null)
      .limit(Math.max(0, MAX_EMAILS_PER_RUN - (inactiveUsers?.length || 0)));

    if (incompleteError) {
      console.error('Error querying incomplete users:', incompleteError);
    }

    // Send re-engagement emails to inactive users
    for (const user of (inactiveUsers || [])) {
      if (results.sent >= MAX_EMAILS_PER_RUN) break;

      try {
        const daysSince = Math.floor(
          (Date.now() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24)
        );

        const result = await emailService.sendReengagementEmail({
          email: user.email,
          name: user.name,
          daysSinceLastVisit: daysSince,
          creditsRemaining: user.credits || 0,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.errors++;
        }
      } catch (e) {
        console.error(`Failed to send re-engagement email to ${user.id}:`, e);
        results.errors++;
      }
    }

    // Send welcome nudge to incomplete onboarding users
    for (const user of (incompleteUsers || [])) {
      if (results.sent >= MAX_EMAILS_PER_RUN) break;

      try {
        const result = await emailService.sendReengagementEmail({
          email: user.email,
          name: user.name,
          daysSinceLastVisit: 1,
          creditsRemaining: user.credits || 0,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.errors++;
        }
      } catch (e) {
        console.error(`Failed to send nudge email to ${user.id}:`, e);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      inactiveFound: inactiveUsers?.length || 0,
      incompleteFound: incompleteUsers?.length || 0,
    });
  } catch (error) {
    console.error('Re-engagement cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
