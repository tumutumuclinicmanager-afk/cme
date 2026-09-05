import { Presentation, UserProgress, SyncQueueItem, QuizAttempt } from '../types';

const OFFLINE_CACHE_KEY = 'cme_offline_presentations_cache';
const SYNC_QUEUE_KEY = 'cme_offline_sync_queue';
const SYNC_HISTORY_KEY = 'cme_offline_sync_history';

export function getOfflineCachedPresentations(): Presentation[] {
  try {
    const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePresentationOffline(presentation: Presentation): void {
  const current = getOfflineCachedPresentations();
  const existingIndex = current.findIndex((p) => p.id === presentation.id);
  if (existingIndex >= 0) {
    current[existingIndex] = presentation;
  } else {
    current.push(presentation);
  }
  localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(current));
}

export function removePresentationFromOffline(id: string): void {
  const current = getOfflineCachedPresentations().filter((p) => p.id !== id);
  localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(current));
}

export function isPresentationCachedOffline(id: string): boolean {
  return getOfflineCachedPresentations().some((p) => p.id === id);
}

export function getOfflineSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineSyncQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineProgress(
  presentationId: string,
  presentationTitle: string,
  completedSlides: number[],
  isSlideDeckCompleted: boolean,
  quizAttempt?: QuizAttempt
): SyncQueueItem {
  const queue = getOfflineSyncQueue();
  const existingIdx = queue.findIndex((item) => item.presentationId === presentationId);

  const syncItem: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    presentationId,
    presentationTitle,
    completedSlides,
    isSlideDeckCompleted,
    quizAttempt,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = syncItem;
  } else {
    queue.push(syncItem);
  }

  saveOfflineSyncQueue(queue);
  return syncItem;
}

export function getSyncHistory(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendSyncHistory(items: SyncQueueItem[]): void {
  const history = getSyncHistory();
  const updated = [...items, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(updated));
}

export function executeSynchronization(
  currentProgressList: UserProgress[],
  presentations: Presentation[]
): {
  updatedProgressList: UserProgress[];
  syncedCount: number;
  syncedItems: SyncQueueItem[];
} {
  const queue = getOfflineSyncQueue();
  const pendingItems = queue.filter((i) => i.status === 'pending');

  if (pendingItems.length === 0) {
    return {
      updatedProgressList: currentProgressList,
      syncedCount: 0,
      syncedItems: [],
    };
  }

  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const syncedItems: SyncQueueItem[] = [];

  let updatedList = [...currentProgressList];

  pendingItems.forEach((queueItem) => {
    const existingIndex = updatedList.findIndex(
      (p) => p.presentationId === queueItem.presentationId
    );

    const pres = presentations.find((p) => p.id === queueItem.presentationId);
    const certId = `CME-KE-${new Date().getFullYear()}-${queueItem.presentationId.slice(-4).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    if (existingIndex >= 0) {
      const existing = updatedList[existingIndex];
      const mergedCompletedSlides = Array.from(
        new Set([...existing.completedSlides, ...queueItem.completedSlides])
      );
      const isComplete =
        queueItem.isSlideDeckCompleted ||
        existing.isSlideDeckCompleted ||
        mergedCompletedSlides.length >= (pres?.slides.length || 3);

      const isPassed = queueItem.quizAttempt?.passed || existing.quizAttempt?.passed || false;

      updatedList[existingIndex] = {
        ...existing,
        completedSlides: mergedCompletedSlides,
        isSlideDeckCompleted: isComplete,
        quizAttempt: queueItem.quizAttempt || existing.quizAttempt,
        certificateIssued: isPassed ? true : existing.certificateIssued,
        certificateId: isPassed ? existing.certificateId || certId : existing.certificateId,
        issuedDate: isPassed ? existing.issuedDate || nowStr.split(' ')[0] : existing.issuedDate,
        lastViewedDate: nowStr.split(' ')[0],
        isOfflinePendingSync: false,
        syncedAt: nowStr,
      };
    } else {
      const isPassed = queueItem.quizAttempt?.passed || false;
      updatedList.push({
        presentationId: queueItem.presentationId,
        completedSlides: queueItem.completedSlides,
        isSlideDeckCompleted: queueItem.isSlideDeckCompleted,
        quizAttempt: queueItem.quizAttempt,
        certificateIssued: isPassed,
        certificateId: isPassed ? certId : undefined,
        issuedDate: isPassed ? nowStr.split(' ')[0] : undefined,
        lastViewedDate: nowStr.split(' ')[0],
        isOfflinePendingSync: false,
        syncedAt: nowStr,
      });
    }

    syncedItems.push({
      ...queueItem,
      status: 'synced',
      syncedAt: nowStr,
    });
  });

  // Clear pending queue and save history
  saveOfflineSyncQueue([]);
  appendSyncHistory(syncedItems);

  return {
    updatedProgressList: updatedList,
    syncedCount: syncedItems.length,
    syncedItems,
  };
}
