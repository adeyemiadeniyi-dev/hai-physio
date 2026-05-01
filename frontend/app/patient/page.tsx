'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ExerciseCard from '@/components/ExerciseCard';
import PainLogger from '@/components/PainLogger';
import { saveSession } from '@/lib/db';
import { syncPending, setupAutoSync, getSyncStatus } from '@/lib/sync';

// Hardcoded patient and exercise for MVP
const PATIENT = {
  id: 'p1',
  name: 'Maria',
};

const EXERCISE = {
  name: 'Knee Bend',
  description: 'Slowly bend your knee to 90 degrees while standing. Hold for 2 seconds, then straighten.',
  reps: 10,
};

export default function PatientPage() {
  const [sessionSaved, setSessionSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ online: true, pendingCount: 0 });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Setup automatic sync on mount
    setupAutoSync();

    // Check sync status
    updateSyncStatus();

    // Update sync status every 5 seconds
    const interval = setInterval(updateSyncStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateSyncStatus = async () => {
    const status = await getSyncStatus();
    setSyncStatus(status);
  };

  const handleSessionSubmit = async (reps: number, painScore: number) => {
    try {
      // Save to IndexedDB
      await saveSession({
        patient_id: PATIENT.id,
        exercise_name: EXERCISE.name,
        reps,
        pain_score: painScore,
        timestamp: new Date().toISOString(),
        synced: false, // Will be synced later
      });

      console.log('Session saved to IndexedDB');

      // Try to sync immediately if online
      if (navigator.onLine) {
        const syncedCount = await syncPending();
        console.log(`Synced ${syncedCount} session(s)`);
      }

      // Update sync status
      await updateSyncStatus();

      // Show success message
      setShowSuccess(true);
      setSessionSaved(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      // Reset session saved state after 5 seconds
      setTimeout(() => {
        setSessionSaved(false);
      }, 5000);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 mt-1">
              Welcome, {PATIENT.name}!
            </h1>
          </div>
          
          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${syncStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {syncStatus.online ? 'Online' : 'Offline'}
            </span>
            {syncStatus.pendingCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                {syncStatus.pendingCount} pending
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg animate-pulse">
            <p className="text-green-800 font-semibold text-center">
              ✓ Session saved successfully! {syncStatus.online ? 'Synced to cloud.' : 'Will sync when online.'}
            </p>
          </div>
        )}

        {/* Today's Exercise Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Today's Exercise</h2>
          <ExerciseCard exercise={EXERCISE} />
        </div>

        {/* Pain Logger Section */}
        {!sessionSaved ? (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">After Completing</h2>
            <PainLogger onSubmit={handleSessionSubmit} targetReps={EXERCISE.reps} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Great Job!</h3>
            <p className="text-gray-600 mb-4">
              You've completed today's exercise session.
            </p>
            <button
              onClick={() => setSessionSaved(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Log Another Session
            </button>
          </div>
        )}

        {/* Offline Notice */}
        {!syncStatus.online && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <span className="font-semibold">📱 Offline Mode:</span> Your sessions are being saved locally 
              and will automatically sync when you're back online.
            </p>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Exercise Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Listen to the AI voice instructions carefully</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Move slowly and controlled - quality over quantity</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Stop if you feel sharp pain (score 4-5)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Breathe normally throughout the exercise</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
