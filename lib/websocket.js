/**
 * WebSocket Client
 * Real-time updates for unified inbox and other features
 */

import { io } from 'socket.io-client';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    if (this.socket?.connected) {
      return; // Already connected
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.reconnectAttempts++;
    });

    // Register existing listeners
    this.listeners.forEach((callback, event) => {
      this.socket.on(event, callback);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  /**
   * Subscribe to conversation updates
   */
  subscribeToConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:conversation', conversationId);
    }
  }

  /**
   * Unsubscribe from conversation updates
   */
  unsubscribeFromConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:conversation', conversationId);
    }
  }

  /**
   * Listen to events
   */
  on(event, callback) {
    this.listeners.set(event, callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    this.listeners.delete(event);
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new WebSocketClient();
