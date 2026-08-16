import React from 'react';
import { Activity, Users, Server, AlertTriangle } from 'lucide-react';

export const MetricsCards = () => {
  const metrics = [
    { title: 'Total Events (24h)', value: '1.2M', icon: Activity, color: 'text-blue-500' },
    { title: 'Active Users', value: '45,231', icon: Users, color: 'text-green-500' },
    { title: 'Top Systems', value: '8 Active', icon: Server, color: 'text-purple-500' },
    { title: 'Anomalies', value: '124', icon: AlertTriangle, color: 'text-red-500' },
  ];

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
