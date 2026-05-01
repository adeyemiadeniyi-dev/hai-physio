'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PatientList from '@/components/PatientList';
import PainChart from '@/components/PainChart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Hardcoded patients for MVP
const PATIENTS = [
  { id: 'p1', name: 'Maria' },
];

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

export default function ClinicianPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p1');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadPatientData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientSessions(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatientData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const patientDataPromises = PATIENTS.map(async (patient) => {
        try {
          const response = await fetch(`${API_BASE_URL}/sessions/${patient.id}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch sessions for ${patient.name}`);
          }

          const sessions: Session[] = await response.json();

          if (sessions.length === 0) {
            return {
              ...patient,
              totalSessions: 0,
              averagePainScore: 0,
            };
          }

          const totalPainScore = sessions.reduce((sum, s) => sum + s.pain_score, 0);
          const averagePainScore = totalPainScore / sessions.length;

          return {
            ...patient,
            lastSession: sessions[0], // Sessions are ordered by timestamp DESC
            totalSessions: sessions.length,
            averagePainScore,
          };
        } catch (err) {
          console.error(`Error loading data for ${patient.name}:`, err);
          return {
            ...patient,
            totalSessions: 0,
            averagePainScore: 0,
          };
        }
      });

      const patientData = await Promise.all(patientDataPromises);
      setPatients(patientData);
    } catch (err) {
      console.error('Error loading patient data:', err);
      setError('Failed to load patient data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientSessions = async (patientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${patientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data: Session[] = await response.json();
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setSessions([]);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleRefresh = () => {
    loadPatientData();
    if (selectedPatientId) {
      loadPatientSessions(selectedPatientId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-green-600 hover:text-green-700 text-sm font-semibold">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 mt-1">
                Clinician Dashboard
              </h1>
            </div>
            
            <button
              onClick={handleRefresh}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-600">Loading patient data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient List */}
            <div className="lg:col-span-1">
              <PatientList
                patients={patients}
                onPatientSelect={handlePatientSelect}
                selectedPatientId={selectedPatientId}
              />
            </div>

            {/* Right Column - Pain Chart and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Patient Info */}
              {selectedPatientId && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {patients.find(p => p.id === selectedPatientId)?.name || 'Patient'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Patient ID: {selectedPatientId}
                  </p>
                  
                  {sessions.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Total Sessions</p>
                        <p className="text-2xl font-bold text-blue-700">{sessions.length}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-semibold mb-1">Avg Pain</p>
                        <p className="text-2xl font-bold text-green-700">
                          {(sessions.reduce((sum, s) => sum + s.pain_score, 0) / sessions.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-semibold mb-1">Avg Reps</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {Math.round(sessions.reduce((sum, s) => sum + s.reps, 0) / sessions.length)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-center">No sessions recorded yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pain Chart */}
              <PainChart sessions={sessions} />

              {/* Recent Sessions List */}
              {sessions.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Sessions</h3>
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border-2 ${
                          session.flagged
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {session.exercise_name}
                          </span>
                          {session.flagged && (
                            <span className="text-red-600 text-sm font-semibold">
                              🚩 Flagged
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Reps:</span>
                            <span className="ml-1 font-semibold">{session.reps}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pain:</span>
                            <span className={`ml-1 font-semibold ${
                              session.pain_score >= 4 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {session.pain_score}/5
                            </span>
                          </div>
                          <div className="text-right text-gray-500">
                            {new Date(session.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions for Demo */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">📋 Demo Instructions</h3>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li>• Patient sessions are displayed in real-time</li>
            <li>• Click on a patient to view their detailed pain trend</li>
            <li>• Flag sessions with high pain scores for follow-up</li>
            <li>• Red indicators show pain scores ≥ 4 (requires attention)</li>
            <li>• Chart shows pain progression over time</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
