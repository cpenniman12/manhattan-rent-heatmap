import { BarChart3, Info } from 'lucide-react';
import { createColorScale, formatCurrency } from '../utils';

interface LegendBarProps {
  data: number[];
}

const LegendBar = ({ data }: LegendBarProps) => {
  const colorScale = createColorScale(data);
  const quartiles = colorScale.quantiles();
  const colors = colorScale.range();

  const getLegendItems = () => {
    const items = [];
    
    for (let i = 0; i < colors.length; i++) {
      const minValue = i === 0 ? Math.min(...data) : quartiles[i - 1];
      const maxValue = i === colors.length - 1 ? Math.max(...data) : quartiles[i];
      
      items.push({
        color: colors[i],
        label: `${formatCurrency(minValue)} - ${formatCurrency(maxValue)}`,
        range: [minValue, maxValue],
      });
    }
    
    return items;
  };

  const legendItems = getLegendItems();
  const totalListings = data.length;

  return (
    <div className="p-6 flex-1">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Price Legend</h2>
        </div>

        {/* Gradient Color Scale - Modern Design */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Heat Map Scale</h3>

          {/* Gradient Bar with refined colors */}
          <div className="relative">
            <div
              className="h-8 rounded-xl shadow-inner border border-gray-200"
              style={{
                background: 'linear-gradient(to right, #0ea5e9, #06b6d4, #14b8a6, #f59e0b, #f97316, #dc2626)'
              }}
            />
            <div className="flex justify-between text-xs font-medium text-gray-700 mt-2">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
                Affordable
              </span>
              <span className="flex items-center gap-1">
                Premium
                <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              </span>
            </div>
          </div>
          
          {/* Price Range Labels */}
          <div className="space-y-1">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 font-medium">
                    {index === 0 ? 'Lowest' : index === legendItems.length - 1 ? 'Highest' : 
                     index === 1 ? 'Low' : index === legendItems.length - 2 ? 'High' : 'Medium'}
                  </span>
                </div>
                <span className="text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics - Modern Cards */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Total Areas</span>
                <span className="text-xl font-bold text-blue-600">{totalListings}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
              <div className="text-xs font-medium text-gray-600 mb-1">Price Range</div>
              <div className="text-sm font-bold text-purple-700">
                {formatCurrency(Math.min(...data))} - {formatCurrency(Math.max(...data))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Average Price</span>
                <span className="text-lg font-bold text-amber-600">
                  {formatCurrency(data.reduce((a, b) => a + b, 0) / data.length)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer - Refined */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start space-x-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-700 leading-relaxed">
              <p className="font-semibold text-blue-900 mb-1.5">ℹ️ Data Notice</p>
              <p className="text-gray-600">
                Aggregated rental data by area. Hover over tiles for detailed pricing and listing counts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegendBar; 