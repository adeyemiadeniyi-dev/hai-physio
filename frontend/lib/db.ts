import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface HaiPhysioDB extends DBSchema {
  sessions: {
    key: number;
    value: {
      id?: number;
      patient_id: string;
      exercise_name: string;
      reps: number;
      pain_score: number;
      timestamp: string;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean; 'by-patient': string };
  };
}

const DB_NAME = 'hai-physio-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<HaiPhysioDB> | null = null;

/**
 * Open or create the IndexedDB database
 */
export async function openDatabase(): Promise<IDBPDatabase<HaiPhysioDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<HaiPhysioDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create sessions store if it doesn't exist
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        
        // Create indexes for efficient querying
        sessionStore.createIndex('by-synced', 'synced');
        sessionStore.createIndex('by-patient', 'patient_id');
      }
    },
  });

  return dbInstance;
}

/**
 * Save a session to IndexedDB
 */
export async function saveSession(session: {
  patient_id: string;
  exercise_name: string;
  reps: number;
  pain_score: number;
  timestamp?: string;
  synced?: boolean;
}): Promise<number> {
  const db = await openDatabase();
  
  const sessionData = {
    ...session,
    timestamp: session.timestamp || new Date().toISOString(),
    synced: session.synced ?? false,
  };

  const id = await db.add('sessions', sessionData);
  return id;
}

/**
 * Get all pending (unsynced) sessions
 */
export async function getPendingSessions(): Promise<Array<{
  id: number;
  patient_id: string;
  exercise_name: string;
  reps: number;
  pain_score: number;
  timestamp: string;
  synced: boolean;
}>> {
  const db = await openDatabase();
  const index = db.transaction('sessions').store.index('by-synced');
  const sessions = await index.getAll(false);
  return sessions;
}

/**
 * Mark a session as synced
 */
export async function markSynced(id: number): Promise<void> {
  const db = await openDatabase();
  const session = await db.get('sessions', id);
  
  if (session) {
    session.synced = true;
    await db.put('sessions', session);
  }
}

/**
 * Get all sessions for a specific patient
 */
export async function getPatientSessions(patientId: string): Promise<Array<{
  id: number;
  patient_id: string;
  exercise_name: string;
  reps: number;
  pain_score: number;
  timestamp: string;
  synced: boolean;
}>> {
  const db = await openDatabase();
  const index = db.transaction('sessions').store.index('by-patient');
  const sessions = await index.getAll(patientId);
  return sessions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get all sessions (for debugging)
 */
export async function getAllSessions(): Promise<Array<{
  id: number;
  patient_id: string;
  exercise_name: string;
  reps: number;
  pain_score: number;
  timestamp: string;
  synced: boolean;
}>> {
  const db = await openDatabase();
  return await db.getAll('sessions');
}

/**
 * Clear all sessions (for testing/reset)
 */
export async function clearAllSessions(): Promise<void> {
  const db = await openDatabase();
  await db.clear('sessions');
}

/**
 * Delete a specific session
 */
export async function deleteSession(id: number): Promise<void> {
  const db = await openDatabase();
  await db.delete('sessions', id);
}
