
import React from 'react';
// FIX: Corrected import path for types
import type { WeightUnit } from '../types';
import { palettes } from '../constants/palettes';

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
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme, unit, setUnit, palette, setPalette, onLogout, isGoogleFitConnected, onConnectGoogleFit, onDisconnectGoogleFit }) => {
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
                  <h4 className="font-semibold text-lg mb-3">Color Palette</h4>
                  <p className="text-text-muted mb-3 text-sm">Choose your favorite color scheme.</p>
                  <div className="flex flex-wrap gap-4">
                      {palettes.map(p => (
                          <button
                              key={p.name}
                              onClick={() => setPalette(p.name)}
                              className={`p-2 rounded-lg border-2 transition-all ${palette === p.name ? 'border-primary' : 'border-transparent hover:border-border'}`}
                          >
                              <div className="flex items-center gap-3">
                                  <div className="flex -space-x-2">
                                      <div className="w-6 h-6 rounded-full border-2 border-bg-muted" style={{ backgroundColor: `rgb(${p[theme]['primary']})` }}></div>
                                      <div className="w-6 h-6 rounded-full border-2 border-bg-muted" style={{ backgroundColor: `rgb(${p[theme]['accent']})` }}></div>
                                  </div>
                                  <span className="font-semibold pr-2">{p.name}</span>
                              </div>
                          </button>
                      ))}
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
                <h4 className="font-semibold text-lg mb-3">Integrations</h4>
                <p className="text-text-muted mb-3 text-sm">Connect your accounts to sync data automatically.</p>
                <div className="bg-bg-subtle p-4 rounded-lg flex justify-between items-center">
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
                        <button onClick={onConnectGoogleFit} className="bg-primary hover:opacity-90 text-primary-content font-bold py-2 px-4 rounded-lg transition-colors">
                            Connect
                        </button>
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
