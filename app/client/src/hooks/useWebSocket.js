/**
 * useWebSocket Hook
 * ==================
 * React hook for managing WebSocket connections with automatic reconnection.
 *
 * Features:
 * - Automatic connection management
 * - Reconnection with exponential backoff
 * - Message event handling
 * - Connection state tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const INITIAL_BACKOFF = 1000; // 1 second
const MAX_BACKOFF = 30000;     // 30 seconds
const MAX_RETRIES = 10;

const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RECONNECTING: 'reconnecting'
};

/**
 * Custom hook for WebSocket connections.
 *
 * @param {string} url - WebSocket URL (e.g., 'ws://localhost:8000/ws/prices/EUR_USD/M5')
 * @param {object} options - Configuration options
 * @param {boolean} options.autoConnect - Connect automatically on mount (default: true)
 * @param {boolean} options.autoReconnect - Reconnect automatically on disconnect (default: true)
 * @param {function} options.onOpen - Callback when connection opens
 * @param {function} options.onMessage - Callback when message received
 * @param {function} options.onClose - Callback when connection closes
 * @param {function} options.onError - Callback when error occurs
 *
 * @returns {object} WebSocket connection interface
 */
export const useWebSocket = (url, options = {}) => {
  const {
    autoConnect = true,
    autoReconnect = true,
    onOpen,
    onMessage,
    onClose,
    onError
  } = options;

  const [status, setStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(autoReconnect);
  const currentBackoffRef = useRef(INITIAL_BACKOFF);
  const isConnectingRef = useRef(false);

  /**
   * Connect to WebSocket server.
   */
  const connect = useCallback(() => {
    if (!url) {
      console.error('[useWebSocket] No URL provided');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[useWebSocket] Already connected');
      return;
    }

    if (isConnectingRef.current) {
      console.log('[useWebSocket] Connection already in progress');
      return;
    }

    console.log(`[useWebSocket] Connecting to ${url}`);
    isConnectingRef.current = true;
    setStatus(CONNECTION_STATUS.CONNECTING);
    setError(null);

    try {
      const ws = new WebSocket(url);

      ws.onopen = (event) => {
        console.log('[useWebSocket] Connection opened');
        isConnectingRef.current = false;
        setStatus(CONNECTION_STATUS.CONNECTED);
        setRetryCount(0);
        currentBackoffRef.current = INITIAL_BACKOFF;

        if (onOpen) {
          onOpen(event);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.debug('[useWebSocket] Message received:', data.type);

          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error('[useWebSocket] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[useWebSocket] WebSocket error:', event);
        console.error('[useWebSocket] WebSocket readyState:', ws.readyState);
        console.error('[useWebSocket] WebSocket URL:', url);
        isConnectingRef.current = false;
        setStatus(CONNECTION_STATUS.ERROR);
        setError('WebSocket connection error');

        if (onError) {
          onError(event);
        }
      };

      ws.onclose = (event) => {
        console.log('[useWebSocket] Connection closed:', event.code, event.reason);
        console.log('[useWebSocket] Close event details:', {
          wasClean: event.wasClean,
          code: event.code,
          reason: event.reason,
          url: url
        });
        isConnectingRef.current = false;
        setStatus(CONNECTION_STATUS.DISCONNECTED);
        wsRef.current = null;

        if (onClose) {
          onClose(event);
        }

        // Attempt reconnection if enabled
        if (shouldReconnectRef.current && retryCount < MAX_RETRIES) {
          handleReconnect();
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[useWebSocket] Error creating WebSocket:', err);
      isConnectingRef.current = false;
      setStatus(CONNECTION_STATUS.ERROR);
      setError(err.message);

      if (shouldReconnectRef.current && retryCount < MAX_RETRIES) {
        handleReconnect();
      }
    }
  }, [url, onOpen, onMessage, onClose, onError, retryCount]);

  /**
   * Disconnect from WebSocket server.
   */
  const disconnect = useCallback(() => {
    console.log('[useWebSocket] Disconnecting');
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus(CONNECTION_STATUS.DISCONNECTED);
  }, []);

  /**
   * Handle reconnection with exponential backoff.
   */
  const handleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current) {
      return;
    }

    setRetryCount((prev) => {
      const newRetryCount = prev + 1;

      if (newRetryCount >= MAX_RETRIES) {
        console.error('[useWebSocket] Max retry attempts reached');
        setStatus(CONNECTION_STATUS.ERROR);
        setError('Max reconnection attempts reached');
        return prev;
      }

      const backoff = Math.min(currentBackoffRef.current, MAX_BACKOFF);
      currentBackoffRef.current = backoff * 2;

      console.log(`[useWebSocket] Reconnecting in ${backoff}ms (attempt ${newRetryCount}/${MAX_RETRIES})`);
      setStatus(CONNECTION_STATUS.RECONNECTING);

      reconnectTimeoutRef.current = setTimeout(() => {
        connectRef.current();
      }, backoff);

      return newRetryCount;
    });
  }, []);

  /**
   * Send message to WebSocket server.
   */
  const sendMessage = useCallback((data) => {
    if (!wsRef.current) {
      console.error('[useWebSocket] Cannot send message: not connected');
      return false;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('[useWebSocket] Cannot send message: connection not open');
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      console.debug('[useWebSocket] Message sent');
      return true;
    } catch (err) {
      console.error('[useWebSocket] Error sending message:', err);
      return false;
    }
  }, []);

  // Store connect function in ref for stable reference
  const connectRef = useRef(connect);
  connectRef.current = connect;

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && url) {
      connectRef.current();
    }

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, url]);

  return {
    status,
    error,
    retryCount,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === CONNECTION_STATUS.CONNECTED,
    isConnecting: status === CONNECTION_STATUS.CONNECTING || status === CONNECTION_STATUS.RECONNECTING,
    isDisconnected: status === CONNECTION_STATUS.DISCONNECTED,
    isError: status === CONNECTION_STATUS.ERROR
  };
};

export { CONNECTION_STATUS };
