"use server";

import { getNotifications, type NotificationItem } from "@/lib/notifications";

export async function fetchNotifications(): Promise<{ success: boolean; data?: NotificationItem[]; error?: string }> {
    try {
        const data = await getNotifications();
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, error: "Failed to fetch notifications" };
    }
}
