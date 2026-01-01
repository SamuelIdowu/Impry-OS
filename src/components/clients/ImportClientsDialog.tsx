"use client"

import { useState } from "react"
import { Upload, X, Check, AlertCircle, FileText } from "lucide-react"
import Papa from "papaparse"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { importClientsAction } from "@/server/actions/clients"
import { CreateClientInput } from "@/lib/types/client"

interface ImportClientsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface CSVRow {
    name?: string
    email?: string
    company?: string
    notes?: string
    [key: string]: any
}

export function ImportClientsDialog({ open, onOpenChange, onSuccess }: ImportClientsDialogProps) {
    const [clients, setClients] = useState<CreateClientInput[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const processFile = (file: File) => {
        setIsParsing(true)
        setErrors([])
        setClients([])

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedClients: CreateClientInput[] = []
                const parseErrors: string[] = []

                results.data.forEach((row: any, index: number) => {
                    // Try to map various common CSV headers
                    const name = row.name || row.Name || row.client || row.Client || row['Client Name']
                    const email = row.email || row.Email || row['Email Address']
                    const company = row.company || row.Company || row['Company Name'] || row.organization || row.Organization
                    const notes = row.notes || row.Notes || row.description || row.Description

                    if (!name) {
                        parseErrors.push(`Row ${index + 1}: Missing name`)
                        return
                    }

                    if (!email) {
                        parseErrors.push(`Row ${index + 1}: Missing email`)
                        return
                    }

                    parsedClients.push({
                        name: name.trim(),
                        email: email.trim(),
                        company: company?.trim(),
                        notes: notes?.trim()
                    })
                })

                if (parseErrors.length > 0) {
                    setErrors(parseErrors)
                }

                if (parsedClients.length > 0) {
                    setClients(parsedClients)
                } else if (parseErrors.length === 0) {
                    setErrors(["No valid clients found in CSV. Please ensure headers include 'name' and 'email'."])
                }

                setIsParsing(false)
            },
            error: (error: Error) => {
                setErrors([`CSV parsing error: ${error.message}`])
                setIsParsing(false)
            }
        })
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type === "text/csv" || file.name.endsWith('.csv')) {
            processFile(file)
        } else {
            // toast.error("Please upload a CSV file")
            alert("Please upload a CSV file")
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const handleImport = async () => {
        if (clients.length === 0) return

        setIsImporting(true)
        try {
            const result = await importClientsAction(clients)

            if (result.success) {
                // toast.success(`Successfully imported ${result.count} clients`)
                alert(`Successfully imported ${result.count} clients`)
                onOpenChange(false)
                onSuccess?.()
                // Reset state
                setClients([])
                setErrors([])
            } else {
                // toast.error(result.error || "Failed to import clients")
                setErrors([result.error || "Failed to import clients"])
            }
        } catch (error) {
            // toast.error("An unexpected error occurred")
            setErrors(["An unexpected error occurred"])
            console.error(error)
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Clients from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with "name" and "email" columns. Optional columns: "company", "notes".
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {clients.length === 0 ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-4 rounded-full bg-zinc-100">
                                    <Upload className="h-6 w-6 text-zinc-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-zinc-900">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        CSV files only (max 5MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    id="csv-upload"
                                    onChange={handleFileSelect}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById("csv-upload")?.click()}
                                    disabled={isParsing}
                                    className="mt-2"
                                >
                                    {isParsing ? "Parsing..." : "Select File"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg border-zinc-200 overflow-hidden">
                            <div className="bg-zinc-50 p-3 border-b border-zinc-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-zinc-500" />
                                    <span className="text-sm font-medium text-zinc-900">
                                        Ready to import {clients.length} clients
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                        setClients([])
                                        setErrors([])
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="h-[300px] overflow-y-auto border-t border-zinc-100">
                                <div className="divide-y divide-zinc-100">
                                    {clients.map((client, i) => (
                                        <div key={i} className="p-3 flex items-start justify-between text-sm hover:bg-zinc-50">
                                            <div>
                                                <div className="font-medium text-zinc-900">{client.name}</div>
                                                <div className="text-zinc-500">{client.email}</div>
                                                {client.company && (
                                                    <div className="text-xs text-zinc-400 mt-0.5">{client.company}</div>
                                                )}
                                            </div>
                                            <Check className="h-4 w-4 text-green-500 mt-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {errors.length > 0 && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Import Issues</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1">
                                {errors.slice(0, 5).map((error, i) => (
                                    <li key={i} className="text-sm text-red-600">
                                        {error}
                                    </li>
                                ))}
                                {errors.length > 5 && (
                                    <li className="text-sm text-red-600">
                                        ...and {errors.length - 5} more issues
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isImporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={clients.length === 0 || isImporting}
                    >
                        {isImporting ? "Importing..." : "Import Clients"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
