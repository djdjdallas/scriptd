"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";
import {
  Plus,
  Search,
  FileText,
  Clock,
  Calendar,
  Trash2,
  Edit,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
  Eye,
  Share2,
  History,
} from "lucide-react";
import { SCRIPT_TYPES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function ScriptsPage() {
  const { toast } = useToast();
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hoveredScript, setHoveredScript] = useState(null);

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const hasMountedRef = useRef(false);

  // CRITICAL: Store the last fetch parameters to prevent duplicate fetches
  const lastFetchParamsRef = useRef(null);

  // Fetch function - NOT wrapped in useCallback to avoid dependency issues
  const fetchScripts = async (searchTerm, filter, sort, pageNum) => {
    // Check if we're fetching with the same parameters
    const fetchParams = `${searchTerm}-${filter}-${sort}-${pageNum}`;
    if (lastFetchParamsRef.current === fetchParams && !hasMountedRef.current) {
      console.log(
        "[ScriptsPage] Skipping duplicate fetch with same params:",
        fetchParams
      );
      return;
    }
    lastFetchParamsRef.current = fetchParams;

    console.log(
      `[ScriptsPage] Fetching scripts - search: "${searchTerm}", filter: ${filter}, sort: ${sort}, page: ${pageNum}`
    );

    // Set loading state
    setIsLoading(true);

    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      console.log("[ScriptsPage] Aborting previous request");
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        sortBy: sort,
        sortOrder: "desc",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filter && filter !== "all") params.append("type", filter);

      const response = await fetch(`/api/scripts?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: Failed to fetch scripts`
        );
      }

      const result = await response.json();

      console.log(`[ScriptsPage] API Response:`, result);

      // Handle the response
      const scriptsData = result.items || [];
      const paginationData = result.pagination || {};

      setScripts(scriptsData);
      setTotalPages(paginationData.pages || 1);
      console.log(
        `[ScriptsPage] Set ${scriptsData.length} scripts, ${
          paginationData.pages || 1
        } pages`
      );
    } catch (error) {
      // Ignore abort errors
      if (error.name === "AbortError") {
        console.log("[ScriptsPage] Request was aborted");
        return;
      }

      console.error("[ScriptsPage] Error fetching scripts:", error);

      // Only show toast after initial mount
      if (hasMountedRef.current) {
        toast({
          title: "Failed to load scripts",
          description: error.message || "Please try refreshing the page",
          variant: "destructive",
        });
      }

      // Reset to empty state on error
      setScripts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load - ONLY runs once
  useEffect(() => {
    if (hasMountedRef.current) return; // Prevent double mount in dev mode

    console.log("[ScriptsPage] Initial mount - fetching scripts");
    hasMountedRef.current = true;

    fetchScripts("", "all", "created_at", 1);

    // Cleanup function
    return () => {
      console.log("[ScriptsPage] Component unmounting");

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear any pending timeouts
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []); // Empty deps - only run once

  // Handle all parameter changes in a single effect
  useEffect(() => {
    // Skip the initial render
    if (!hasMountedRef.current) return;

    console.log(
      `[ScriptsPage] Parameters changed - search: "${search}", filter: ${typeFilter}, sort: ${sortBy}, page: ${page}`
    );

    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // For search changes, debounce; for others, execute immediately
    const delay =
      search !== "" ||
      typeFilter !== "all" ||
      sortBy !== "created_at" ||
      page !== 1
        ? 500
        : 0;

    searchTimeoutRef.current = setTimeout(
      () => {
        // Reset page to 1 if search, filter, or sort changed
        const currentPage =
          (search !== "" || typeFilter !== "all" || sortBy !== "created_at") &&
          page !== 1
            ? 1
            : page;

        if (currentPage !== page) {
          setPage(1);
        }

        fetchScripts(search, typeFilter, sortBy, currentPage);
      },
      search !== "" ? 500 : 0
    ); // Only debounce search

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, typeFilter, sortBy, page]); // Dependencies without fetchScripts

  const handleDelete = async (scriptId) => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    console.log(`[ScriptsPage] Deleting script: ${scriptId}`);

    try {
      const response = await fetch(`/api/scripts/${scriptId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete script");
      }

      toast({
        title: "Script Deleted",
        description: "The script has been deleted successfully.",
      });

      // Remove the script from the list locally
      setScripts((prevScripts) => prevScripts.filter((s) => s.id !== scriptId));

      // If we deleted the last item on a page, go to previous page
      if (scripts.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error(`[ScriptsPage] Delete failed:`, error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Show loading spinner only during the initial load
  if (isLoading && scripts.length === 0 && !hasMountedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 animate-pulse-slow">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
          <p className="mt-4 text-gray-300">Loading your scripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="gradient-orb w-96 h-96 bg-purple-600 -top-48 -right-48 opacity-20" />
        <div
          className="gradient-orb w-96 h-96 bg-pink-600 -bottom-48 -left-48 opacity-20"
          style={{ animationDelay: "10s" }}
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      </div>

      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-reveal">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <FileText className="h-10 w-10 text-purple-400 neon-glow" />
              Scripts
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 mt-2">
              Manage and create your viral YouTube scripts
            </p>
          </div>

          <Link href="/scripts/create">
            <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white group">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              New Script
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-reveal"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {scripts.length}
            </div>
            <p className="text-sm text-gray-400">Total Scripts</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {
                scripts.filter(
                  (s) =>
                    new Date(s.createdAt) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
              }
            </div>
            <p className="text-sm text-gray-400">This Week</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">
              {scripts.reduce((acc, s) => acc + (s.length || 0), 0)}
            </div>
            <p className="text-sm text-gray-400">Total Minutes</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold gradient-text flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              {Math.round(scripts.length * 2.5)}K
            </div>
            <p className="text-sm text-gray-400">Est. Views</p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="glass-card p-6 animate-reveal"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search scripts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-10 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="glass-button w-[180px] text-white border-white/20 bg-white/10 [&>span]:text-white">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="glass bg-gray-900/95 border-white/20 backdrop-blur-md">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-white/10"
                >
                  All types
                </SelectItem>
                {Object.entries(SCRIPT_TYPES).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={value}
                    className="text-white hover:bg-white/10"
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass-button w-[180px] text-white border-white/20 bg-white/10 [&>span]:text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="glass bg-gray-900/95 border-white/20 backdrop-blur-md">
                <SelectItem
                  value="created_at"
                  className="text-white hover:bg-white/10"
                >
                  Newest
                </SelectItem>
                <SelectItem
                  value="updated_at"
                  className="text-white hover:bg-white/10"
                >
                  Recently updated
                </SelectItem>
                <SelectItem
                  value="title"
                  className="text-white hover:bg-white/10"
                >
                  Title (A-Z)
                </SelectItem>
                <SelectItem
                  value="length"
                  className="text-white hover:bg-white/10"
                >
                  Length
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading indicator for subsequent loads */}
        {isLoading && hasMountedRef.current && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-300">Loading scripts...</span>
          </div>
        )}

        {/* Scripts Grid */}
        {!isLoading && scripts.length === 0 ? (
          <div
            className="glass-card p-12 text-center animate-reveal"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative inline-block">
              <FileText className="h-20 w-20 mx-auto text-purple-400 neon-glow" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mt-6 mb-2">
              {search || typeFilter !== "all"
                ? "No scripts found"
                : "No scripts yet"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {search || typeFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start creating viral content with AI-powered script generation"}
            </p>
            {!(search || typeFilter !== "all") && (
              <Link href="/scripts/create">
                <Button className="glass-button bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Script
                </Button>
              </Link>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="grid gap-6 stagger-children">
              {scripts.map((script, index) => (
                <TiltCard key={script.id}>
                  <div
                    className="glass-card glass-hover overflow-hidden group"
                    onMouseEnter={() => setHoveredScript(script.id)}
                    onMouseLeave={() => setHoveredScript(null)}
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                            <Link
                              href={`/scripts/${script.id}`}
                              className="hover:text-purple-400 transition-colors"
                            >
                              {script.title}
                            </Link>
                            {hoveredScript === script.id && (
                              <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                            )}
                          </h3>

                          <p className="text-gray-400 mb-4 line-clamp-2">
                            {script.excerpt || "No description available"}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            <Badge className="glass border-purple-400/50 text-purple-300">
                              {script.type || "general"}
                            </Badge>
                            <span className="flex items-center gap-1 text-gray-400">
                              <Clock className="h-3 w-3" />
                              {script.length || 5} min
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {script.createdAt
                                ? formatDistanceToNow(
                                    new Date(script.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )
                                : "Unknown"}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <Eye className="h-3 w-3" />
                              {Math.round(
                                (script.id ? script.id.charCodeAt(0) : 1) *
                                  123.456
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-6">
                          <Link href={`/scripts/${script.id}`}>
                            <Button
                              className="glass-button hover:bg-blue-500/20"
                              size="icon"
                              title="View Script"
                            >
                              <Eye className="h-4 w-4 text-white" />
                            </Button>
                          </Link>
                          <Link href={`/scripts/${script.id}/edit`}>
                            <Button
                              className="glass-button hover:bg-purple-500/20"
                              size="icon"
                              title="Edit Script"
                            >
                              <Edit className="h-4 w-4 text-white" />
                            </Button>
                          </Link>
                          <Link href={`/scripts/${script.id}/history`}>
                            <Button
                              className="glass-button hover:bg-yellow-500/20"
                              size="icon"
                              title="Version History"
                            >
                              <History className="h-4 w-4 text-white" />
                            </Button>
                          </Link>
                          <Button
                            className="glass-button hover:bg-pink-500/20"
                            size="icon"
                            onClick={() => handleDelete(script.id)}
                            title="Delete Script"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            className="glass-button hover:bg-green-500/20"
                            size="icon"
                            title="Share Script"
                          >
                            <Share2 className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      {hoveredScript === script.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 animate-shimmer" />
                      )}
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-center gap-4 animate-reveal">
            <Button
              className="glass-button text-white"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-300">
                Page <span className="gradient-text font-bold">{page}</span> of{" "}
                <span className="gradient-text font-bold">{totalPages}</span>
              </span>
            </div>
            <Button
              className="glass-button text-white"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Floating action hints */}
      {!isLoading && scripts.length > 0 && (
        <div className="fixed bottom-6 right-6 glass-card p-4 animate-float max-w-xs">
          <p className="text-sm text-gray-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            Pro tip: Use AI to generate viral hooks!
          </p>
        </div>
      )}
    </div>
  );
}
