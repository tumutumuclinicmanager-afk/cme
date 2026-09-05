import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Target,
  GraduationCap,
  HeartPulse,
  Siren,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Flame,
  Footprints,
  HardDriveDownload,
  Info,
} from 'lucide-react';
import {
  GamificationBadge,
  LeaderboardEntry,
  UserProfile,
  Language,
} from '../types';
import { ClinicianTier } from '../utils/gamification';

interface GamificationDashboardProps {
  points: number;
  tier: ClinicianTier;
  badges: GamificationBadge[];
  leaderboard: LeaderboardEntry[];
  userRank: number;
  profile: UserProfile;
  lang: Language;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  points,
  tier,
  badges,
  leaderboard,
  userRank,
  profile,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'points-info'>('leaderboard');
  const [selectedBadge, setSelectedBadge] = useState<GamificationBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  // Calculate percentage within current tier
  const tierProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((points - tier.minPoints) / (tier.maxPoints - tier.minPoints)) * 100
      )
    )
  );

  const getTierColor = (tierName: GamificationBadge['tier']) => {
    switch (tierName) {
      case 'bronze':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'silver':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'gold':
        return 'bg-amber-100 text-amber-900 border-amber-400';
      case 'platinum':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-blue-600' : 'text-slate-400'}`;
    switch (iconName) {
      case 'Footprints':
        return <Footprints className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Siren':
        return <Siren className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'HardDriveDownload':
        return <HardDriveDownload className={className} />;
      case 'Award':
        return <Award className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Banner: Clinician Status & Level Progress */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        {/* Clinician Tier Level Card */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Level {tier.level} • {lang === 'fr' ? tier.titleFr : tier.title}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {points} CME Points
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {profile.name}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'fr'
                ? `Prochain échelon : ${tier.nextTierTitleFr || 'Rang Suprême'} (${tier.maxPoints} pts)`
                : `Next Rank Target: ${tier.nextTierTitle || 'Apex Consultant'} (${tier.maxPoints} pts)`}
            </p>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="w-full lg:w-80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>{lang === 'fr' ? 'Progression du Niveau' : 'Level Progression'}</span>
            <span className="font-mono text-blue-600">{tierProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{tier.minPoints} pts</span>
            <span>{tier.maxPoints} pts</span>
          </div>
        </div>

        {/* Quick Tally Stats */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-around sm:justify-start bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
          <div className="text-center px-2">
            <span className="text-lg font-black text-blue-600 font-mono block">
              #{userRank}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {lang === 'fr' ? 'Rang' : 'Rank'}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-lg font-black text-emerald-600 font-mono block">
              {unlockedCount} / {badges.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {lang === 'fr' ? 'Badges' : 'Badges'}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-lg font-black text-amber-600 font-mono block">
              {points}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {lang === 'fr' ? 'Points' : 'Points'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Classement Général' : 'Clinician Leaderboard'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'badges'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              {lang === 'fr' ? 'Badges & Jalons' : 'Milestone Badges'} ({unlockedCount}/{badges.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('points-info')}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'points-info'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Barème des Points' : 'Point System Rules'}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden md:block">
          {lang === 'fr'
            ? 'Actualisé après chaque module et quiz'
            : 'Live updates upon presentation completion'}
        </span>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-16 text-center">{lang === 'fr' ? 'Rang' : 'Rank'}</th>
                  <th className="py-3 px-4">{lang === 'fr' ? 'Praticien' : 'Clinician'}</th>
                  <th className="py-3 px-4 hidden md:table-cell">{lang === 'fr' ? 'Établissement' : 'Hospital / Affiliation'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'fr' ? 'Crédits FMC' : 'CME Credits'}</th>
                  <th className="py-3 px-4 text-center hidden sm:table-cell">{lang === 'fr' ? 'Badges' : 'Badges'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'fr' ? 'Points FMC' : 'CME Points'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((entry) => {
                  const isCurrent = entry.isCurrentUser;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/70 hover:bg-blue-50 font-semibold'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      {/* Rank Medallion */}
                      <td className="py-3 px-4 text-center">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs border border-amber-300 shadow-2xs">
                            🥇 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs border border-slate-300 shadow-2xs">
                            🥈 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-black text-xs border border-amber-200 shadow-2xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 font-bold">
                            #{entry.rank}
                          </span>
                        )}
                      </td>

                      {/* Name & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {entry.avatarUrl ? (
                            <img
                              src={entry.avatarUrl}
                              alt={entry.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {entry.name.slice(3, 5).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">
                                {entry.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                  {lang === 'fr' ? 'Vous' : 'You'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {entry.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hospital */}
                      <td className="py-3 px-4 hidden md:table-cell text-slate-600 truncate max-w-xs">
                        {entry.hospitalAffiliation}
                      </td>

                      {/* Credits */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                        {entry.cmeCredits.toFixed(1)}
                      </td>

                      {/* Badges */}
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                          <Award className="w-3 h-3 text-amber-500" />
                          {entry.badgesCount}
                        </span>
                      </td>

                      {/* Total Points */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        {entry.points} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONE BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {badges.map((badge) => {
              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    badge.isUnlocked
                      ? 'bg-white border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md'
                      : 'bg-slate-50/70 border-slate-200/80 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          badge.isUnlocked
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-slate-200/60 border border-slate-300'
                        }`}
                      >
                        {renderBadgeIcon(badge.iconName, badge.isUnlocked)}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTierColor(
                          badge.tier
                        )}`}
                      >
                        {badge.tier}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {lang === 'fr' ? badge.titleFr : badge.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {lang === 'fr' ? badge.descriptionFr : badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Unlock Status / Progress */}
                  <div className="pt-2 border-t border-slate-100">
                    {badge.isUnlocked ? (
                      <div className="flex items-center justify-between text-[10px] text-emerald-700 font-medium">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {lang === 'fr' ? 'Débloqué' : 'Unlocked'}
                        </span>
                        {badge.unlockedDate && (
                          <span className="text-slate-400 font-mono">
                            {badge.unlockedDate}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            {badge.progressPercent}%
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {lang === 'fr' ? 'En cours' : 'In progress'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${badge.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: POINT SYSTEM RULES */}
      {activeTab === 'points-info' && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Info className="w-4 h-4 text-blue-600" />
            <span>{lang === 'fr' ? 'Comment Gagner des Points FMC ?' : 'How Are CME Points Awarded?'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-lg font-black text-blue-600 font-mono block">+50 pts</span>
              <h5 className="font-bold text-slate-800">Slide Deck Completion</h5>
              <p className="text-xs text-slate-500">Review all clinical slides, surgical videos, and PACS imaging.</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-lg font-black text-emerald-600 font-mono block">+100 pts</span>
              <h5 className="font-bold text-slate-800">Quiz Passing Score (≥70%)</h5>
              <p className="text-xs text-slate-500">Successfully pass the post-module interactive assessment.</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-lg font-black text-amber-600 font-mono block">+50 pts Bonus</span>
              <h5 className="font-bold text-slate-800">Perfect Score (100%)</h5>
              <p className="text-xs text-slate-500">Diagnostic Ace bonus for answering every vignette correctly on first attempt.</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-lg font-black text-purple-600 font-mono block">+25 pts</span>
              <h5 className="font-bold text-slate-800">Per Correct Question</h5>
              <p className="text-xs text-slate-500">Awarded for each correct multiple-choice clinical rationale.</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-lg font-black text-indigo-600 font-mono block">+30 pts</span>
              <h5 className="font-bold text-slate-800">Offline Study Sync</h5>
              <p className="text-xs text-slate-500">Complete modules offline and synchronize your clinical progress.</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-lg font-black text-blue-600 font-mono block">Rank Up</span>
              <h5 className="font-bold text-slate-800">Climb Leaderboard</h5>
              <p className="text-xs text-slate-500">Advance from Clinical Intern to Resident, Registrar, and Chief Medical Consultant.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
