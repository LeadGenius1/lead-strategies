'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('CAMPAIGN_PERFORMANCE');

  useEffect(() => {
    loadAnalytics();
  }, [reportType]);

  const loadAnalytics = async () => {
    try {
      // Request analytics report via copilot
      const response = await apiClient.post('/api/v1/copilot/chat', {
        message: `Generate ${reportType.toLowerCase().replace(/_/g, ' ')} report`,
        context: { reportType },
      });

      // Extract analytics data from response
      if (response.data && response.data.reportType === reportType) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-neutral-400 font-geist">Loading analytics...</div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-neutral-400 font-geist">
        No analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-space-grotesk text-white">Analytics Dashboard</h2>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
        >
          <option value="CAMPAIGN_PERFORMANCE">Campaign Performance</option>
          <option value="LEAD_CONVERSION">Lead Conversion</option>
          <option value="PREDICTIVE_FORECAST">Predictive Forecast</option>
        </select>
      </div>

      {/* Summary */}
      {analytics.summary && (
        <div className="bg-[#050505] border border-subtle rounded-lg p-6">
          <h3 className="text-lg font-space-grotesk text-white mb-2">Summary</h3>
          <p className="text-neutral-400 font-geist">{analytics.summary}</p>
        </div>
      )}

      {/* Key Metrics */}
      {analytics.keyMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.keyMetrics).map(([key, value]) => (
            <div
              key={key}
              className="bg-[#050505] border border-subtle rounded-lg p-6"
            >
              <div className="text-sm font-geist text-neutral-400 mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-2xl font-space-grotesk text-white">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trends */}
      {analytics.trends && analytics.trends.length > 0 && (
        <div className="bg-[#050505] border border-subtle rounded-lg p-6">
          <h3 className="text-lg font-space-grotesk text-white mb-4">Trends</h3>
          <ul className="space-y-2">
            {analytics.trends.map((trend, index) => (
              <li key={index} className="text-neutral-400 font-geist flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <div className="bg-[#050505] border border-subtle rounded-lg p-6">
          <h3 className="text-lg font-space-grotesk text-white mb-4">Insights & Recommendations</h3>
          <ul className="space-y-2">
            {analytics.insights.map((insight, index) => (
              <li key={index} className="text-neutral-300 font-geist flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
