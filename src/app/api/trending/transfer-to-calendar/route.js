import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiLogger } from '@/lib/monitoring/logger';

/**
 * Transfers a 30-day action plan to the existing content_calendar table
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { actionPlan, actionPlanId, options = {} } = await request.json();
    
    // Validate action plan
    if (!actionPlan || !actionPlan.weeklyPlan) {
      return NextResponse.json(
        { error: 'Invalid action plan data' },
        { status: 400 }
      );
    }
    
    // Configuration options with defaults
    const {
      startDate = new Date().toISOString().split('T')[0],
      skipWeekends = false,
      autoSchedule = true,
      includeContentIdeas = true,
      includeKeywords = true,
      defaultTime = '10:00',
      timezone = 'UTC',
      reminderDays = 1,
      teamId = null,
      platform = 'youtube'
    } = options;

    // Initialize calendar events array
    const calendarEvents = [];
    let currentDate = new Date(startDate);
    
    // TEMPORARY FIX: Set teamId to null to avoid recursion issues
    // TODO: Apply migration 014_fix_content_calendar_recursion.sql to fix the root cause
    const safeTeamId = null; // Was: teamId
    
    // Helper: Get next working day
    const getNextWorkingDay = (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      if (skipWeekends) {
        while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
          nextDay.setDate(nextDay.getDate() + 1);
        }
      }
      
      return nextDay;
    };

    // Helper: Format date for database
    const formatDate = (date) => date.toISOString().split('T')[0];

    // 1. Process Weekly Tasks
    let totalTasks = 0;
    actionPlan.weeklyPlan.forEach((week, weekIndex) => {
      const weekStartDate = new Date(currentDate);
      
      week.tasks?.forEach((task, taskIndex) => {
        const taskDate = autoSchedule 
          ? new Date(weekStartDate.getTime() + (taskIndex * 24 * 60 * 60 * 1000))
          : weekStartDate;
        
        // Skip weekends if configured
        if (skipWeekends && (taskDate.getDay() === 0 || taskDate.getDay() === 6)) {
          taskDate.setDate(taskDate.getDate() + (taskDate.getDay() === 0 ? 1 : 2));
        }
        
        const event = {
          user_id: user.id,
          team_id: safeTeamId,
          title: task.task,
          description: `Week ${week.week}: ${week.theme}\n\nPriority: ${task.priority.toUpperCase()}`,
          content_type: 'task',
          platform: platform,
          status: 'IDEA',
          publish_date: formatDate(taskDate),
          publish_time: defaultTime,
          timezone: timezone,
          tags: [
            'action-plan',
            `week-${week.week}`,
            task.priority,
            week.theme.toLowerCase().replace(/\s+/g, '-')
          ],
          keywords: includeKeywords ? actionPlan.keywords?.slice(0, 5) : [],
          target_audience: actionPlan.topic,
          // event_type: 'task', // Commented out until column is added
          // priority: task.priority, // Commented out until column is added
          // action_plan_id: actionPlanId || null, // Commented out until column is added
          platform_data: {
            source: 'action_plan',
            channel: actionPlan.channel,
            topic: actionPlan.topic,
            week: week.week,
            weekTheme: week.theme,
            taskId: task.id,
            taskIndex: taskIndex,
            totalWeekTasks: week.tasks.length,
            strategy: actionPlan.strategy,
            event_type: 'task', // Store in platform_data until column is added
            priority: task.priority, // Store in platform_data until column is added
            action_plan_id: actionPlanId || null, // Store in platform_data until column is added
            reminder_days: reminderDays || 0 // Store reminder info in platform_data
          },
          notes: `Generated from action plan: ${actionPlan.strategy}`
        };
        
        calendarEvents.push(event);
        totalTasks++;
      });
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    });

    // 2. Add Content Ideas as Video Events
    if (includeContentIdeas && actionPlan.contentIdeas?.length > 0) {
      const contentSpacing = Math.floor(30 / actionPlan.contentIdeas.length);
      
      actionPlan.contentIdeas.forEach((idea, index) => {
        const contentDate = new Date(startDate);
        contentDate.setDate(contentDate.getDate() + (index * contentSpacing));
        
        // Avoid weekends for content
        if (skipWeekends && (contentDate.getDay() === 0 || contentDate.getDay() === 6)) {
          contentDate.setDate(contentDate.getDate() + (contentDate.getDay() === 0 ? 1 : 2));
        }
        
        const videoEvent = {
          user_id: user.id,
          team_id: safeTeamId,
          title: `📹 ${idea.title}`,
          description: [
            idea.description,
            '',
            `**Hook:** ${idea.hook}`,
            `**Estimated Views:** ${idea.estimatedViews}`
          ].filter(Boolean).join('\n'),
          content_type: 'video',
          platform: platform,
          status: 'IDEA',
          publish_date: formatDate(contentDate),
          publish_time: defaultTime,
          timezone: timezone,
          tags: [
            'content-idea',
            'video',
            actionPlan.topic.toLowerCase().replace(/\s+/g, '-')
          ],
          keywords: includeKeywords ? actionPlan.keywords || [] : [],
          target_audience: actionPlan.topic,
          estimated_duration_minutes: parseInt(idea.duration) || 10,
          performance_goals: {
            views: idea.estimatedViews,
            engagement: '5-10%'
          },
          // event_type: 'video', // Commented out until column is added
          // priority: 'high', // Commented out until column is added
          // action_plan_id: actionPlanId || null, // Commented out until column is added
          platform_data: {
            source: 'action_plan',
            channel: actionPlan.channel,
            topic: actionPlan.topic,
            hook: idea.hook,
            estimatedViews: idea.estimatedViews,
            keywords: actionPlan.keywords || [],
            contentIndex: index,
            totalContentIdeas: actionPlan.contentIdeas.length,
            event_type: 'video', // Store in platform_data until column is added
            priority: 'high', // Store in platform_data until column is added
            action_plan_id: actionPlanId || null // Store in platform_data until column is added
          },
          notes: `Video idea from action plan: ${actionPlan.strategy}`
        };
        
        calendarEvents.push(videoEvent);
      });
    }

    // 3. Add Weekly Milestone Reviews
    const milestones = [
      { week: 1, title: 'Week 1 Review', metrics: actionPlan.successMetrics?.week1 },
      { week: 2, title: 'Week 2 Review', metrics: actionPlan.successMetrics?.week2 },
      { week: 3, title: 'Week 3 Review', metrics: actionPlan.successMetrics?.week3 },
      { week: 4, title: 'Final Review & Analysis', metrics: actionPlan.successMetrics?.week4 }
    ];

    milestones.forEach((milestone) => {
      const milestoneDate = new Date(startDate);
      milestoneDate.setDate(milestoneDate.getDate() + (milestone.week * 7) - 1); // End of week
      
      // Always schedule reviews on Friday if not weekend
      if (milestoneDate.getDay() === 6) milestoneDate.setDate(milestoneDate.getDate() - 1);
      if (milestoneDate.getDay() === 0) milestoneDate.setDate(milestoneDate.getDate() - 2);
      
      const milestoneEvent = {
        user_id: user.id,
        team_id: teamId,
        title: `📊 ${milestone.title}: ${actionPlan.strategy}`,
        description: [
          `**Strategy:** ${actionPlan.strategy}`,
          `**Channel:** ${actionPlan.channel}`,
          '',
          '**Target Metrics:**',
          `• Views: ${milestone.metrics?.views || 'TBD'}`,
          `• Subscribers: ${milestone.metrics?.subscribers || 'TBD'}`,
          `• Engagement: ${milestone.metrics?.engagement || 'TBD'}`
        ].join('\n'),
        content_type: 'milestone',
        platform: platform,
        status: 'IDEA',
        publish_date: formatDate(milestoneDate),
        publish_time: '17:00', // End of day
        timezone: timezone,
        tags: ['milestone', 'review', `week-${milestone.week}`, 'analytics'],
        keywords: [],
        target_audience: actionPlan.topic,
        performance_goals: milestone.metrics,
        // event_type: 'milestone', // Commented out until column is added
        // priority: 'high', // Commented out until column is added
        // action_plan_id: actionPlanId || null, // Commented out until column is added
        platform_data: {
          source: 'action_plan',
          channel: actionPlan.channel,
          topic: actionPlan.topic,
          strategy: actionPlan.strategy,
          week: milestone.week,
          targetMetrics: milestone.metrics,
          estimatedResults: actionPlan.estimatedResults,
          event_type: 'milestone', // Store in platform_data until column is added
          priority: 'high', // Store in platform_data until column is added
          action_plan_id: actionPlanId || null // Store in platform_data until column is added
        },
        notes: `Weekly review checkpoint for action plan`
      };
      
      calendarEvents.push(milestoneEvent);
    });

    // 4. Add Content Templates as Reference Events
    if (actionPlan.contentTemplates?.length > 0) {
      const templateDate = new Date(startDate);
      
      actionPlan.contentTemplates.forEach((template, index) => {
        const templateEvent = {
          user_id: user.id,
          team_id: safeTeamId,
          title: `📝 Template: ${template.title}`,
          description: [
            `**Type:** ${template.type}`,
            `**Duration:** ${template.duration}`,
            `**Structure:** ${template.structure}`
          ].join('\n'),
          content_type: 'template',
          platform: platform,
          status: 'IDEA',
          publish_date: formatDate(templateDate),
          publish_time: defaultTime,
          timezone: timezone,
          tags: ['template', 'content-structure', template.type.toLowerCase()],
          keywords: [],
          estimated_duration_minutes: parseInt(template.duration) || 10,
          // event_type: 'template', // Commented out until column is added
          // priority: 'low', // Commented out until column is added
          // action_plan_id: actionPlanId || null, // Commented out until column is added
          platform_data: {
            source: 'action_plan',
            channel: actionPlan.channel,
            template: template,
            event_type: 'template', // Store in platform_data until column is added
            priority: 'low', // Store in platform_data until column is added
            action_plan_id: actionPlanId || null // Store in platform_data until column is added
          },
          notes: `Content template from action plan`
        };
        
        calendarEvents.push(templateEvent);
      });
    }

    // Begin database transaction
    const { data: insertedEvents, error: insertError } = await supabase
      .from('content_calendar')
      .insert(calendarEvents)
      .select();

    if (insertError) {
      apiLogger.error('Error inserting calendar events', insertError);
      return NextResponse.json(
        { error: 'Failed to add events to calendar', details: insertError.message },
        { status: 500 }
      );
    }

    // If we have an action_plan_id, update the action plan to mark it as transferred
    if (actionPlanId) {
      await supabase
        .from('action_plans')
        .update({ 
          plan_data: {
            ...actionPlan,
            transferred_to_calendar: true,
            transfer_date: new Date().toISOString()
          }
        })
        .eq('id', actionPlanId);
    }

    // Log activity if user_activity table exists
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        action: 'action_plan_transferred',
        metadata: {
          channel: actionPlan.channel,
          topic: actionPlan.topic,
          eventsCreated: insertedEvents.length,
          actionPlanId: actionPlanId
        }
      });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedEvents.length} events to your content calendar`,
      data: {
        eventsCreated: insertedEvents.length,
        tasksAdded: totalTasks,
        videosScheduled: actionPlan.contentIdeas?.length || 0,
        milestonesSet: 4,
        actionPlanId: actionPlanId,
        startDate: startDate,
        endDate: formatDate(new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 30)))
      }
    });

  } catch (error) {
    apiLogger.error('Error transferring plan to calendar', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}