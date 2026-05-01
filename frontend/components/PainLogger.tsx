'use client';

import { useState } from 'react';

interface PainLoggerProps {
  onSubmit: (reps: number, painScore: number) => void;
  targetReps?: number;
}

const painLevels = [
  { score: 1, emoji: '😊', label: 'No Pain', color: 'bg-green-500 hover:bg-green-600' },
  { score: 2, emoji: '🙂', label: 'Mild', color: 'bg-lime-500 hover:bg-lime-600' },
  { score: 3, emoji: '😐', label: 'Moderate', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { score: 4, emoji: '😣', label: 'Severe', color: 'bg-orange-500 hover:bg-orange-600' },
  { score: 5, emoji: '😫', label: 'Very Severe', color: 'bg-red-500 hover:bg-red-600' },
];

export default function PainLogger({ onSubmit, targetReps = 10 }: PainLoggerProps) {
  const [reps, setReps] = useState<string>('');
  const [painScore, setPainScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const repsNum = parseInt(reps, 10);

    // Validation
    if (!reps || isNaN(repsNum) || repsNum <= 0) {
      alert('Please enter a valid number of repetitions');
      return;
    }

    if (painScore === null) {
      alert('Please select your pain level');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(repsNum, painScore);
      
      // Reset form after successful submission
      setReps('');
      setPainScore(null);
    } catch (error) {
      console.error('Error submitting session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick rep buttons for common values
  const quickReps = [5, 10, 15, 20];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Log Your Session
      </h3>

      {/* Reps Input Section */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          How many repetitions did you complete?
        </label>
        
        {/* Quick selection buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {quickReps.map((num) => (
            <button
              key={num}
              onClick={() => setReps(num.toString())}
              className={`py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                reps === num.toString()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Or enter number"
          min="1"
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        
        {targetReps && reps && parseInt(reps) > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {parseInt(reps) >= targetReps ? (
              <span className="text-green-600 font-semibold">
                ✓ Great! You reached your target of {targetReps} reps
              </span>
            ) : (
              <span className="text-orange-600">
                Target: {targetReps} reps ({targetReps - parseInt(reps)} more to go)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Pain Score Section */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-3">
          How much pain did you feel?
        </label>
        
        <div className="grid grid-cols-1 gap-2">
          {painLevels.map((level) => (
            <button
              key={level.score}
              onClick={() => setPainScore(level.score)}
              className={`${level.color} ${
                painScore === level.score
                  ? 'ring-4 ring-blue-400 scale-105'
                  : ''
              } text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 flex items-center justify-between`}
            >
              <span className="flex items-center gap-3">
                <span className="text-3xl">{level.emoji}</span>
                <span className="text-lg">{level.label}</span>
              </span>
              <span className="text-2xl font-bold">{level.score}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !reps || painScore === null}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>✓</span>
            <span>Save Session</span>
          </>
        )}
      </button>

      {/* Info message */}
      <p className="mt-4 text-sm text-gray-500 text-center">
        Your session will be saved {navigator.onLine ? 'immediately' : 'when you go back online'}
      </p>
    </div>
  );
}
