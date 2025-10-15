
import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  barColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, barColor = 'bg-neutral-500' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full h-full flex items-end justify-around space-x-2 pt-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center h-full">
          <div className="w-full h-full flex items-end">
             <div
                className={`w-full ${barColor} rounded-t-md transition-all duration-500 ease-out`}
                style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                title={`${item.label}: ${item.value.toLocaleString()}`}
              ></div>
          </div>
          <span className="text-xs font-semibold mt-2 text-neutral-600 dark:text-neutral-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;