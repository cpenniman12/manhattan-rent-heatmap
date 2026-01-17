import { ReactNode } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { formatLastUpdated } from '../utils';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const lastUpdated = new Date(); // In production, this would come from API

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-sm border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-semibold">Manhattan Rent Heat Map</h1>
                <p className="text-sm text-slate-300">Interactive gradient visualization of apartment prices</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default AppShell; 