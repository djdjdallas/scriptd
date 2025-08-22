import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ChannelCard } from '@/components/channel/channel-card';
import { Button } from '@/components/ui/button';
import { Plus, Youtube } from 'lucide-react';

export const metadata = {
  title: 'My Channels | Subscribr',
  description: 'Manage your connected YouTube channels',
};

export default async function ChannelsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: channels, error } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching channels:', error);
  }

  const hasChannels = channels && channels.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Channels</h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage your YouTube channels
          </p>
        </div>
        <Link href="/channels/connect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Channel
          </Button>
        </Link>
      </div>

      {!hasChannels ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Youtube className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No channels connected</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Connect your YouTube channel to start analyzing your content and growing your audience
          </p>
          <Link href="/channels/connect">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Connect Your First Channel
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}