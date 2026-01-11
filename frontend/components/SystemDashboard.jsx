/**
 * System Health Dashboard Component
 * AI Lead Strategies LLC
 *
 * Real-time monitoring dashboard for the self-healing system
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Health status colors
const STATUS_COLORS = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  critical: 'bg-red-500',
  unknown: 'bg-gray-500'
};

const SEVERITY_COLORS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
  info: 'bg-gray-500 text-white'
};

// Platform names for display
const PLATFORMS = [
  { id: 'leadsite-ai', name: 'LeadSite.AI', tier: 1 },
  { id: 'leadsite-io', name: 'LeadSite.IO', tier: 2 },
  { id: 'clientcontact-io', name: 'ClientContact.IO', tier: 3 },
  { id: 'videosite-io', name: 'VideoSite.IO', tier: 4 },
  { id: 'tackle-ai', name: 'Tackle.AI', tier: 5 }
];

// Agent icons
const AGENT_ICONS = {
  Monitor: '👁️',
  Diagnostic: '🔬',
  Repair: '🔧',
  Learning: '🧠',
  Predictive: '🔮',
  Security: '🛡️',
  Performance: '⚡'
};

export default function SystemDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  // Fetch initial dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/system/dashboard');
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/system/alerts?limit=10');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  // Connect to WebSocket for real-time updates
  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/system/live`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to system dashboard');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'INITIAL_STATE':
      case 'HEALTH':
        setDashboardData(prev => ({ ...prev, ...message.data }));
        break;
      case 'ALERT':
        setAlerts(prev => [message.data, ...prev].slice(0, 10));
        break;
      case 'REPAIR':
        setRepairs(prev => [message.data, ...prev].slice(0, 10));
        break;
      case 'AGENT_STATUS':
        setDashboardData(prev => {
          if (!prev?.agents) return prev;
          return {
            ...prev,
            agents: {
              ...prev.agents,
              [message.data.agent]: {
                ...prev.agents[message.data.agent],
                running: message.data.status === 'started'
              }
            }
          };
        });
        break;
    }
  };

  // Initial data fetch and WebSocket connection
  useEffect(() => {
    fetchDashboard();
    fetchAlerts();
    const cleanup = connectWebSocket();

    // Refresh data every 30 seconds as fallback
    const interval = setInterval(() => {
      fetchDashboard();
      fetchAlerts();
    }, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [fetchDashboard, fetchAlerts, connectWebSocket]);

  // Acknowledge alert
  const acknowledgeAlert = async (alertId) => {
    try {
      await fetch(`/api/v1/system/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      fetchAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  // Restart agent
  const restartAgent = async (agentName) => {
    try {
      await fetch(`/api/v1/system/agents/${agentName}/restart`, {
        method: 'POST'
      });
      fetchDashboard();
    } catch (err) {
      console.error('Failed to restart agent:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading System Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  const { system, health, agents } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Lead Strategies</h1>
          <p className="text-gray-400">Self-Healing System Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">
            {connected ? 'Live' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* System Status Hero */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${STATUS_COLORS[health?.overall] || STATUS_COLORS.unknown}`} />
            <div>
              <h2 className="text-2xl font-semibold capitalize">{health?.overall || 'Unknown'}</h2>
              <p className="text-gray-400">System Status</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">7</div>
              <div className="text-gray-400 text-sm">Agents Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
              <div className="text-gray-400 text-sm">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{health?.repairs?.total || 0}</div>
              <div className="text-gray-400 text-sm">Auto Repairs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{health?.learning?.patterns || 0}</div>
              <div className="text-gray-400 text-sm">Patterns</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Autonomous Agents</h3>
          <div className="space-y-3">
            {agents && Object.entries(agents).map(([name, agent]) => (
              <div key={name} className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{AGENT_ICONS[name]}</span>
                  <div>
                    <div className="font-medium">{name} Agent</div>
                    <div className="text-sm text-gray-400">
                      {agent.running ? 'Running' : 'Stopped'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${agent.running ? 'bg-green-500' : 'bg-red-500'}`} />
                  <button
                    onClick={() => restartAgent(name)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Restart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Active Alerts</h3>
          {alerts.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No active alerts</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert, index) => (
                <div key={alert.id || index} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${SEVERITY_COLORS[alert.severity]}`}>
                      {alert.severity?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-medium">{alert.type}</div>
                  <div className="text-sm text-gray-400">{alert.message}</div>
                  <div className="mt-2">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metrics Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">System Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {health?.metrics && Object.entries(health.metrics).map(([name, data]) => (
              <div key={name} className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">{name.replace(/_/g, ' ')}</div>
                <div className="text-xl font-bold">
                  {typeof data === 'object' ? data.current?.toFixed(1) : data}
                </div>
                {data?.trend && (
                  <div className={`text-sm ${data.trend === 'increasing' ? 'text-red-400' : data.trend === 'decreasing' ? 'text-green-400' : 'text-gray-400'}`}>
                    {data.trend}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Security Status</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-700 rounded p-3 text-center">
              <div className="text-2xl font-bold">{health?.security?.blockedIPs || 0}</div>
              <div className="text-sm text-gray-400">Blocked IPs</div>
            </div>
            <div className="bg-gray-700 rounded p-3 text-center">
              <div className="text-2xl font-bold">{health?.security?.recentIncidents || 0}</div>
              <div className="text-sm text-gray-400">Recent Incidents</div>
            </div>
            <div className="bg-gray-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-500">A+</div>
              <div className="text-sm text-gray-400">Security Score</div>
            </div>
          </div>
        </div>

        {/* Predictions Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Predictions</h3>
          <div className="space-y-3">
            {health?.predictions?.total > 0 ? (
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-purple-400">
                  {health.predictions.total}
                </div>
                <div className="text-gray-400">Active Predictions</div>
                <div className="text-sm text-gray-500 mt-2">
                  {health.predictions.actionsTaken} proactive actions taken
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No active predictions
              </div>
            )}
          </div>
        </div>

        {/* Performance Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Performance</h3>
          <div className="space-y-3">
            {health?.performance?.optimizations > 0 ? (
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-yellow-400">
                  {health.performance.optimizations}
                </div>
                <div className="text-gray-400">Pending Optimizations</div>
                <div className="text-sm text-red-400 mt-2">
                  {health.performance.highImpact} high impact
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                System optimized
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Self-Healing System v{system?.version || '1.0.0'} •
        Uptime: {formatUptime(system?.uptime)} •
        Last Updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

// Helper function to format uptime
function formatUptime(ms) {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
