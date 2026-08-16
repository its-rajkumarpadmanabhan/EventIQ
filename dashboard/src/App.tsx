import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { MetricsCards } from './components/MetricsCards';
import { FilterBar } from './components/FilterBar';
import { LiveEventStream } from './components/LiveEventStream';
import { UserJourneyTimeline } from './components/UserJourneyTimeline';

const queryClient = new QueryClient();

function App() {
  const [selectedUsername, setSelectedUsername] = useState<string>('');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-dark-bg text-gray-200 font-sans">
        {/* Top Navbar */}
        <header className="bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-brand/20 p-2 rounded-md border border-brand/50">
              <Activity className="text-brand" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Event<span className="text-brand">IQ</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-gray-400">Environment: <span className="text-green-400">Production</span></span>
            <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-[1600px] mx-auto">
          <MetricsCards />
          <FilterBar selectedUsername={selectedUsername} onUsernameChange={setSelectedUsername} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[700px]">
            <div className="xl:col-span-2 h-full">
              <LiveEventStream />
            </div>
            <div className="h-full">
              <UserJourneyTimeline username={selectedUsername} />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
