import React from 'react';
import Dashboard from './components/Dashboard';
import { GeminiIcon } from './components/Icons';

const App: React.FC = () => {
  return (
    <main className="bg-background text-on-background font-sans p-4 lg:p-6">
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container text-on-primary-container flex items-center justify-center rounded-full">
                <GeminiIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-medium text-on-surface">
              Gemini Balance
              <span className="font-normal text-on-surface-variant"> - Monitoring Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Refresh" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-on-surface-variant">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.69v4.992h4.992" />
              </svg>
            </button>
            <button aria-label="More options" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-on-surface-variant">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>
        </header>
        <Dashboard />
      </div>
    </main>
  );
};

export default App;
