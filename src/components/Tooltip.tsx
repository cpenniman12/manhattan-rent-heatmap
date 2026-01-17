import { TooltipData } from '../types';
import { formatCurrency } from '../utils';
import { Home, Users } from 'lucide-react';

interface TooltipProps {
  data: TooltipData;
}

const Tooltip = ({ data }: TooltipProps) => {
  const { x, y, avgRent, count } = data;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: x + 10,
        top: y - 10,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 min-w-[180px]">
        <div className="space-y-2">
          {/* Average Rent */}
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(avgRent)}
              </div>
              <div className="text-xs text-gray-500">avg monthly rent</div>
            </div>
          </div>

          {/* Listing Count */}
          <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
            <Users className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                {count} {count === 1 ? 'listing' : 'listings'}
              </div>
              <div className="text-xs text-gray-500">in this area</div>
            </div>
          </div>
        </div>

        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="border-4 border-transparent border-t-white"></div>
          <div className="border-4 border-transparent border-t-gray-200 -mt-1"></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip; 