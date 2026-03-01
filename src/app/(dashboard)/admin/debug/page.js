'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isAdminUserClient } from '@/lib/auth/admin-guard-client';
import AdminNav from '@/components/admin/admin-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bug,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Brain,
  Target,
  BarChart3,
  X,
} from 'lucide-react';

// --- Helpers ---

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function truncate(str, len = 40) {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function complianceColor(score) {
  if (score == null) return 'text-gray-400';
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function confidenceStatusColor(status) {
  switch (status) {
    case 'excellent': return 'text-green-400';
    case 'good': return 'text-blue-400';
    case 'fair': return 'text-amber-400';
    case 'poor': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// --- Components ---

function StatCard({ icon: Icon, label, value, subtitle, iconColor = 'text-violet-400' }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 ${iconColor} flex-shrink-0`} />
          <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
            {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSourceBar({ distribution }) {
  const total = (distribution.deep || 0) + (distribution.basic || 0) + (distribution.placeholder || 0);
  if (total === 0) return <span className="text-gray-500 text-sm">No data</span>;

  const pct = (v) => Math.round((v / total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 h-4 rounded overflow-hidden">
        {distribution.deep > 0 && (
          <div className="bg-green-500" style={{ width: `${pct(distribution.deep)}%` }} title={`Deep: ${distribution.deep}`} />
        )}
        {distribution.basic > 0 && (
          <div className="bg-amber-500" style={{ width: `${pct(distribution.basic)}%` }} title={`Basic: ${distribution.basic}`} />
        )}
        {distribution.placeholder > 0 && (
          <div className="bg-red-500" style={{ width: `${pct(distribution.placeholder)}%` }} title={`Placeholder: ${distribution.placeholder}`} />
        )}
      </div>
      <div className="flex gap-3 text-xs text-gray-400">
        <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />Deep {distribution.deep}</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Basic {distribution.basic}</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Placeholder {distribution.placeholder}</span>
      </div>
    </div>
  );
}

function ExpandedRow({ log }) {
  return (
    <TableRow>
      <TableCell colSpan={8} className="bg-slate-900/80 border-slate-800 p-0">
        <div className="p-6 grid grid-cols-2 gap-6 text-sm">
          {/* GENERATION PATH */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Generation Path</h4>
            <div className="space-y-1 text-gray-300">
              <div>Path: <span className="font-mono text-white">{log.generation_path}</span></div>
              <div>Profile source: <Badge variant="outline" className="ml-1">{log.profile_source || 'none'}</Badge></div>
              <div>Transcripts analyzed: {log.transcripts_analyzed ?? 'N/A'}</div>
              <div>Performance data: {log.performance_data_available ? <span className="text-green-400">yes</span> : <span className="text-gray-500">no</span>}</div>
              <div>Generation time: {log.generation_time_ms ? `${log.generation_time_ms}ms` : 'N/A'}</div>
            </div>
          </div>

          {/* HOOK ENGINE */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Hook Engine</h4>
            <div className="space-y-1 text-gray-300">
              <div>Used: {log.hook_engine_used ? <span className="text-green-400">yes</span> : <span className="text-gray-500">no</span>}</div>
              <div>Fallback triggered: {log.hook_engine_fallback ? <span className="text-orange-400">yes</span> : <span className="text-gray-500">no</span>}</div>
              <div>Hook word count: {log.hook_word_count ?? 'N/A'}</div>
            </div>
          </div>

          {/* VOICE CONSTRAINTS */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Voice Constraints Injected</h4>
            {log.constraints_injected?.length > 0 ? (
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                {log.constraints_injected.map((c, i) => (
                  <li key={i} className="text-xs">
                    <span className="font-medium text-white">{c.category}</span>
                    <span className="text-gray-500 ml-1">— weight: {c.weight}</span>
                    <div className="ml-5 text-gray-400 truncate max-w-md">{truncate(c.instruction, 80)}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-gray-500">No constraints injected</span>
            )}
          </div>

          {/* COMPLIANCE SCORES */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Compliance Scores</h4>
            {log.compliance_scores ? (
              <div className="space-y-1 text-gray-300">
                <div>Overall: <span className={`font-bold ${complianceColor(log.compliance_scores.overall)}`}>{log.compliance_scores.overall ?? 'N/A'}/100</span></div>
                <div>Signature Phrases: <span className="text-white">{log.compliance_scores.signaturePhrases ?? 'N/A'}</span></div>
                <div>Sentence Length Dev: <span className="text-white">{log.compliance_scores.sentenceLength ?? 'N/A'}</span></div>
                <div>Pronoun Dist. Dev: <span className="text-white">{log.compliance_scores.pronounDistribution ?? 'N/A'}</span></div>
                <div>Transition Usage: <span className="text-white">{log.compliance_scores.transitionUsage ?? 'N/A'}</span></div>
              </div>
            ) : (
              <span className="text-gray-500">N/A (standard path)</span>
            )}
          </div>

          {/* VOICE CONFIDENCE */}
          <div className="col-span-2 space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Voice Confidence</h4>
            {log.voice_confidence_score != null ? (
              <div className="flex gap-6 text-gray-300">
                <div>Overall: <span className={`font-bold ${confidenceStatusColor(log.voice_confidence_status)}`}>{log.voice_confidence_score}/100</span> <span className="text-xs capitalize">({log.voice_confidence_status})</span></div>
              </div>
            ) : (
              <span className="text-gray-500">No voice profile used</span>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// --- Main Page ---

export default function DebugPanelPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filters
  const [pathFilter, setPathFilter] = useState('');
  const [hookFilter, setHookFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');

  const LIMIT = 20;

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }
      const admin = await isAdminUserClient(user, supabase);
      if (!admin) { router.push('/dashboard'); return; }
      setIsAdmin(true);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = useCallback(async (currentOffset = 0) => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(currentOffset),
      });
      if (pathFilter) params.set('path', pathFilter);
      if (hookFilter) params.set('hook', hookFilter);
      if (complianceFilter) params.set('compliance', complianceFilter);

      const res = await fetch(`/api/admin/debug?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setTotal(data.total);
        setStats(data.stats);
        setOffset(currentOffset);
      }
    } catch (err) {
      console.error('Failed to fetch debug logs:', err);
    } finally {
      setRefreshing(false);
    }
  }, [pathFilter, hookFilter, complianceFilter]);

  useEffect(() => {
    if (isAdmin) fetchLogs(0);
  }, [isAdmin, fetchLogs]);

  const resetFilters = () => {
    setPathFilter('');
    setHookFilter('');
    setComplianceFilter('');
  };

  const hasActiveFilters = pathFilter || hookFilter || complianceFilter;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
        <AdminNav collapsed={false} />
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-10 w-80 bg-slate-800" />
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 bg-slate-800" />)}
          </div>
          <Skeleton className="h-96 bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      <AdminNav
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bug className="h-8 w-8 text-red-400" />
            Generation Debug Panel
          </h1>
          <p className="text-gray-400 mt-1">Internal only — not visible to users</p>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            This data is for debugging only. Do not share with users.
          </AlertDescription>
        </Alert>

        {/* Aggregate Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              icon={Zap}
              iconColor="text-green-400"
              label="Enhanced Path"
              value={`${stats.enhancedPercent}%`}
              subtitle={`of ${stats.total} generations`}
            />
            <StatCard
              icon={Target}
              iconColor="text-blue-400"
              label="Hook Engine Success"
              value={`${stats.hookSuccessRate}%`}
            />
            <StatCard
              icon={BarChart3}
              iconColor="text-amber-400"
              label="Avg Compliance"
              value={`${stats.avgComplianceScore}/100`}
            />
            <StatCard
              icon={Brain}
              iconColor="text-violet-400"
              label="Avg Voice Confidence"
              value={`${stats.avgVoiceConfidence}/100`}
            />
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-xs text-gray-400 mb-2 font-medium">Profile Sources</div>
                <ProfileSourceBar distribution={stats.profileSourceDistribution} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400 font-medium">Filters:</span>

          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            <option value="">All paths</option>
            <option value="enhanced">Enhanced</option>
            <option value="v2_standard">Standard</option>
          </select>

          <select
            value={hookFilter}
            onChange={(e) => setHookFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            <option value="">All hooks</option>
            <option value="engine">Engine success</option>
            <option value="fallback">Fallback</option>
          </select>

          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            <option value="">All compliance</option>
            <option value="good">Good (&ge;80)</option>
            <option value="needs_work">Needs work (&lt;60)</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-400 hover:text-white">
              <X className="h-3 w-3 mr-1" /> Reset
            </Button>
          )}

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(offset)}
            disabled={refreshing}
            className="text-gray-300 border-slate-700"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Log Table */}
        <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Time</TableHead>
                <TableHead className="text-gray-400">Channel</TableHead>
                <TableHead className="text-gray-400">Script</TableHead>
                <TableHead className="text-gray-400">Path</TableHead>
                <TableHead className="text-gray-400">Hook</TableHead>
                <TableHead className="text-gray-400">Confidence</TableHead>
                <TableHead className="text-gray-400">Compliance</TableHead>
                <TableHead className="text-gray-400 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                    {refreshing ? 'Loading...' : 'No debug data available'}
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <>
                  <TableRow
                    key={log.id}
                    className="border-slate-800 cursor-pointer hover:bg-slate-800/50"
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  >
                    <TableCell className="text-gray-300 text-xs whitespace-nowrap">
                      {timeAgo(log.created_at)}
                    </TableCell>
                    <TableCell className="text-white text-sm">
                      {log.channels?.name || '—'}
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm max-w-[200px]">
                      {truncate(log.scripts?.title)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={log.generation_path === 'enhanced'
                          ? 'border-green-500/50 text-green-400 bg-green-500/10'
                          : 'border-gray-600 text-gray-400'}
                      >
                        {log.generation_path === 'enhanced' ? 'enhanced' : 'standard'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!log.hook_engine_used ? (
                        <Badge variant="outline" className="border-gray-600 text-gray-500">n/a</Badge>
                      ) : log.hook_engine_fallback ? (
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">fallback</Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">engine</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.voice_confidence_score != null ? (
                        <span className={confidenceStatusColor(log.voice_confidence_status)}>
                          {log.voice_confidence_score}
                          <span className="text-gray-500 text-xs ml-1 capitalize">{log.voice_confidence_status}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.compliance_scores?.overall != null ? (
                        <span className={`font-medium ${complianceColor(log.compliance_scores.overall)}`}>
                          {log.compliance_scores.overall}
                        </span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expandedRow === log.id
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </TableCell>
                  </TableRow>
                  {expandedRow === log.id && <ExpandedRow key={`${log.id}-detail`} log={log} />}
                </>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => fetchLogs(Math.max(0, offset - LIMIT))}
                className="text-gray-300 border-slate-700"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + LIMIT >= total}
                onClick={() => fetchLogs(offset + LIMIT)}
                className="text-gray-300 border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
