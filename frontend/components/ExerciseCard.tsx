'use client';

import { useState, useEffect } from 'react';

interface Exercise {
  name: string;
  description: string;
  reps: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [instruction, setInstruction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Fetch coaching instruction on mount
  useEffect(() => {
    fetchCoachingInstruction();
  }, [exercise.name]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const fetchCoachingInstruction = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/coaching/instruction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise_name: exercise.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coaching instruction');
      }

      const data = await response.json();
      setInstruction(data.instruction);
    } catch (err) {
      console.error('Error fetching coaching instruction:', err);
      setError('Could not load AI coaching. Using default instructions.');
      setInstruction(`Perform ${exercise.name}: ${exercise.description}. Complete ${exercise.reps} repetitions slowly and carefully.`);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoiceInstruction = async () => {
    if (!instruction) {
      setError('No instruction available to play');
      return;
    }

    setIsPlaying(true);
    setError('');

    try {
      // Stop any currently playing audio
      if (audio) {
        audio.pause();
        audio.src = '';
      }

      const response = await fetch(`${API_BASE_URL}/coaching/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: instruction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      // Create audio element from base64
      const audioBlob = base64ToBlob(data.audio, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);

      newAudio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onerror = () => {
        setIsPlaying(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
      };

      await newAudio.play();
    } catch (err) {
      console.error('Error playing voice instruction:', err);
      setError('Could not play voice instruction. Please read the text below.');
      setIsPlaying(false);
    }
  };

  const stopVoiceInstruction = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Exercise Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {exercise.name}
        </h2>
        <p className="text-gray-600 text-sm">
          Target: {exercise.reps} repetitions
        </p>
      </div>

      {/* Exercise Description */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-gray-700">{exercise.description}</p>
      </div>

      {/* AI Coaching Instruction */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <span className="mr-2">🤖</span>
          AI Coach Instructions
        </h3>
        
        {isLoading ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 animate-pulse">Loading AI guidance...</p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{instruction}</p>
          </div>
        )}
      </div>

      {/* Voice Control Button */}
      <div className="flex flex-col gap-2">
        {!isPlaying ? (
          <button
            onClick={playVoiceInstruction}
            disabled={isLoading || !instruction}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-2xl">🔊</span>
            <span>Play Voice Instructions</span>
          </button>
        ) : (
          <button
            onClick={stopVoiceInstruction}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-2xl">⏹️</span>
            <span>Stop</span>
          </button>
        )}

        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
