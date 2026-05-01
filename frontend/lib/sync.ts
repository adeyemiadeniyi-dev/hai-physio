import { getPendingSessions, markSynced } from './db';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Sync all pending sessions to the backend
 * Returns the number of sessions successfully synced
 */
export async function syncPending(): Promise<number> {
  // Check if we're online
  if (!navigator.onLine) {
    console.log('Device is offline. Skipping sync.');
    return 0;
  }

  try {
    const pendingSessions = await getPendingSessions();
    
    if (pendingSessions.length === 0) {
      console.log('No pending sessions to sync.');
      return 0;
    }

    console.log(`Syncing ${pendingSessions.length} pending session(s)...`);
    
    let syncedCount = 0;

    // Sync each session
    for (const session of pendingSessions) {
      try {
        const response = await fetch(`${API_BASE_URL}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: session.patient_id,
            exercise_name: session.exercise_name,
            reps: session.reps,
            pain_score: session.pain_score,
            timestamp: session.timestamp,
            synced: true,
          }),
        });

        if (response.ok) {
          // Mark as synced in IndexedDB
          await markSynced(session.id);
          syncedCount++;
          console.log(`Session ${session.id} synced successfully.`);
        } else {
          const error = await response.text();
          console.error(`Failed to sync session ${session.id}:`, error);
        }
      } catch (error) {
        console.error(`Error syncing session ${session.id}:`, error);
      }
    }

    console.log(`Successfully synced ${syncedCount} of ${pendingSessions.length} session(s).`);
    return syncedCount;
  } catch (error) {
    console.error('Error during sync:', error);
    return 0;
  }
}

/**
 * Set up automatic sync when the device comes back online
 */
export function setupAutoSync(): void {
  if (typeof window === 'undefined') {
    return; // Skip on server-side
  }

  // Sync when the app loads (if online)
  if (navigator.onLine) {
    syncPending().catch(console.error);
  }

  // Sync when the device comes back online
  window.addEventListener('online', () => {
    console.log('Device is back online. Starting sync...');
    syncPending().catch(console.error);
  });

  // Log when device goes offline
  window.addEventListener('offline', () => {
    console.log('Device is offline. Sessions will be queued for sync.');
  });
}

/**
 * Check if the device is currently online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Get the current sync status
 */
export async function getSyncStatus(): Promise<{
  online: boolean;
  pendingCount: number;
}> {
  const pendingSessions = await getPendingSessions();
  
  return {
    online: isOnline(),
    pendingCount: pendingSessions.length,
  };
}
