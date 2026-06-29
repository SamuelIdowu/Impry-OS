"use server";

import { searchGlobalData, type SearchResult } from "@/lib/search";

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    try {
        return await searchGlobalData(query);
    } catch (error) {
        console.error("Error performing search:", error);
        return [];
    }
}

