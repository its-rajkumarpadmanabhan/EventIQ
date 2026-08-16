import React from 'react';
import { useQuery } from '@tanstack/react-query';

const fetchEvents = async () => {
  // In a real app, this would fetch from our Django API endpoint
  // return fetch('http://localhost:8000/api/v1/analytics/events/').then(res => res.json());
  
  // Mocking for immediate visual feedback
  return {
    items: [
      { log_id: '1', timestamp: new Date().toISOString(), system_id: 'sys-web-prod', username: 'jdoe', event_category: 'interaction', event_action: 'click', payload: { tag: 'BUTTON' } },
      { log_id: '2', timestamp: new Date(Date.now() - 5000).toISOString(), system_id: 'sys-web-prod', username: 'asmith', event_category: 'navigation', event_action: 'pushState', payload: { url: '/dashboard' } },
      { log_id: '3', timestamp: new Date(Date.now() - 15000).toISOString(), system_id: 'sys-desktop-v1', username: 'jdoe', event_category: 'lifecycle', event_action: 'exit', payload: {} },
    ]
  };
};

export const LiveEventStream = () => {
  const { data, isLoading } = useQuery({ queryKey: ['events'], queryFn: fetchEvents, refetchInterval: 5000 });

  const getActionColor = (category: string) => {
    switch (category) {
      case 'interaction': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'navigation': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'lifecycle': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-dark-border flex justify-between items-center bg-slate-800/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Event Stream
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-800/80 text-gray-400 border-b border-dark-border">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">System</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading stream...</td></tr>
            ) : (
              data?.items.map((event: any) => (
                <tr key={event.log_id} className="border-b border-dark-border/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-300">{event.system_id}</td>
                  <td className="px-4 py-3 text-gray-400">{event.username || 'Anonymous'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full border ${getActionColor(event.event_category)}`}>
                      {event.event_action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]" title={JSON.stringify(event.payload)}>
                    {JSON.stringify(event.payload)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
