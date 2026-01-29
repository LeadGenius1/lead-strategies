/**
 * WebSocket Client for Real-Time Updates
 * ClientContact.IO unified inbox real-time messaging
 */

import { io } from 'socket.io-client';
import { getToken } from './auth';

// Note: socket.io-client is already installed in package.json

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  connect(token = null) {
    if (this.socket?.connected) {
      return;
    }

    const authToken = token || getToken();
    if (!authToken) {
      console.warn('[WebSocket] No auth token, skipping connection');
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:3001';

    this.socket = io(wsUrl, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('[WebSocket] Connected');
      
      // Re-subscribe to conversations
      this.resubscribe();
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('[WebSocket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.reconnectAttempts++;
    });

    // Set up default listeners
    this.setupDefaultListeners();
  }

  /**
   * Setup default event listeners
   */
  setupDefaultListeners() {
    // Conversation updates
    this.socket?.on('conversation:updated', (data) => {
      this.emit('conversation:updated', data);
    });

    // New messages
    this.socket?.on('message:new', (data) => {
      this.emit('message:new', data);
    });

    // Message read status
    this.socket?.on('message:read', (data) => {
      this.emit('message:read', data);
    });
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
   * Unsubscribe from conversation
   */
  unsubscribeFromConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:conversation', conversationId);
    }
  }

  /**
   * Re-subscribe to all conversations (on reconnect)
   */
  resubscribe() {
    // Get active conversation IDs from state/localStorage
    const activeConversations = this.getActiveConversations();
    activeConversations.forEach(id => {
      this.subscribeToConversation(id);
    });
  }

  /**
   * Get active conversation IDs (to be implemented by consumer)
   */
  getActiveConversations() {
    // This should be overridden or passed from the component
    return [];
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
export default new WebSocketClient();
