
import React from 'react';
// FIX: Correcting import path for types
import type { DailyChecklistItem } from '../types';
import Icon from './common/Icon';

interface DailyChecklistProps {
  items: DailyChecklistItem[];
  onToggleItem: (itemId: string) => void;
}

const DailyChecklist: React.FC<DailyChecklistProps> = ({ items, onToggleItem }) => {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
      <h3 className="font-bold mb-3 text-lg">Daily Checklist</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onToggleItem(item.id)}
            className="flex items-center p-2 rounded-md cursor-pointer bg-neutral-200/50 dark:bg-neutral-800/50"
          >
            <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center mr-3 flex-shrink-0 ${item.completed ? 'bg-neutral-800 dark:bg-neutral-200 border-neutral-800 dark:border-neutral-200' : 'border-neutral-400'}`}>
              {item.completed && <Icon name="check" className="w-4 h-4 text-white dark:text-black" />}
            </div>
            <span className={`flex-grow ${item.completed ? 'line-through text-neutral-500' : ''}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChecklist;
