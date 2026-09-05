import {
  Presentation,
  UserProgress,
  UserProfile,
  RecommendationItem,
  Language,
} from '../types';
import { specialtyTranslations } from '../translations';

export function generateRecommendations(
  presentations: Presentation[],
  userProgressList: UserProgress[],
  profile: UserProfile,
  lang: Language
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  // Map progress by presentationId
  const progressMap = new Map<string, UserProgress>();
  userProgressList.forEach((p) => progressMap.set(p.presentationId, p));

  // Find quizzes with scores < 80% (knowledge gap / remediation)
  const lowScoreAttempts = userProgressList.filter(
    (p) => p.quizAttempt && p.quizAttempt.score < 80
  );
  const lowScoreSpecialties = new Set<string>();
  lowScoreAttempts.forEach((attempt) => {
    const pres = presentations.find((p) => p.id === attempt.presentationId);
    if (pres) lowScoreSpecialties.add(pres.specialty);
  });

  // Find completed specialties
  const completedSpecialties = new Set<string>();
  userProgressList.forEach((p) => {
    if (p.isSlideDeckCompleted && p.quizAttempt?.passed) {
      const pres = presentations.find((item) => item.id === p.presentationId);
      if (pres) completedSpecialties.add(pres.specialty);
    }
  });

  const userInterests = new Set<string>(profile.areasOfInterest || []);

  presentations.forEach((pres) => {
    const progress = progressMap.get(pres.id);
    const isCompleted = progress?.isSlideDeckCompleted && progress?.quizAttempt?.passed;

    // We don't recommend already passed modules unless there's nothing else
    let score = 50; // base score
    let reasonEn = '';
    let reasonFr = '';
    let badgeType: RecommendationItem['badgeType'] = 'popular';
    let badgeLabelEn = 'Popular CME';
    let badgeLabelFr = 'Module Populaire';

    const specEn = specialtyTranslations[pres.specialty]?.en || pres.specialty;
    const specFr = specialtyTranslations[pres.specialty]?.fr || pres.specialty;

    // Case A: Slide deck completed, but quiz pending!
    if (progress?.isSlideDeckCompleted && (!progress.quizAttempt || !progress.quizAttempt.passed)) {
      score += 48;
      badgeType = 'weakness';
      badgeLabelEn = 'Assessment Pending';
      badgeLabelFr = 'Évaluation en Attente';
      reasonEn = `You reviewed all clinical slides. Take the post-module quiz now to claim ${pres.cmeCredits.toFixed(1)} accredited CME credits.`;
      reasonFr = `Vous avez étudié les diapositives. Passez le quiz interactif pour valider vos ${pres.cmeCredits.toFixed(1)} crédits FMC officiels.`;
    }
    // Case B: Remediation / Low Score in this specialty
    else if (lowScoreSpecialties.has(pres.specialty) && !isCompleted) {
      const relatedAttempt = lowScoreAttempts.find((att) => {
        const p = presentations.find((item) => item.id === att.presentationId);
        return p?.specialty === pres.specialty;
      });
      const prevScore = relatedAttempt?.quizAttempt?.score || 65;

      score += 44;
      badgeType = 'weakness';
      badgeLabelEn = 'Reinforce Mastery';
      badgeLabelFr = 'Renforcer les Acquis';
      reasonEn = `Targeted Knowledge Review: Your previous quiz score in ${specEn} was ${prevScore}%. Master this protocol to solidify diagnostic competence.`;
      reasonFr = `Consolidation Clinique : Votre score précédent en ${specFr} était de ${prevScore} %. Révisez ce protocole pour parfaire votre diagnostic.`;
    }
    // Case C: Stated Area of Interest match
    else if (userInterests.has(pres.specialty) && !isCompleted) {
      score += 38;
      badgeType = 'interest';
      badgeLabelEn = 'Interest Match';
      badgeLabelFr = 'Affinité Spécialité';
      reasonEn = `Recommended directly from your stated clinical focus in ${specEn}.`;
      reasonFr = `Recommandé directement selon vos centres d’intérêt cliniques en ${specFr}.`;
    }
    // Case D: Curriculum Progression (Core -> Advanced)
    else if (completedSpecialties.has(pres.specialty) && !isCompleted) {
      score += 32;
      badgeType = 'next_track';
      badgeLabelEn = 'Next in Track';
      badgeLabelFr = 'Étape Suivante';
      reasonEn = `Curriculum Next Step: You mastered foundational ${specEn}; proceed with this specialized clinical workflow.`;
      reasonFr = `Progression Pédagogique : Vous maîtrisez les bases en ${specFr} ; continuez avec ce protocole approfondi.`;
    }
    // Case E: High CME Credits
    else if (pres.cmeCredits >= 2.0 && !isCompleted) {
      score += 24;
      badgeType = 'high_cme';
      badgeLabelEn = 'High CME Yield';
      badgeLabelFr = 'Forte Valeur FMC';
      reasonEn = `High-yield accredited module: Earn ${pres.cmeCredits.toFixed(1)} CME credits with hands-on diagnostic media and imaging.`;
      reasonFr = `Module à fort rendement : Gagnez ${pres.cmeCredits.toFixed(1)} crédits FMC avec imagerie et cas pratiques commentés.`;
    } else if (!isCompleted) {
      score += 15;
      badgeType = 'popular';
      badgeLabelEn = 'Core Protocol';
      badgeLabelFr = 'Protocole Essentiel';
      reasonEn = `Essential clinical guideline reviewed and endorsed by ${pres.institution}.`;
      reasonFr = `Recommandation clinique essentielle revue et validée par ${pres.institution}.`;
    } else {
      // Completed already
      score = 20;
      badgeType = 'popular';
      badgeLabelEn = 'Completed';
      badgeLabelFr = 'Validé';
      reasonEn = `Completed on ${progress?.issuedDate || progress?.lastViewedDate}. Review to refresh guidelines.`;
      reasonFr = `Validé le ${progress?.issuedDate || progress?.lastViewedDate}. Révisez pour rafraîchir vos connaissances.`;
    }

    // Level weighting: Core modules slightly higher if beginner, Specialist if advanced
    if (pres.level === 'Core') score += 2;
    if (pres.isFree) score += 4;

    recommendations.push({
      presentation: pres,
      relevanceScore: Math.min(99, Math.max(68, score)),
      reason: reasonEn,
      reasonFr: reasonFr,
      badgeType,
      badgeLabel: badgeLabelEn,
      badgeLabelFr: badgeLabelFr,
    });
  });

  // Sort descending by relevanceScore
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Return top 3 recommendations
  return recommendations.slice(0, 3);
}
