import {
  Presentation,
  UserProgress,
  UserProfile,
  GamificationBadge,
  LeaderboardEntry,
  Language,
} from '../types';

export interface ClinicianTier {
  level: number;
  title: string;
  titleFr: string;
  minPoints: number;
  maxPoints: number;
  nextTierTitle?: string;
  nextTierTitleFr?: string;
}

export const CLINICIAN_TIERS: ClinicianTier[] = [
  {
    level: 1,
    title: 'Clinical Intern',
    titleFr: 'Interne en Médecine',
    minPoints: 0,
    maxPoints: 250,
    nextTierTitle: 'Resident Physician',
    nextTierTitleFr: 'Médecin Résident',
  },
  {
    level: 2,
    title: 'Resident Physician',
    titleFr: 'Médecin Résident',
    minPoints: 251,
    maxPoints: 550,
    nextTierTitle: 'Senior Registrar',
    nextTierTitleFr: 'Chef de Clinique',
  },
  {
    level: 3,
    title: 'Senior Registrar',
    titleFr: 'Chef de Clinique',
    minPoints: 551,
    maxPoints: 950,
    nextTierTitle: 'Attending Specialist',
    nextTierTitleFr: 'Praticien Spécialiste',
  },
  {
    level: 4,
    title: 'Attending Specialist',
    titleFr: 'Praticien Spécialiste',
    minPoints: 951,
    maxPoints: 1500,
    nextTierTitle: 'Chief Medical Consultant',
    nextTierTitleFr: 'Médecin Chef Consultant',
  },
  {
    level: 5,
    title: 'Chief Medical Consultant',
    titleFr: 'Médecin Chef Consultant',
    minPoints: 1501,
    maxPoints: 3000,
  },
];

export function getClinicianTier(points: number): ClinicianTier {
  for (let i = CLINICIAN_TIERS.length - 1; i >= 0; i--) {
    if (points >= CLINICIAN_TIERS[i].minPoints) {
      return CLINICIAN_TIERS[i];
    }
  }
  return CLINICIAN_TIERS[0];
}

export function calculateUserPoints(
  userProgressList: UserProgress[],
  presentations: Presentation[]
): number {
  let total = 0;

  userProgressList.forEach((prog) => {
    // 50 points per completed slide deck
    if (prog.isSlideDeckCompleted) {
      total += 50;
    } else {
      total += prog.completedSlides.length * 15;
    }

    // Quiz points
    if (prog.quizAttempt) {
      // 25 points per correct question
      const correctCount = Math.round((prog.quizAttempt.score / 100) * prog.quizAttempt.totalQuestions);
      total += correctCount * 25;

      // Passing bonus
      if (prog.quizAttempt.passed) {
        total += 100;
      }

      // Perfect score bonus
      if (prog.quizAttempt.score === 100) {
        total += 50;
      }
    }

    // Offline completion bonus
    if (prog.syncedAt) {
      total += 30;
    }
  });

  return total;
}

export function evaluateBadges(
  userProgressList: UserProgress[],
  presentations: Presentation[],
  profile: UserProfile
): GamificationBadge[] {
  const completedDecks = userProgressList.filter((p) => p.isSlideDeckCompleted);
  const passedQuizzes = userProgressList.filter((p) => p.quizAttempt?.passed);
  const perfectQuizzes = userProgressList.filter((p) => p.quizAttempt?.score === 100);

  // Cardiology presentations
  const cardioPresIds = presentations.filter((p) => p.specialty === 'Cardiology').map((p) => p.id);
  const cardioPassed = passedQuizzes.filter((p) => cardioPresIds.includes(p.presentationId));

  // Emergency / Trauma presentations
  const emergencyPresIds = presentations.filter((p) => p.specialty === 'Emergency Medicine').map((p) => p.id);
  const emergencyPassed = passedQuizzes.filter((p) => emergencyPresIds.includes(p.presentationId));

  // Total credits
  const totalCredits = userProgressList.reduce((acc, curr) => {
    if (curr.quizAttempt?.passed) {
      const pres = presentations.find((p) => p.id === curr.presentationId);
      return acc + (pres?.cmeCredits || 0);
    }
    return acc;
  }, 0);

  // Offline completed
  const offlineCompleted = userProgressList.filter((p) => p.syncedAt !== undefined);

  return [
    {
      id: 'badge-first-step',
      title: 'First Clinical Step',
      titleFr: 'Premier Pas Clinique',
      description: 'Completed your first clinical PowerPoint slide deck.',
      descriptionFr: 'A validé son premier diaporama clinique interactif.',
      iconName: 'Footprints',
      category: 'milestone',
      tier: 'bronze',
      isUnlocked: completedDecks.length >= 1,
      unlockedDate: completedDecks[0]?.lastViewedDate || '2026-08-28',
      progressPercent: Math.min(100, Math.round((completedDecks.length / 1) * 100)),
      criteria: 'Complete 1 presentation slide deck',
      criteriaFr: 'Terminer 1 diaporama de présentation',
    },
    {
      id: 'badge-diagnostic-ace',
      title: 'Diagnostic Ace',
      titleFr: 'As du Diagnostic',
      description: 'Achieved a perfect 100% score on an accredited post-module clinical quiz.',
      descriptionFr: 'Score parfait de 100 % à une évaluation clinique post-module.',
      iconName: 'Target',
      category: 'excellence',
      tier: 'gold',
      isUnlocked: perfectQuizzes.length >= 1,
      unlockedDate: perfectQuizzes[0]?.quizAttempt?.attemptDate || '2026-08-28',
      progressPercent: Math.min(100, Math.round((perfectQuizzes.length / 1) * 100)),
      criteria: 'Score 100% on any post-module quiz',
      criteriaFr: 'Obtenir 100 % à un quiz de validation',
    },
    {
      id: 'badge-cardio-master',
      title: 'Cardiology Specialist',
      titleFr: 'Spécialiste Cardiologie',
      description: 'Successfully completed the acute coronary syndrome & ECG curriculum.',
      descriptionFr: 'Validation complète du module coronaropathie aiguë et ECG.',
      iconName: 'HeartPulse',
      category: 'specialty',
      tier: 'silver',
      isUnlocked: cardioPassed.length >= 1,
      unlockedDate: cardioPassed[0]?.quizAttempt?.attemptDate || '2026-08-28',
      progressPercent: Math.min(100, Math.round((cardioPassed.length / 1) * 100)),
      criteria: 'Pass Cardiology curriculum assessment',
      criteriaFr: 'Réussir le parcours de cardiologie',
    },
    {
      id: 'badge-acute-care',
      title: 'Acute Care & Trauma Pioneer',
      titleFr: 'Pionnier Urgences & Traumatologie',
      description: 'Mastered emergency ultrasound eFAST and acute resuscitation protocols.',
      descriptionFr: 'Maîtrise de l’échographie d’urgence eFAST et réanimation de choc.',
      iconName: 'Siren',
      category: 'specialty',
      tier: 'gold',
      isUnlocked: emergencyPassed.length >= 1,
      unlockedDate: emergencyPassed[0]?.quizAttempt?.attemptDate,
      progressPercent: Math.min(100, Math.round((emergencyPassed.length / 1) * 100)),
      criteria: 'Pass Emergency Medicine evaluation',
      criteriaFr: 'Réussir l’évaluation de médecine d’urgence',
    },
    {
      id: 'badge-cme-scholar',
      title: 'Continuous Scholar',
      titleFr: 'Praticien Érudit',
      description: 'Accumulated 4.0 or more official CME credit hours.',
      descriptionFr: 'Cumul de 4,0 heures de crédits FMC officiellement accrédités.',
      iconName: 'GraduationCap',
      category: 'milestone',
      tier: 'platinum',
      isUnlocked: totalCredits >= 4.0,
      unlockedDate: totalCredits >= 4.0 ? '2026-09-02' : undefined,
      progressPercent: Math.min(100, Math.round((totalCredits / 4.0) * 100)),
      criteria: 'Earn 4.0+ accredited CME credits',
      criteriaFr: 'Obtenir 4,0+ crédits de formation continue',
    },
    {
      id: 'badge-offline-clinician',
      title: 'Offline Resilient Clinician',
      titleFr: 'Praticien Hors-Ligne Résilient',
      description: 'Downloaded modules and synchronized clinical progress from offline study.',
      descriptionFr: 'A téléchargé et synchronisé sa progression après étude hors-ligne.',
      iconName: 'HardDriveDownload',
      category: 'offline',
      tier: 'silver',
      isUnlocked: offlineCompleted.length >= 1 || (profile.unlockedBadges || []).includes('badge-offline-clinician'),
      unlockedDate: offlineCompleted[0]?.syncedAt,
      progressPercent: offlineCompleted.length >= 1 ? 100 : 0,
      criteria: 'Complete module offline & sync with server',
      criteriaFr: 'Terminer un module hors-ligne et synchroniser',
    },
    {
      id: 'badge-grand-rounds',
      title: 'Grand Rounds Master',
      titleFr: 'Maître des Séances Cliniques',
      description: 'Successfully passed 3 accredited specialty post-module quizzes.',
      descriptionFr: 'A réussi 3 évaluations post-modules dans diverses spécialités.',
      iconName: 'Award',
      category: 'excellence',
      tier: 'gold',
      isUnlocked: passedQuizzes.length >= 3,
      unlockedDate: passedQuizzes.length >= 3 ? passedQuizzes[2]?.quizAttempt?.attemptDate : undefined,
      progressPercent: Math.min(100, Math.round((passedQuizzes.length / 3) * 100)),
      criteria: 'Pass 3 accredited post-module quizzes',
      criteriaFr: 'Valider 3 quiz accrédités',
    },
    {
      id: 'badge-speed-diagnostician',
      title: 'Triple Specialty Scholar',
      titleFr: 'Savoir Pluridisciplinaire',
      description: 'Engaged with presentations across 3 distinct medical disciplines.',
      descriptionFr: 'A étudié des modules dans 3 disciplines médicales distinctes.',
      iconName: 'Sparkles',
      category: 'milestone',
      tier: 'bronze',
      isUnlocked: completedDecks.length >= 2,
      unlockedDate: completedDecks[1]?.lastViewedDate,
      progressPercent: Math.min(100, Math.round((completedDecks.length / 3) * 100)),
      criteria: 'Complete slides in 3 distinct specialties',
      criteriaFr: 'Terminer des diapositives dans 3 spécialités',
    },
  ];
}

const PEER_CLINICIANS: Omit<LeaderboardEntry, 'rank'>[] = [
  {
    id: 'peer-01',
    name: 'Dr. Jane Muthoni, MD, FACC',
    title: 'Consultant Interventional Cardiologist',
    hospitalAffiliation: 'Kenyatta National Hospital (KNH)',
    points: 820,
    cmeCredits: 6.5,
    badgesCount: 6,
    specialty: 'Cardiology',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'peer-02',
    name: 'Dr. Kevin Ochieng, MBChB, FCEM',
    title: 'Head of Emergency Medicine & Trauma',
    hospitalAffiliation: 'Aga Khan University Hospital, Nairobi',
    points: 690,
    cmeCredits: 5.5,
    badgesCount: 5,
    specialty: 'Emergency Medicine',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'peer-03',
    name: 'Dr. Sarah Wanjiku, MMed (Peds)',
    title: 'Consultant Pediatric Pulmonologist',
    hospitalAffiliation: "Gertrude's Children's Hospital",
    points: 540,
    cmeCredits: 4.5,
    badgesCount: 4,
    specialty: 'Pediatrics',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813571-638f02636136?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'peer-04',
    name: 'Dr. Emmanuel Kiprop, MD',
    title: 'Consultant Infectious Disease Physician',
    hospitalAffiliation: 'Moi Teaching & Referral Hospital (MTRH)',
    points: 390,
    cmeCredits: 3.5,
    badgesCount: 3,
    specialty: 'Infectious Diseases',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'peer-05',
    name: 'Dr. Amina Hassan, FWACS',
    title: 'Consultant Obstetrician & Gynecologist',
    hospitalAffiliation: 'Coast General Teaching & Referral Hospital',
    points: 310,
    cmeCredits: 2.5,
    badgesCount: 2,
    specialty: 'Obstetrics & Gynecology',
    avatarUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'peer-06',
    name: 'Dr. Brian Mwangi, MBChB',
    title: 'Clinical Oncology Registrar',
    hospitalAffiliation: 'Texas Cancer Centre, Nairobi',
    points: 230,
    cmeCredits: 2.0,
    badgesCount: 2,
    specialty: 'Oncology',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
  },
];

export function buildLeaderboard(
  currentUserProfile: UserProfile,
  currentUserPoints: number,
  currentUserCredits: number,
  unlockedBadgesCount: number
): { leaderboard: LeaderboardEntry[]; userRank: number } {
  const currentEntry: Omit<LeaderboardEntry, 'rank'> = {
    id: currentUserProfile.id,
    name: currentUserProfile.name,
    title: currentUserProfile.title,
    hospitalAffiliation: currentUserProfile.hospitalAffiliation,
    points: currentUserPoints,
    cmeCredits: currentUserCredits,
    badgesCount: unlockedBadgesCount,
    specialty: 'General Practice / Director',
    isCurrentUser: true,
  };

  const combined = [...PEER_CLINICIANS, currentEntry];

  // Sort by points descending, then credits descending
  combined.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.cmeCredits - a.cmeCredits;
  });

  let userRank = 1;
  const ranked: LeaderboardEntry[] = combined.map((entry, idx) => {
    const rank = idx + 1;
    if (entry.isCurrentUser) {
      userRank = rank;
    }
    return {
      ...entry,
      rank,
    };
  });

  return { leaderboard: ranked, userRank };
}
