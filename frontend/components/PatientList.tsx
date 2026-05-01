'use client';

import { useState, useEffect } from 'react';

interface Session {
  id: number;
  patient_id: string;
  exercise_name: string;
  reps: number;
  pain_score: number;
  timestamp: string;
  synced: boolean;
  flagged: boolean;
}

interface Patient {
  id: string;
  name: string;
  lastSession?: Session;
  totalSessions: number;
  averagePainScore: number;
}

interface PatientListProps {
  patients: Patient[];
  onPatientSelect: (patientId: string) => void;
  selectedPatientId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PatientList({ patients, onPatientSelect, selectedPatientId }: PatientListProps) {
  const [flaggingSession, setFlaggingSession] = useState<number | null>(null);

  const handleFlagSession = async (sessionId: number, currentlyFlagged: boolean) => {
    setFlaggingSession(sessionId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionId}/flag?flagged=${!currentlyFlagged}`,
        {
          method: 'PATCH',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to flag session');
      }

      // Refresh the page to show updated flag status
      window.location.reload();
    } catch (error) {
      console.error('Error flagging session:', error);
      alert('Failed to flag session. Please try again.');
    } finally {
      setFlaggingSession(null);
    }
  };

  const getPainScoreColor = (score: number): string => {
    if (score <= 2) return 'text-green-600 bg-green-50';
    if (score === 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPainScoreEmoji = (score: number): string => {
    const emojis = ['😊', '🙂', '😐', '😣', '😫'];
    return emojis[score - 1] || '😐';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">No patients found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Patient List ({patients.length})
      </h2>

      {patients.map((patient) => (
        <div
          key={patient.id}
          className={`bg-white rounded-lg shadow-lg p-4 cursor-pointer transition-all ${
            selectedPatientId === patient.id
              ? 'ring-2 ring-blue-500 shadow-xl'
              : 'hover:shadow-xl'
          }`}
          onClick={() => onPatientSelect(patient.id)}
        >
          {/* Patient Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{patient.name}</h3>
              <p className="text-sm text-gray-500">ID: {patient.id}</p>
            </div>
            
            {patient.lastSession && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlagSession(
                    patient.lastSession!.id,
                    patient.lastSession!.flagged
                  );
                }}
                disabled={flaggingSession === patient.lastSession.id}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                  patient.lastSession.flagged
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {flaggingSession === patient.lastSession.id ? (
                  '⏳'
                ) : patient.lastSession.flagged ? (
                  '🚩 Flagged'
                ) : (
                  '🏳️ Flag'
                )}
              </button>
            )}
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Sessions</p>
              <p className="text-xl font-bold text-gray-800">{patient.totalSessions}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Avg Pain Score</p>
              <p className={`text-xl font-bold ${getPainScoreColor(patient.averagePainScore).split(' ')[0]}`}>
                {patient.averagePainScore.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Last Session Info */}
          {patient.lastSession ? (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">Last Session</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPainScoreEmoji(patient.lastSession.pain_score)}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {patient.lastSession.exercise_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {patient.lastSession.reps} reps • Pain: {patient.lastSession.pain_score}/5
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(patient.lastSession.timestamp)}
                </p>
              </div>
            </div>
          ) : (
            <div className="border-t pt-3">
              <p className="text-sm text-gray-400 italic">No sessions yet</p>
            </div>
          )}

          {/* Alert for high pain scores */}
          {patient.lastSession && patient.lastSession.pain_score >= 4 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-semibold">
                ⚠️ High pain level reported - Consider follow-up
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
