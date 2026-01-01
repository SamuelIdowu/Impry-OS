"use client"

import * as React from "react"
import { Search, Loader2, FileText, User, Briefcase } from "lucide-react"
import { useRouter } from "next/navigation" // Using next/navigation for App Router
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Assuming standard shadcn Dialog
import { Input } from "@/components/ui/input"
import { searchGlobal, SearchResult } from "@/server/actions/search"
import { cn } from "@/lib/utils"

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true)
                try {
                    const data = await searchGlobal(query)
                    setResults(data)
                } catch (error) {
                    console.error("Search failed", error)
                    setResults([])
                } finally {
                    setLoading(false)
                }
            } else {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (url: string) => {
        onOpenChange(false)
        router.push(url)
    }

    // Effect to handle keyboard shortcut (Cmd+K)
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onOpenChange(true) // We rely on parent to pass open/onOpenChange or we should control it here?
                // Actually AppHeader controls it usually. But if we want global shortcut...
                // The parent AppHeader likely handles the open state passed to this. 
                // However, usually the shortcut listener is at the top level or header level.
                // We'll let AppHeader handle the shortcut opening mostly, but keeping this here just in case this component is mounted and we want to toggle.
                // But typically onOpenChange is from parent.
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Search</DialogTitle>
                </DialogHeader>

                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder="Search clients, projects, invoices..."
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0 shadow-none px-0"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto p-1">
                    {loading && (
                        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                        </div>
                    )}

                    {!loading && results.length === 0 && query.length >= 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    )}

                    {!loading && results.map((result) => (
                        <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result.url)}
                            className={cn(
                                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-zinc-100 hover:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            )}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-zinc-50 mr-3">
                                {result.type === 'client' && <User className="h-4 w-4 text-zinc-500" />}
                                {result.type === 'project' && <Briefcase className="h-4 w-4 text-zinc-500" />}
                                {result.type === 'invoice' && <FileText className="h-4 w-4 text-zinc-500" />}
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="font-medium text-zinc-900">{result.title}</span>
                                <span className="text-xs text-zinc-500">{result.subtitle}</span>
                            </div>
                        </button>
                    ))}

                    {query.length < 2 && !loading && (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                            Type at least 2 characters to search...
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between border-t bg-zinc-50 px-4 py-2">
                    <span className="text-xs text-muted-foreground">
                        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">esc</span></kbd> to close
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
