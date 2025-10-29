
import React from 'react';
import Icon from './common/Icon';
import type { View } from '../types';

interface MoreProps {
    onViewChange: (view: View) => void;
    onLogout: () => void;
}

const More: React.FC<MoreProps> = ({ onViewChange }) => {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">More</h2>
            <div className="space-y-3">
                <button onClick={() => onViewChange('HISTORY')} className="w-full text-left p-4 rounded-lg flex items-center gap-4 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                    <Icon name="history" className="w-6 h-6 text-primary" />
                     <div>
                        <span className="font-semibold text-lg">History</span>
                        <p className="text-sm text-neutral-500">Review past workouts and activity.</p>
                    </div>
                </button>
                 <button onClick={() => onViewChange('SETTINGS')} className="w-full text-left p-4 rounded-lg flex items-center gap-4 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                    <Icon name="cog" className="w-6 h-6 text-primary" />
                    <div>
                        <span className="font-semibold text-lg">Settings</span>
                        <p className="text-sm text-neutral-500">Update your app preferences and account details.</p>
                    </div>
                </button>
            </div>
        </div>
    );
};
export default More;
