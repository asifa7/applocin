

import React, { useState } from 'react';
// FIX: Corrected import path for types
import type { WeightUnit } from '../types';
import { palettes } from '../constants/palettes';
import Icon from './common/Icon';

interface SettingsProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  palette: string;
  setPalette: (palette: string) => void;
  onLogout: () => void;
  isGoogleFitConnected: boolean;
  onConnectGoogleFit: () => void;
  onDisconnectGoogleFit: () => void;
  googleClientId: string | null;
  setGoogleClientId: (id: string | null) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    theme, setTheme, unit, setUnit, palette, setPalette, onLogout, 
    isGoogleFitConnected, onConnectGoogleFit, onDisconnectGoogleFit,
    googleClientId, setGoogleClientId
}) => {
  const [localClientId, setLocalClientId] = useState(googleClientId || '');

  const handleSaveClientId = () => {
      if (localClientId.trim()) {
          setGoogleClientId(localClientId.trim());
          alert('Client ID Saved!');
      } else {
          setGoogleClientId(null);
          alert('Client ID Cleared!');
      }
  };


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>

      <div className="bg-bg-muted p-6 rounded-lg">
          <div className="space-y-8">
              <div>
                  <h4 className="font-semibold text-lg mb-3">Appearance</h4>
                  <p className="text-text-muted mb-3 text-sm">Choose your preferred theme.</p>
                  <div className="flex space-x-4">
                      <button onClick={() => setTheme('light')} className={`flex-1 p-3 rounded-md text-center font-semibold transition-all ${theme === 'light' ? 'bg-primary text-primary-content ring-2 ring-offset-2 ring-offset-bg-muted ring-primary' : 'bg-bg-subtle hover:bg-border'}`}>
                          <i className="fas fa-sun mr-2"></i> Light
                      </button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 p-3 rounded-md text-center font-semibold transition-all ${theme === 'dark' ? 'bg-primary text-primary-content ring-2 ring-offset-2 ring-offset-bg-muted ring-primary' : 'bg-bg-subtle hover:bg-border'}`}>
                          <i className="fas fa-moon mr-2"></i> Dark
                      </button>
                  </div>
              </div>

              <div className="pt-8 border-t border-border">
                  <h4 className="font-semibold text-lg mb-3">Units</h4>
                  <p className="text-text-muted mb-3 text-sm">Select your preferred unit for weight.</p>
                  <div className="flex space-x-4">
                      <button onClick={() => setUnit('kg')} className={`flex-1 p-3 rounded-md text-center font-semibold transition-all ${unit === 'kg' ? 'bg-primary text-primary-content ring-2 ring-offset-2 ring-offset-bg-muted ring-primary' : 'bg-bg-subtle hover:bg-border'}`}>
                          Kilograms (kg)
                      </button>
                      <button onClick={() => setUnit('lbs')} className={`flex-1 p-3 rounded-md text-center font-semibold transition-all ${unit === 'lbs' ? 'bg-primary text-primary-content ring-2 ring-offset-2 ring-offset-bg-muted ring-primary' : 'bg-bg-subtle hover:bg-border'}`}>
                          Pounds (lbs)
                      </button>
                  </div>
              </div>

               <div className="pt-8 border-t border-border">
                  <h4 className="font-semibold text-lg mb-3">API Configuration</h4>
                  <p className="text-text-muted mb-3 text-sm">To use Google Fit, you must provide your own OAuth 2.0 Client ID from the Google Cloud Console.</p>
                  <div className="space-y-2">
                      <label htmlFor="google-client-id" className="text-sm font-medium text-text-muted">Google Client ID</label>
                      <div className="flex gap-2">
                          <input
                              id="google-client-id"
                              type="text"
                              value={localClientId}
                              onChange={(e) => setLocalClientId(e.target.value)}
                              placeholder="xxxxxxxx.apps.googleusercontent.com"
                              className="w-full bg-bg-subtle rounded-md py-2 px-3 border-transparent focus:ring-2 focus:ring-primary"
                          />
                          <button onClick={handleSaveClientId} className="bg-primary hover:opacity-90 text-primary-content font-bold py-2 px-4 rounded-lg transition-colors">
                              Save
                          </button>
                      </div>
                  </div>
              </div>

              <div className="pt-8 border-t border-border">
                <h4 className="font-semibold text-lg mb-3">Integrations</h4>
                <div className="bg-bg-subtle p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-semibold text-base">Google Fit</h5>
                            <p className="text-sm text-text-muted">
                                {isGoogleFitConnected ? 'Step count is being synced' : 'Not Connected'}
                            </p>
                        </div>
                        {isGoogleFitConnected ? (
                            <button onClick={onDisconnectGoogleFit} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-2 px-4 rounded-lg transition-colors">
                                Disconnect
                            </button>
                        ) : (
                            <button 
                                onClick={onConnectGoogleFit} 
                                disabled={!googleClientId}
                                className="bg-primary hover:opacity-90 text-primary-content font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-bg-subtle disabled:text-text-muted disabled:cursor-not-allowed"
                            >
                                Connect
                            </button>
                        )}
                    </div>
                    {!googleClientId && !isGoogleFitConnected && (
                        <p className="text-xs text-yellow-500 mt-2">
                            A Google Client ID must be saved in 'API Configuration' above to enable Google Fit.
                        </p>
                    )}
                </div>
              </div>

               <div className="pt-8 border-t border-border">
                  <h3 className="text-xl font-semibold mb-4">Account</h3>
                  <button
                      onClick={onLogout}
                      className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                      Log Out
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;