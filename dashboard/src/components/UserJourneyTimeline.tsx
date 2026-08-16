import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Clock, MousePointer, Navigation, Power } from 'lucide-react';

const fetchUserTimeline = async (username: string) => {
  const response = await fetch(`http://localhost:8000/api/v1/analytics/users/${username}/timeline/`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const UserJourneyTimeline = ({ username }: { username?: string }) => {
  const { data: events, isLoading } = useQuery({ 
    queryKey: ['timeline', username], 
    queryFn: () => username ? fetchUserTimeline(username) : Promise.resolve([]),
    enabled: !!username
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
        {!username ? (
          <p className="text-center text-gray-500 py-8">Please enter a username in the search bar to view their journey timeline.</p>
        ) : isLoading ? (
          <p className="text-center text-gray-500">Loading timeline...</p>
        ) : events?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No events found for {username}.</p>
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
