import { api } from "@/lib/api";
import type { ApiResponse, NotificationsListData, NotificationItem } from "@/types";

export async function getNotifications(
  params: { page?: number; limit?: number } = {}
): Promise<NotificationsListData> {
  const res = await api.get<ApiResponse<NotificationsListData>>(
    "/notifications",
    { params }
  );
  return res.data.data;
}

export async function markAsRead(id: string): Promise<NotificationItem> {
  const res = await api.put<ApiResponse<{ notification: NotificationItem }>>(
    `/notifications/${id}/read`
  );
  return res.data.data.notification;
}

export async function markAllAsRead(): Promise<void> {
  await api.put("/notifications/read-all");
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}

export const notificationsApi = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};