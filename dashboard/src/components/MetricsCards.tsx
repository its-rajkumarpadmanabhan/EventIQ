import React from 'react';
import { Activity, Users, Server, AlertTriangle } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';

const fetchMetrics = async () => {
  const response = await fetch('http://localhost:8000/api/v1/analytics/metrics/');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const MetricsCards = () => {
  const { data, isLoading } = useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics, refetchInterval: 5000 });

  const metrics = [
    { title: 'Total Events (24h)', value: data?.total_events || 0, icon: Activity, color: 'text-blue-500' },
    { title: 'Active Users', value: data?.active_users || 0, icon: Users, color: 'text-green-500' },
    { title: 'Top Systems', value: `${data?.top_systems || 0} Active`, icon: Server, color: 'text-purple-500' },
    { title: 'Anomalies', value: data?.anomalies || 0, icon: AlertTriangle, color: 'text-red-500' },
  ];

  if (isLoading) {
    return <div className="text-center text-gray-500 py-4">Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-dark-card border border-dark-border rounded-lg p-5 flex items-center shadow-lg transition-transform hover:scale-[1.02]">
          <div className={`p-3 rounded-full bg-dark-bg ${metric.color} mr-4`}>
            <metric.icon size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{metric.title}</p>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
