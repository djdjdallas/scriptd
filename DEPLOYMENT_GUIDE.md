# Async Job Queue Deployment Guide

This guide will help you deploy the new async job queue system for script generation.

## Overview

The new system eliminates Vercel timeout issues by:
- Creating jobs instead of generating scripts synchronously
- Processing jobs in the background via Vercel Cron
- Showing real-time progress to users
- Supporting scripts of any length

---

## 🗄️ Step 1: Run Database Migration

The system requires a new database table: `script_generation_jobs`

### Option A: Run Migration via Supabase CLI (Recommended)

```bash
cd /Users/dominickhill/subscriber-clone/subscribr
supabase db push
```

### Option B: Run Migration Manually

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251102_add_script_generation_jobs.sql`
3. Paste and run the SQL

### Verify Migration

Run this query to check the table exists:

```sql
SELECT * FROM script_generation_jobs LIMIT 1;
```

---

## 🔐 Step 2: Add Environment Variables to Vercel

You need to add two new environment variables:

### 2.1 SUPABASE_SERVICE_ROLE_KEY

This allows the cron job to bypass RLS policies.

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (starts with `eyJ...`)
3. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
4. Add:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: `<your-service-role-key>`
   - **Environments**: Production, Preview, Development

### 2.2 CRON_SECRET

This secures your cron endpoint from unauthorized access.

1. Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add:
   - **Name**: `CRON_SECRET`
   - **Value**: `<your-generated-secret>`
   - **Environments**: Production, Preview, Development

### 2.3 Verify Existing Variables

Make sure these are already set (from previous setup):
- ✅ `ANTHROPIC_API_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🚀 Step 3: Deploy to Vercel

The code is already committed. Now deploy:

```bash
git push origin main
```

Vercel will automatically:
- Deploy the new API routes
- Configure the cron job (runs every minute)
- Apply the function timeout settings from vercel.json

### Verify Deployment

1. Go to Vercel Dashboard → Your Project → Deployments
2. Wait for the deployment to complete (green checkmark)
3. Check Functions → Crons to see the new cron job

---

## 🧪 Step 4: Test the System

### 4.1 Test Job Creation

Try creating a script from your app. It should now:
1. Return immediately with a job ID
2. Show a progress UI component
3. Poll for progress every 10 seconds
4. Complete successfully

### 4.2 Monitor Cron Logs

1. Go to Vercel Dashboard → Logs
2. Filter by function: `process-script-jobs`
3. You should see cron runs every minute
4. Look for logs like:
   ```
   🔄 === CRON JOB: Process Script Jobs Started ===
   📋 Processing job: {...}
   ✅ Job completed successfully
   ```

### 4.3 Check Database

Verify jobs are being created and processed:

```sql
SELECT id, status, progress, current_step, created_at, started_at, completed_at
FROM script_generation_jobs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔧 Step 5: Update Frontend (Optional)

You can now integrate the progress component into your workflow:

```jsx
import ScriptGenerationProgress from '@/components/script-workflow/ScriptGenerationProgress';

// In your DraftStep or similar:
{jobId && (
  <ScriptGenerationProgress
    jobId={jobId}
    onComplete={(job) => {
      // Script is ready!
      console.log('Script generated:', job.generatedScript);
      // Update your UI, navigate to next step, etc.
    }}
    onError={(job) => {
      // Handle error
      console.error('Generation failed:', job.error_message);
    }}
  />
)}
```

---

## 📊 Monitoring & Troubleshooting

### Check Cron Job Status

```bash
# Via Vercel CLI
vercel logs --since 1h | grep "process-script-jobs"
```

### Common Issues

#### Issue: Cron not running
- **Solution**: Check Vercel Dashboard → Functions → Crons
- Make sure the cron is enabled
- Check that `CRON_SECRET` is set correctly

#### Issue: Jobs stuck in "pending"
- **Solution**: Check cron logs for errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Manually trigger cron: `curl https://your-domain.vercel.app/api/cron/process-script-jobs`

#### Issue: "Unauthorized" error in cron
- **Solution**: Verify `CRON_SECRET` matches in both:
  - Vercel environment variable
  - Cron authorization header

#### Issue: Script generation fails
- **Solution**: Check the `error_message` in the jobs table
- Review Vercel function logs for the generate-script route
- Ensure all environment variables from Step 2 are set

### Database Queries for Debugging

```sql
-- See all jobs with their status
SELECT id, status, progress, error_message, retry_count, created_at
FROM script_generation_jobs
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- Count jobs by status
SELECT status, COUNT(*) as count
FROM script_generation_jobs
GROUP BY status;

-- Find stuck jobs (processing for >10 minutes)
SELECT *
FROM script_generation_jobs
WHERE status = 'processing'
  AND started_at < NOW() - INTERVAL '10 minutes';
```

---

## 🎯 Performance Optimization (Optional)

### Increase Cron Frequency for Faster Processing

Edit `vercel.json`:

```json
"crons": [
  {
    "path": "/api/cron/process-script-jobs",
    "schedule": "*/2 * * * *"  // Every 2 minutes instead of 1
  }
]
```

### Process Multiple Jobs Per Run

Modify the cron handler to process multiple jobs if they fit within the 5-minute limit.

---

## 🔄 Rollback Plan

If something goes wrong, you can roll back:

1. **Revert to Previous Deployment**:
   - Vercel Dashboard → Deployments → Find previous deployment → Promote to Production

2. **Keep Using Synchronous Generation**:
   - Users can still call the old `/api/workflow/generate-script` endpoint
   - It will work for scripts under 5 minutes

3. **Database Cleanup** (if needed):
   ```sql
   DROP TABLE IF EXISTS script_generation_jobs CASCADE;
   ```

---

## ✅ Success Checklist

- [ ] Database migration ran successfully
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel
- [ ] `CRON_SECRET` added to Vercel
- [ ] Deployment completed successfully
- [ ] Cron job appears in Vercel Functions
- [ ] Test script generation creates a job
- [ ] Progress component polls and updates
- [ ] Job completes successfully
- [ ] Generated script appears in the UI

---

## 📞 Need Help?

- Check Vercel logs: Dashboard → Logs
- Check Supabase logs: Dashboard → Database → Logs
- Review the code in `src/app/api/cron/process-script-jobs/route.js`

---

**Congratulations! Your async job queue system is now deployed! 🎉**

Scripts can now be generated without timeout limits, and users see real-time progress updates.
