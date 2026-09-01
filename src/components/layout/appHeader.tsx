"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationModal } from "./notificationModal";

import { Sidebar } from "./sidebar";
import { SearchDialog } from "@/components/search/searchDialog";
import { cn } from "@/lib/utils";

import type { User } from "better-auth";

import { useRouter, useParams } from "next/navigation";
import { searchGlobal } from "@/server/actions/search";
import type { SearchResult } from "@/lib/search";
import { Search, Loader2, FileText, User as UserIcon, Briefcase } from "lucide-react";

export function AppHeader({ user }: { user: User }) {
  const router = useRouter();
  const params = useParams();
  const workspaceId = (params?.workspaceId as string) || undefined;
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Inline Search State
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Debounce inline search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await searchGlobal(query.trim(), workspaceId);
          setResults(data);
          setIsDropdownOpen(true);
        } catch (error) {
          console.error("Search failed", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsDropdownOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, workspaceId]);

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectResult = (url: string) => {
    setIsDropdownOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>

          {/* Logo and Brand - Hidden on Desktop since Sidebar has it */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="size-8 rounded-lg bg-black text-white flex items-center justify-center">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                  fillOpacity="0.9"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Impry OS
            </h1>
          </div>

          {/* Right Section */}
          <div className="ml-auto flex items-center justify-end md:ml-0 md:w-full md:justify-between">
            {/* Inline Search Bar with Live Dropdown */}
            <div ref={searchContainerRef} className="relative hidden md:block w-72 lg:w-96">
              <div className="relative flex items-center">
                <Search className="absolute left-3 size-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (results.length > 0) setIsDropdownOpen(true); }}
                  placeholder="Search clients, projects, invoices..."
                  className="w-full h-9 pl-9 pr-14 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none transition-all"
                />
                {isSearching ? (
                  <Loader2 className="absolute right-3 size-4 animate-spin text-zinc-400" />
                ) : (
                  <span className="absolute right-2 text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded shadow-2xs">
                    ⌘K
                  </span>
                )}
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto p-1 animate-in fade-in-50 zoom-in-95 duration-100">
                  {results.length > 0 ? (
                    results.map((res) => (
                      <button
                        key={`${res.type}-${res.id}`}
                        onClick={() => handleSelectResult(res.url)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/70 text-left transition-colors group"
                      >
                        <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 group-hover:text-zinc-900">
                          {res.type === 'client' && <UserIcon className="size-4" />}
                          {res.type === 'project' && <Briefcase className="size-4" />}
                          {res.type === 'invoice' && <FileText className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {res.subtitle}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : query.trim().length >= 2 ? (
                    <div className="py-4 text-center text-xs text-zinc-400">
                      No results found for "{query}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationModal
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-200",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-200",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar Container */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-64 bg-white dark:bg-zinc-950 shadow-xl transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="relative h-full">
            <button
              className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 z-10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="size-5" />
            </button>
            <Sidebar
              user={user}
              className="block w-full border-none"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
