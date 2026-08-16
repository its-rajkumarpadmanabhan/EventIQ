import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Clock, MousePointer, Navigation, Power } from 'lucide-react';

const fetchUserTimeline = async (username: string) => {
  // Mock data for immediate frontend preview
  return [
    { log_id: '101', timestamp: new Date().toISOString(), event_category: 'lifecycle', event_action: 'exit', payload: {} },
    { log_id: '102', timestamp: new Date(Date.now() - 2000).toISOString(), event_category: 'interaction', event_action: 'click', payload: { tag: 'BUTTON', textSnippet: 'Submit Order', x: 450, y: 320 } },
    { log_id: '103', timestamp: new Date(Date.now() - 5000).toISOString(), event_category: 'interaction', event_action: 'mousemove', payload: { x: 400, y: 300 } },
    { log_id: '104', timestamp: new Date(Date.now() - 15000).toISOString(), event_category: 'navigation', event_action: 'pushState', payload: { url: '/checkout' } },
    { log_id: '105', timestamp: new Date(Date.now() - 45000).toISOString(), event_category: 'lifecycle', event_action: 'visible', payload: { url: '/products' } },
  ];
};

export const UserJourneyTimeline = ({ username = 'jdoe' }) => {
  const { data: events, isLoading } = useQuery({ 
    queryKey: ['timeline', username], 
    queryFn: () => fetchUserTimeline(username) 
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIcon = (category: string) => {
    switch(category) {
      case 'interaction': return <MousePointer size={16} className="text-blue-400" />;
      case 'navigation': return <Navigation size={16} className="text-purple-400" />;
      case 'lifecycle': return <Power size={16} className="text-amber-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-dark-border bg-slate-800/50">
        <h2 className="text-lg font-semibold text-white">
          Journey Timeline <span className="text-gray-400 text-sm font-normal ml-2">({username})</span>
        </h2>
      </div>
      
      <div className="p-6 overflow-y-auto max-h-[600px]">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading timeline...</p>
        ) : (
          <div className="relative border-l border-dark-border ml-3 space-y-6">
            {events?.map((event: any, idx: number) => (
              <div key={event.log_id} className="relative pl-6">
                {/* Timeline dot */}
                <div className="absolute -left-[17px] top-1 bg-dark-bg border-2 border-slate-600 rounded-full p-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10">
                  {getIcon(event.event_category)}
                </div>
                
                {/* Content Card */}
                <div 
                  className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-700/40 transition-colors"
                  onClick={() => setExpandedId(expandedId === event.log_id ? null : event.log_id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-200 font-medium capitalize">{event.event_action}</span>
                      <span className="text-gray-500 text-xs ml-3 bg-slate-900/50 px-2 py-0.5 rounded">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {expandedId === event.log_id ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  </div>
                  
                  {/* Expanded JSON Details */}
                  {expandedId === event.log_id && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <pre className="text-xs text-green-400 font-mono bg-slate-900/80 p-3 rounded overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
