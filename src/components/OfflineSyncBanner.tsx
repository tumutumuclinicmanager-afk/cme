import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  HardDrive,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { SyncQueueItem, Language } from '../types';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  pendingQueue: SyncQueueItem[];
  onTriggerSync: () => void;
  isSyncing: boolean;
  lastSyncedTimestamp: string | null;
  lang: Language;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  pendingQueue,
  onTriggerSync,
  isSyncing,
  lastSyncedTimestamp,
  lang,
}) => {
  const effectiveOnline = isOnline && !isSimulatedOffline;
  const pendingCount = pendingQueue.length;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 transition-all ${
        !effectiveOnline
          ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
          : pendingCount > 0
          ? 'bg-blue-50/90 border-blue-300 text-blue-950 shadow-xs'
          : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              !effectiveOnline
                ? 'bg-amber-200/80 text-amber-800'
                : pendingCount > 0
                ? 'bg-blue-200/80 text-blue-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {!effectiveOnline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                {!effectiveOnline
                  ? lang === 'fr'
                    ? 'Mode Hors-Ligne Actif'
                    : 'Offline Mode Active'
                  : lang === 'fr'
                  ? 'Connecté au Réseau'
                  : 'Online & Connected'}
              </span>
              {!effectiveOnline && isSimulatedOffline && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold">
                  Simulated
                </span>
              )}
              {effectiveOnline && pendingCount === 0 && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  {lang === 'fr' ? 'Synchronisé' : 'Synced to Server'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600">
              {!effectiveOnline
                ? lang === 'fr'
                  ? 'Vos modules et quiz sont consultables hors-ligne. Votre progression sera automatiquement synchronisée à votre retour en ligne.'
                  : 'Modules & quizzes accessible offline. All slide progression and quiz submissions will automatically sync when you reconnect.'
                : pendingCount > 0
                ? lang === 'fr'
                  ? `${pendingCount} activité(s) hors-ligne en attente de synchronisation avec le serveur.`
                  : `${pendingCount} offline completed activity item(s) pending server synchronization.`
                : lastSyncedTimestamp
                ? `${lang === 'fr' ? 'Dernière synchro réussie' : 'Last synchronized'}: ${lastSyncedTimestamp}`
                : lang === 'fr'
                ? 'Données de progression en temps réel.'
                : 'All learner progress synchronized in real-time.'}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Offline Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isSimulatedOffline
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            {isSimulatedOffline
              ? lang === 'fr'
                ? 'Revenir En Ligne'
                : 'Go Back Online'
              : lang === 'fr'
              ? 'Simuler Hors-Ligne'
              : 'Simulate Offline Mode'}
          </button>

          {/* Sync Button */}
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={onTriggerSync}
              disabled={isSyncing || !effectiveOnline}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                !effectiveOnline
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? lang === 'fr'
                    ? 'Synchronisation...'
                    : 'Syncing...'
                  : lang === 'fr'
                  ? `Synchroniser (${pendingCount})`
                  : `Sync Now (${pendingCount})`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
