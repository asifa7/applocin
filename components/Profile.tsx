
import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Corrected import path for types
import type { UserProfile, WeightUnit, BodyFatOption, Session } from '../types';
import Icon from './common/Icon';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (value: UserProfile | ((val: UserProfile) => UserProfile)) => void;
  unit: WeightUnit;
  sessions: Session[];
}

const calculateWorkoutStreak = (sessions: Session[]): number => {
    const completedDates = [
        ...new Set(
            sessions
                .filter(s => s.status === 'completed' && s.completedAt)
                .map(s => new Date(s.date).toISOString().split('T')[0])
        ),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (completedDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWorkoutDate = new Date(completedDates[0]);
    lastWorkoutDate.setHours(0,0,0,0);
    lastWorkoutDate.setDate(lastWorkoutDate.getDate() + 1); // Adjust for timezone issues

    if (lastWorkoutDate.getTime() !== today.getTime() && lastWorkoutDate.getTime() !== yesterday.getTime()) {
        return 0;
    }

    let streak = 1;
    for (let i = 1; i < completedDates.length; i++) {
        const currentDate = new Date(completedDates[i-1]);
        const previousDate = new Date(completedDates[i]);
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};


const Profile: React.FC<ProfileProps> = ({ profile, setProfile, unit, sessions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditableProfile(profile);
  }, [profile]);

  const handleSave = () => {
    setProfile({
      ...editableProfile,
      lastUpdated: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableProfile(profile);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditableProfile(prev => ({ ...prev, profileImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof Omit<UserProfile, 'measurements' | 'name' | 'heightUnit' | 'measurementUnit' | 'lastUpdated' | 'onboardingCompleted' | 'goals' | 'bodyFat'>, value: string) => {
    const numValue = parseFloat(value);
    if (value === '') {
        setEditableProfile(prev => ({ ...prev, [field]: 0 }));
    } else if (!isNaN(numValue) && numValue >= 0) {
        setEditableProfile(prev => ({ ...prev, [field]: numValue }));
    }
  };
  
  const handleMeasurementChange = (part: keyof UserProfile['measurements'], value: string) => {
    const numValue = parseFloat(value);
     if (value === '') {
        setEditableProfile(prev => ({ ...prev, measurements: { ...prev.measurements, [part]: 0 }}));
    } else if (!isNaN(numValue) && numValue >= 0) {
        setEditableProfile(prev => ({ ...prev, measurements: { ...prev.measurements, [part]: numValue }}));
    }
  };
  
  const UnitToggle: React.FC<{ unit: 'cm' | 'in', onToggle: (newUnit: 'cm' | 'in') => void }> = ({ unit, onToggle }) => (
    <div className="flex bg-bg-subtle p-1 rounded-lg">
      <button onClick={() => onToggle('cm')} className={`flex-1 py-1 px-3 rounded-md text-sm font-semibold transition-colors ${unit === 'cm' ? 'bg-primary text-primary-content' : ''}`}>cm</button>
      <button onClick={() => onToggle('in')} className={`flex-1 py-1 px-3 rounded-md text-sm font-semibold transition-colors ${unit === 'in' ? 'bg-primary text-primary-content' : ''}`}>in</button>
    </div>
  );

  const measurementFields: { key: keyof UserProfile['measurements']; label: string }[] = [
    { key: 'chest', label: 'Chest' }, { key: 'waist', label: 'Waist' }, { key: 'hips', label: 'Hips' },
    { key: 'leftArm', label: 'Left Arm' }, { key: 'rightArm', label: 'Right Arm' },
    { key: 'leftThigh', label: 'Left Thigh' }, { key: 'rightThigh', label: 'Right Thigh' },
  ];
  
  const renderValue = (value: number | undefined | string, unit = '') => (value ? `${value}${unit}`: '-');

  const totalVolumeLifted = useMemo(() => {
    return sessions
      .filter(s => s.status === 'completed')
      .reduce((total, session) => total + (session.totalVolume || 0), 0);
  }, [sessions]);

  const workoutStreak = useMemo(() => calculateWorkoutStreak(sessions), [sessions]);

  const StatCard: React.FC<{ icon: React.ComponentProps<typeof Icon>['name'], label: string, value: string, colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className="bg-bg-subtle p-4 rounded-lg flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}/20`}>
            <Icon name={icon} className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-text-muted">{label}</p>
        </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                 <h2 className="text-3xl font-bold">My Profile</h2>
                 {profile.lastUpdated && !isEditing && <p className="text-sm text-text-muted">Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}</p>}
            </div>
            {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="bg-primary hover:opacity-90 text-primary-content font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Icon name="edit" /> Edit
            </button>
            )}
        </div>
        
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 bg-bg-muted p-6 rounded-lg">
            <div className="relative">
                <img 
                    src={isEditing ? editableProfile.profileImage : profile.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover bg-bg-subtle border-4 border-bg-base shadow-lg"
                />
                {isEditing && (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-content rounded-full flex items-center justify-center border-2 border-bg-base hover:scale-110 transition-transform">
                        <Icon name="edit" className="w-5 h-5" />
                    </button>
                )}
                 <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>
            {isEditing ? 
                <input type="text" value={editableProfile.name || ''} onChange={(e) => setEditableProfile(p => ({...p, name: e.target.value}))} className="w-full max-w-xs text-center text-2xl font-bold bg-bg-base rounded-md py-2 px-3 border-transparent focus:ring-2 focus:ring-primary" />
                 : <h3 className="text-2xl font-bold">{profile.name}</h3>
            }
        </div>

        {/* Engaging Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon="dumbbell" label="Total Volume Lifted" value={`${(totalVolumeLifted / 1000).toFixed(1)}k ${unit}`} colorClass="text-secondary" />
            <StatCard icon="check" label="Workout Streak" value={`${workoutStreak} Days`} colorClass="text-accent" />
        </div>


        {/* Personal Info & Measurements */}
        <div className="bg-bg-muted p-6 rounded-lg">
            {/* Personal Info */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Age</label>
                {isEditing ? <input type="number" value={editableProfile.age || ''} onChange={(e) => handleInputChange('age', e.target.value)} className="w-full bg-bg-base rounded-md py-2 px-3 border-transparent focus:ring-2 focus:ring-primary" /> : <p className="text-lg font-semibold">{renderValue(profile.age)}</p>}
                </div>
                 <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Weight ({unit})</label>
                {isEditing ? <input type="number" value={editableProfile.weight || ''} onChange={(e) => handleInputChange('weight', e.target.value)} className="w-full bg-bg-base rounded-md py-2 px-3 border-transparent focus:ring-2 focus:ring-primary" /> : <p className="text-lg font-semibold">{renderValue(profile.weight)}</p>}
                </div>
                <div className="col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-1">Height ({isEditing ? editableProfile.heightUnit : profile.heightUnit})</label>
                {isEditing ? <div className="flex gap-2"><input type="number" value={editableProfile.height || ''} onChange={(e) => handleInputChange('height', e.target.value)} className="w-full bg-bg-base rounded-md py-2 px-3 border-transparent focus:ring-2 focus:ring-primary" /> <UnitToggle unit={editableProfile.heightUnit} onToggle={(unit) => setEditableProfile(p => ({...p, heightUnit: unit}))} /></div> : <p className="text-lg font-semibold">{renderValue(profile.height, profile.heightUnit)}</p>}
                </div>
            </div>
            
            {/* Measurements */}
            <div className="border-t border-border my-6"></div>
            <div>
                <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Body Measurements</h4>
                {isEditing && <UnitToggle unit={editableProfile.measurementUnit} onToggle={(unit) => setEditableProfile(p => ({...p, measurementUnit: unit}))} />}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {measurementFields.map(f => (
                    <div key={f.key}>
                    <label className="block text-sm text-text-muted mb-1">{f.label} ({isEditing ? editableProfile.measurementUnit : profile.measurementUnit})</label>
                    {isEditing ? <input type="number" value={editableProfile.measurements[f.key] || ''} onChange={(e) => handleMeasurementChange(f.key, e.target.value)} className="w-full bg-bg-base rounded-md py-2 px-3 border-transparent focus:ring-2 focus:ring-primary" /> : <p className="text-lg font-semibold">{renderValue(profile.measurements[f.key])}</p>}
                    </div>
                ))}
                </div>
            </div>
            {isEditing && (
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={handleCancel} className="bg-bg-subtle hover:bg-border text-text-base font-bold py-3 px-6 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="bg-primary hover:opacity-90 text-primary-content font-bold py-3 px-6 rounded-lg">Save Changes</button>
                    </div>
                )}
        </div>
    </div>
  );
};

export default Profile;
