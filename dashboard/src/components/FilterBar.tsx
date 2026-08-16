import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

export const FilterBar = () => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-400 mb-1">Search User / System</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" 
            placeholder="e.g. jdoe, sys-web-prod" 
          />
        </div>
      </div>
      
      <div className="w-48">
        <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-gray-500" />
          </div>
          <select className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none">
            <option value="">All Categories</option>
            <option value="interaction">Interaction</option>
            <option value="navigation">Navigation</option>
            <option value="lifecycle">Lifecycle</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="w-48">
        <label className="block text-xs font-medium text-gray-400 mb-1">Time Range</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-gray-500" />
          </div>
          <select className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none">
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>
      
      <button className="bg-brand hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
        Apply Filters
      </button>
    </div>
  );
};
