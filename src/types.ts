export type Language = 'en' | 'fr';

export type MedicalSpecialty =
  | 'Cardiology'
  | 'Pediatrics'
  | 'Infectious Diseases'
  | 'Emergency Medicine'
  | 'Oncology'
  | 'Obstetrics & Gynecology'
  | 'Neurology'
  | 'General Surgery';

export interface SlideImageAnnotation {
  id: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  label: string;
  description: string;
}

export interface SlideImage {
  url: string;
  thumbnailUrl?: string;
  caption: string;
  modality: 'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'Histology' | 'ECG' | 'Clinical Photo';
  annotations?: SlideImageAnnotation[];
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  contentBullets: string[];
  speakerNotes: string;
  clinicalTakeaway: string;
  imageUrl?: string;
  imageDetails?: SlideImage;
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
}

export interface QuizQuestion {
  id: string;
  vignette: string;
  options: string[];
  correctAnswerIndex: number;
  rationale: string;
  referenceGuideline?: string;
}

export interface Presentation {
  id: string;
  title: string;
  titleFr?: string;
  specialty: MedicalSpecialty;
  cmeCredits: number;
  estimatedMinutes: number;
  facultyAuthor: string;
  institution: string;
  summary: string;
  summaryFr?: string;
  learningObjectives: string[];
  learningObjectivesFr?: string[];
  slides: PresentationSlide[];
  quiz: QuizQuestion[];
  isFree: boolean;
  priceKes: number; // e.g. 500 KES
  publishedDate: string;
  thumbnailUrl: string;
  level: 'Core' | 'Advanced' | 'Specialist';
  sourceFileName?: string;
  sourceFileType?: 'ms-powerpoint' | 'wps-presentation' | 'generic-ppt' | 'manual';
  sourceFileSize?: number;
  sourceFileBlobUrl?: string;
}

export interface QuizAttempt {
  presentationId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  attemptDate: string;
  userAnswers: number[];
}

export interface UserProgress {
  presentationId: string;
  completedSlides: number[];
  isSlideDeckCompleted: boolean;
  quizAttempt?: QuizAttempt;
  certificateIssued: boolean;
  certificateId?: string;
  issuedDate?: string;
  lastViewedDate: string;
  isOfflinePendingSync?: boolean;
  syncedAt?: string;
}

export interface MPesaPayment {
  id: string;
  transactionCode: string;
  presentationId: string;
  presentationTitle: string;
  phoneNumber: string;
  amountKes: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
  merchantRequestId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string; // e.g. "Dr. Bonny - Clinic Manager"
  email: string;
  medicalLicenseNumber: string;
  hospitalAffiliation: string;
  language: Language;
  unlockedPresentationIds: string[];
  areasOfInterest: MedicalSpecialty[];
  cmePoints?: number;
  unlockedBadges?: string[];
}

export interface SyncQueueItem {
  id: string;
  presentationId: string;
  presentationTitle: string;
  completedSlides: number[];
  isSlideDeckCompleted: boolean;
  quizAttempt?: QuizAttempt;
  timestamp: string;
  status: 'pending' | 'synced';
  syncedAt?: string;
}

export interface RecommendationItem {
  presentation: Presentation;
  relevanceScore: number; // 0 - 100%
  reason: string;
  reasonFr: string;
  badgeType: 'interest' | 'weakness' | 'next_track' | 'high_cme' | 'popular';
  badgeLabel: string;
  badgeLabelFr: string;
}

export interface GamificationBadge {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  iconName: string;
  category: 'milestone' | 'specialty' | 'excellence' | 'offline';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked: boolean;
  unlockedDate?: string;
  progressPercent: number; // 0 - 100
  criteria: string;
  criteriaFr: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  title: string;
  hospitalAffiliation: string;
  points: number;
  cmeCredits: number;
  badgesCount: number;
  specialty: string;
  isCurrentUser?: boolean;
  avatarUrl?: string;
}

export interface GlobalAnalytics {
  totalLearners: number;
  totalCompletions: number;
  totalCmeCreditsAwarded: number;
  totalRevenueKes: number;
  averageQuizScorePercent: number;
}
