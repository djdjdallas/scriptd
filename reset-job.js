const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetJob() {
  const { data, error } = await supabase
    .from('script_generation_jobs')
    .update({
      status: 'pending',
      retry_count: 0,
      error_message: null,
      current_step: 'queued',
      progress: 0
    })
    .eq('id', 'a216db0a-d841-481e-b14d-bdf7f9433e79');

  if (error) {
    console.error('Error resetting job:', error);
  } else {
    console.log('Job reset successfully');
  }
}

resetJob();