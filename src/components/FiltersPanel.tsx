import { Bed, Loader2 } from 'lucide-react';
import { Filters } from '../types';
import clsx from 'clsx';

interface FiltersPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isLoading: boolean;
}

const BEDROOM_OPTIONS = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1 Bed' },
  { value: 2, label: '2 Bed' },
  { value: 3, label: '3 Bed' },
  { value: 4, label: '4+ Bed' },
];

const FiltersPanel = ({ 
  filters, 
  onFiltersChange, 
  isLoading 
}: FiltersPanelProps) => {
  const handleBedroomChange = (bedrooms: number) => {
    onFiltersChange({ ...filters, bedrooms });
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Bed className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {isLoading && (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          )}
        </div>

        {/* Bedroom Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Bedrooms
          </label>
          <div className="grid grid-cols-2 gap-2">
            {BEDROOM_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBedroomChange(option.value)}
                disabled={isLoading}
                className={clsx(
                  'px-3 py-2 text-sm font-medium rounded-md border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  filters.bedrooms === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Placeholder for future filters */}
        <div className="pt-4 border-t border-gray-100">
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Coming Soon</h3>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Price range filter</li>
                <li>• Neighborhood selection</li>
                <li>• Property type filter</li>
                <li>• Amenities filter</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel; 