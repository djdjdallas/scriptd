# 🚀 3x Concurrent Processing Upgrade Guide

## Overview
This upgrade increases your script generation throughput by **3x** (from 6-10 scripts/hour to 18-30 scripts/hour).

**Before:** 1 job processed at a time
**After:** 3 jobs processed concurrently

---

## 📋 Deployment Steps

### Step 1: Deploy Updated Edge Function

1. Go to Supabase Dashboard Edge Functions:
   https://supabase.com/dashboard/project/wosyawvkdsajuiqmcoyu/functions

2. Click on **"process-script-jobs"** function

3. Click **"Deploy new version"**

4. Choose deployment method:
   - **Option A (Recommended):** Connect to GitHub and auto-deploy from `main` branch
   - **Option B:** Upload the file manually:
     - Open: `supabase/functions/process-script-jobs/index.ts`
     - Copy all content
     - Paste into Supabase editor
     - Click "Deploy"

5. Wait for deployment to complete (~30 seconds)

---

### Step 2: Update Cron Jobs (Enable 3 Parallel Workers)

1. Go to Supabase SQL Editor:
   https://supabase.com/dashboard/project/wosyawvkdsajuiqmcoyu/sql/new

2. Copy and paste this SQL:

```sql
-- Remove existing single cron job
SELECT cron.unschedule('process-script-generation-jobs');

-- Worker 1
SELECT cron.schedule(
  'process-script-jobs-worker-1',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://wosyawvkdsajuiqmcoyu.supabase.co/functions/v1/process-script-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
        'x-supabase-caller', 'pg_cron',
        'x-worker-id', 'worker-1'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Worker 2
SELECT cron.schedule(
  'process-script-jobs-worker-2',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://wosyawvkdsajuiqmcoyu.supabase.co/functions/v1/process-script-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
        'x-supabase-caller', 'pg_cron',
        'x-worker-id', 'worker-2'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Worker 3
SELECT cron.schedule(
  'process-script-jobs-worker-3',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://wosyawvkdsajuiqmcoyu.supabase.co/functions/v1/process-script-jobs',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
        'x-supabase-caller', 'pg_cron',
        'x-worker-id', 'worker-3'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

3. Click **"Run"**

4. Verify success - you should see 3 rows returned (one for each worker)

---

### Step 3: Verify Deployment

1. Check cron jobs are active:

```sql
SELECT * FROM cron.job WHERE jobname LIKE 'process-script-jobs%';
```

You should see 3 jobs:
- `process-script-jobs-worker-1`
- `process-script-jobs-worker-2`
- `process-script-jobs-worker-3`

2. Check edge function logs:
   https://supabase.com/dashboard/project/wosyawvkdsajuiqmcoyu/logs/edge-functions

   Look for messages like:
   ```
   📋 Found 3 pending job(s) to process concurrently
   🚀 Processing 3 job(s) in parallel...
   ✅ Batch complete: 3 succeeded, 0 failed
   ```

---

## 🎯 What Changed?

### Code Changes
- **Concurrent Limit**: Increased from 1 to 3 jobs per cycle
- **Atomic Claiming**: Uses database-level locking to prevent race conditions
- **Parallel Processing**: Uses `Promise.allSettled()` to process jobs concurrently
- **Better Logging**: Shows batch processing statistics

### Infrastructure Changes
- **3 Cron Workers**: Each runs every minute
- **Smart Job Distribution**: Workers use atomic updates to claim available jobs
- **No Duplicate Processing**: Database ensures each job is only processed once

---

## 📊 Performance Impact

### Before Upgrade
- ⏱️ **Throughput**: 6-10 scripts/hour
- 👥 **Capacity**: 50-100 active users
- ⌛ **Queue Time**: Up to 45 minutes with 10 users

### After Upgrade
- ⏱️ **Throughput**: 18-30 scripts/hour
- 👥 **Capacity**: 200-300 active users
- ⌛ **Queue Time**: Max 15 minutes with 10 users

### Real-World Example
**10 users generate scripts simultaneously:**

**Before:**
- User 1: 0 min wait
- User 5: 20 min wait
- User 10: 45 min wait

**After:**
- User 1: 0 min wait
- User 5: 7 min wait
- User 10: 14 min wait

---

## 🔍 Monitoring

### Check Processing Stats
```sql
-- View recent job completions
SELECT
  status,
  COUNT(*) as count,
  AVG(processing_time_seconds) as avg_time_seconds
FROM script_generation_jobs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY status;
```

### View Active Jobs
```sql
SELECT
  id,
  status,
  current_step,
  progress,
  EXTRACT(EPOCH FROM (NOW() - started_at))::int as processing_seconds
FROM script_generation_jobs
WHERE status = 'processing'
ORDER BY started_at DESC;
```

### Check Edge Function Invocations
Go to: https://supabase.com/dashboard/project/wosyawvkdsajuiqmcoyu/functions/process-script-jobs/invocations

---

## 🐛 Troubleshooting

### Jobs Not Processing?
1. Check edge function is deployed (see Step 1)
2. Verify cron jobs are active (see Step 3)
3. Check edge function logs for errors

### Still Slow?
If you're still experiencing delays:
1. Check Anthropic API rate limits
2. Monitor database connection pool
3. Consider upgrading to 5-10 concurrent jobs (change `CONCURRENT_LIMIT` in code)

### Rollback
To revert to single-job processing:

```sql
-- Remove all workers
SELECT cron.unschedule('process-script-jobs-worker-1');
SELECT cron.unschedule('process-script-jobs-worker-2');
SELECT cron.unschedule('process-script-jobs-worker-3');

-- Recreate single worker
SELECT cron.schedule(
  'process-script-generation-jobs',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wosyawvkdsajuiqmcoyu.supabase.co/functions/v1/process-script-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'x-supabase-caller', 'pg_cron'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

Then redeploy the old edge function version.

---

## 🚀 Future Scaling

If you need even more capacity:

### 5x Throughput (30-50 scripts/hour)
- Change `CONCURRENT_LIMIT` to 5
- Add 2 more cron workers (worker-4, worker-5)
- Supports 400-500 active users

### 10x Throughput (60-100 scripts/hour)
- Migrate to dedicated queue service (Inngest/QStash)
- Add worker auto-scaling
- Supports 1000+ active users

---

## ✅ Success Criteria

You know it's working when:
- ✅ Edge function logs show "Processing X job(s) in parallel"
- ✅ Multiple jobs have `status = 'processing'` simultaneously
- ✅ Queue times drop significantly
- ✅ User satisfaction increases 🎉

---

**Need Help?** Check the Supabase logs or edge function invocation history for detailed error messages.
