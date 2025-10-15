import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  glowColor: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, size, strokeWidth, color, glowColor }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // Clamp percentage between 0 and 100 to avoid visual artifacts
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));
    const offset = circumference - (clampedPercentage / 100) * circumference;

    const glowStyle = {
      filter: `drop-shadow(0 0 8px ${glowColor})`,
    };

    return (
        <svg className="transform -rotate-90" width={size} height={size} style={{ overflow: 'visible' }}>
            {/* Background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-bg-subtle"
            />
            {/* Foreground progress */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={glowStyle}
            />
        </svg>
    );
};


interface ActivityRingsProps {
  calorieData: { consumed: number; target: number };
  stepData: { current: number; target: number };
  onClick: (view: 'calories' | 'steps') => void;
}

const ActivityRings: React.FC<ActivityRingsProps> = ({ calorieData, stepData, onClick }) => {
  const caloriePercentage = calorieData.target > 0 ? (calorieData.consumed / calorieData.target) * 100 : 0;
  const stepPercentage = stepData.target > 0 ? (stepData.current / stepData.target) * 100 : 0;

  return (
    <div className="bg-bg-muted p-6 rounded-lg flex flex-col items-center">
      <div className="relative w-60 h-60 mb-6 flex items-center justify-center">
        {/* Outer Ring - Calories */}
        <div className="absolute text-secondary">
           <ProgressRing percentage={caloriePercentage} size={240} strokeWidth={14} color="currentColor" glowColor="currentColor" />
        </div>
        
        {/* Inner Ring - Steps */}
        <div className="absolute text-accent">
          <ProgressRing percentage={stepPercentage} size={190} strokeWidth={14} color="currentColor" glowColor="currentColor" />
        </div>

        <div className="relative w-full h-full rounded-full flex flex-col items-center justify-center text-center">
            <button
                onClick={() => onClick('calories')}
                className="w-full h-1/2 flex flex-col items-center justify-end pb-1 focus:outline-none rounded-t-full"
                aria-label="View detailed calories activity"
            >
                <span className="text-4xl font-bold tracking-tight">{Math.round(calorieData.consumed)}</span>
                <p className="text-text-muted text-sm">kcal</p>
            </button>
            <div className="w-3/5 border-t border-border"></div>
            <button
                onClick={() => onClick('steps')}
                className="w-full h-1/2 flex flex-col items-center justify-start pt-1 focus:outline-none rounded-b-full"
                aria-label="View detailed steps activity"
            >
                <span className="text-4xl font-bold tracking-tight">{stepData.current.toLocaleString()}</span>
                <p className="text-text-muted text-sm">steps</p>
            </button>
        </div>

      </div>
    </div>
  );
};

export default ActivityRings;