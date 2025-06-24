"use client";
import { authenticatedFetch } from "../userAuth";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const BASE_URL = "http://localhost:8080/notifications";
console.log("Loading NotiApi.ts with unhideNotification method");

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  senderUsername: string | null;
  recipientUsername: string | null;
  type: "recipe" | "user" | "comment" | "system" | "report";
  date: string;
  time: string;
  readStatus: boolean;
  dismissed: boolean;
  recipientId: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page
  first: boolean;
  last: boolean;
  empty: boolean;
}

type NotificationCallback = (notification: NotificationResponse) => void;

class NotificationApi {
  private client: Client | null = null;
  private callbacks: NotificationCallback[] = [];
  private connected: boolean = false;
  private baseUrl: string = "http://localhost:8080";
  private connectAttempts: number = 0;
  private maxAttempts: number = 10;
  private reconnectTimeout: number = 2000; // 2 giây giữa các lần retry

  constructor() {
    this.setupConnectionMonitor();
  }

  private getTokenFromCookie(name: string): string | null {
    if (typeof document === "undefined") {
      console.warn("getTokenFromCookie called outside browser environment");
      return null;
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }

  async connect(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      if (this.client && this.connected) {
        console.log("✅ WebSocket already connected");
        return true;
      }

      if (this.client) {
        this.disconnect();
      }

      const token = this.getTokenFromCookie("auth_token");
      if (!token) {
        console.error("❌ Cannot connect WebSocket: Token not available");
        return false;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(`${this.baseUrl}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => console.debug("STOMP: " + str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log("✅ WebSocket connection established:", frame);
        this.connected = true;
        this.connectAttempts = 0;
        this.subscribe();
      };

      this.client.onStompError = (frame) => {
        console.error("⚠️ WebSocket STOMP error:", frame.headers["message"]);
        this.handleConnectionFailure();
      };

      this.client.onWebSocketClose = () => {
        console.warn("⚠️ WebSocket closed");
        this.connected = false;
        this.handleConnectionFailure();
      };

      this.client.onWebSocketError = (error) => {
        console.error("⚠️ WebSocket error:", error);
        this.handleConnectionFailure();
      };

      console.log(`🔄 Attempting to connect (attempt ${this.connectAttempts + 1}/${this.maxAttempts})...`);
      this.connectAttempts++;
      this.client.activate();
      return this.waitForConnection(5000); // Đợi 5 giây để kết nối
    } catch (error) {
      console.error("❌ WebSocket connection error:", error);
      this.handleConnectionFailure();
      return false;
    }
  }

  private handleConnectionFailure() {
    if (this.connectAttempts < this.maxAttempts) {
      console.log(`🔄 Reconnecting in ${this.reconnectTimeout / 1000} seconds (attempt ${this.connectAttempts}/${this.maxAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectTimeout);
    } else {
      console.error(`❌ Max reconnect attempts (${this.maxAttempts}) reached. Giving up.`);
    }
  }

  private subscribe() {
    if (this.client && this.connected) {
      this.client.subscribe("/topic/notifications", this.handleMessage);
      this.client.subscribe("/user/queue/notifications", this.handleMessage);
      console.log("✅ Subscribed to /topic/notifications and /user/queue/notifications");
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      console.log("🛑 WebSocket disconnected");
    }
    this.connected = false;
    this.connectAttempts = 0;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private handleMessage = (message: any): void => {
    try {
      if (!message || !message.body) {
        console.error("❌ Received message with no body");
        return;
      }

      const notification: NotificationResponse = JSON.parse(message.body);
      console.log("📢 Processed WebSocket notification:", notification);

      if (!notification.id) {
        console.error("❌ Notification missing required 'id' field");
        return;
      }

      this.callbacks.forEach((callback) => {
        try {
          callback(notification);
        } catch (error) {
          console.error("❌ Error in notification callback:", error);
        }
      });
    } catch (error) {
      console.error("❌ Error processing WebSocket message:", error);
    }
  };

  registerCallback(callback: NotificationCallback): void {
    this.callbacks.push(callback);
    console.log(`🔔 Registered callback, total: ${this.callbacks.length}`);
  }

  unregisterCallback(callback: NotificationCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    console.log(`🔔 Unregistered callback, total: ${this.callbacks.length}`);
  }

  setupConnectionMonitor() {
    if (typeof window === "undefined") return;

    const intervalId = setInterval(() => {
      console.log(
        `WebSocket status: ${this.connected ? "Connected ✅" : "Disconnected ❌"}`
      );
      if (!this.connected) {
        console.log("🔄 Attempting to reconnect WebSocket...");
        this.connect();
      }
      console.log(`📊 Registered callbacks: ${this.callbacks.length}`);
    }, 30000);

    return () => clearInterval(intervalId);
  }

  async waitForConnection(timeout = 10000): Promise<boolean> {
    if (this.isConnected()) return true;

    return new Promise((resolve) => {
      const maxAttempts = Math.floor(timeout / 500);
      let attempts = 0;
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        console.warn("⏱️ Timeout waiting for WebSocket connection");
        resolve(false);
      }, timeout);

      const checkInterval = setInterval(() => {
        attempts++;
        if (this.isConnected()) {
          clearTimeout(timeoutId);
          clearInterval(checkInterval);
          console.log("✅ WebSocket connection established");
          resolve(true);
        }
        if (attempts === 1 || attempts % 3 === 0) {
          console.log(`🔄 Attempting to connect (attempt ${attempts}/${maxAttempts})...`);
          this.connect();
        }
        if (attempts >= maxAttempts) {
          clearTimeout(timeoutId);
          clearInterval(checkInterval);
          console.warn("⚠️ Max connection attempts reached");
          resolve(false);
        }
      }, 500);
    });
  }

  async getNotifications(page: number = 0, size: number = 10): Promise<PaginatedResponse<NotificationResponse>> {
    try {
      const response = await authenticatedFetch(`${BASE_URL}?page=${page}&size=${size}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("📋 getNotifications Response:", data);

      return {
        content: data.content || data.result?.content || [],
        totalPages: data.totalPages || data.result?.totalPages || 1,
        totalElements: data.totalElements || data.result?.totalElements || 0,
        size: data.size || data.result?.size || size,
        number: data.number || data.result?.number || page,
        first: data.first || data.result?.first || (page === 0),
        last: data.last || data.result?.last || (page >= (data.totalPages - 1) || data.result?.totalPages - 1),
        empty: data.empty || data.result?.empty || (data.content?.length === 0 || data.result?.content?.length === 0),
      };
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size,
        number: page,
        first: true,
        last: true,
        empty: true,
      };
    }
  }

  async getDismissedNotifications(page: number = 0, size: number = 10): Promise<PaginatedResponse<NotificationResponse>> {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/dismissed?page=${page}&size=${size}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("📋 getDismissedNotifications Response:", data);

      return {
        content: data.content || data.result?.content || [],
        totalPages: data.totalPages || data.result?.totalPages || 1,
        totalElements: data.totalElements || data.result?.totalElements || 0,
        size: data.size || data.result?.size || size,
        number: data.number || data.result?.number || page,
        first: data.first || data.result?.first || (page === 0),
        last: data.last || data.result?.last || (page >= (data.totalPages - 1) || data.result?.totalPages - 1),
        empty: data.empty || data.result?.empty || (data.content?.length === 0 || data.result?.content?.length === 0),
      };
    } catch (error) {
      console.error("❌ Failed to fetch dismissed notifications:", error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size,
        number: page,
        first: true,
        last: true,
        empty: true,
      };
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/${notificationId}/read`, { method: "PUT" });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      console.log(`✅ Marked notification ${notificationId} as read`);
      return true;
    } catch (error) {
      console.error("❌ Error marking as read:", error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error marking all as read: ${response.status} ${errorText}`);
        throw new Error(`HTTP error: ${response.status}`);
      }
      console.log("✅ Marked all notifications as read successfully");
      return true;
    } catch (error) {
      console.error("❌ Error marking all as read:", error);
      return false;
    }
  }

  async dismissNotification(notificationId: string): Promise<boolean> {
    if (!notificationId) {
      console.error("❌ Notification ID is required");
      return false;
    }

    try {
      const response = await authenticatedFetch(`${BASE_URL}/${notificationId}/dismiss`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Dismiss failed (${response.status}): ${errorText}`);
        return false;
      }
      console.log(`✅ Notification ${notificationId} dismissed successfully`);
      return true;
    } catch (error) {
      console.error("❌ Dismiss notification error:", error);
      return false;
    }
  }

  async unhideNotification(notificationId: string): Promise<boolean> {
    if (!notificationId) {
      console.error("❌ Notification ID is required");
      return false;
    }

    try {
      const response = await authenticatedFetch(`${BASE_URL}/${notificationId}/unhide`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Unhide failed (${response.status}): ${errorText}`);
        return false;
      }
      console.log(`✅ Notification ${notificationId} unhidden successfully`);
      return true;
    } catch (error) {
      console.error("❌ Error unhiding notification:", error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    if (!notificationId) {
      console.error("❌ Notification ID is required");
      return false;
    }

    try {
      const response = await authenticatedFetch(`${BASE_URL}/${notificationId}`, { method: "DELETE" });
      if (!response.ok) {
        console.error(`❌ Error deleting notification ${notificationId}: ${response.status} - ${response.statusText}`);
        return false;
      }
      console.log(`✅ Deleted notification ${notificationId} successfully`);
      return true;
    } catch (error) {
      console.error("❌ Network error deleting notification:", error);
      return false;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const result = await this.getNotifications(0, 100);
      return result.content.filter((n) => !n.readStatus).length;
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
      return 0;
    }
  }
}

const api = new NotificationApi();
console.log("Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(api)));
export const notificationApi = api;