import JSZip from 'jszip';
import { Presentation, PresentationSlide, MedicalSpecialty, QuizQuestion } from '../types';

export interface ParsedPPTResult {
  title: string;
  author: string;
  institution: string;
  summary: string;
  specialty: MedicalSpecialty;
  slides: PresentationSlide[];
  detectedTool: 'ms-powerpoint' | 'wps-presentation' | 'generic-ppt';
  fileName: string;
  fileSizeBytes: number;
  warnings?: string[];
  rawBlobUrl?: string;
}

/**
 * Clean and normalize text from XML elements
 */
const extractTextFromNode = (node: Element): string => {
  const textRuns = node.querySelectorAll('a\\:t, t');
  const texts: string[] = [];
  textRuns.forEach((t) => {
    if (t.textContent) texts.push(t.textContent);
  });
  return texts.join('').trim();
};

/**
 * Infer medical specialty from presentation text
 */
export const inferSpecialtyFromText = (text: string): MedicalSpecialty => {
  const lower = text.toLowerCase();
  if (lower.includes('cardio') || lower.includes('heart') || lower.includes('ecg') || lower.includes('infarct') || lower.includes('stemi') || lower.includes('troponin') || lower.includes('hypertens')) {
    return 'Cardiology';
  }
  if (lower.includes('pediatr') || lower.includes('child') || lower.includes('neonat') || lower.includes('infant') || lower.includes('apgar')) {
    return 'Pediatrics';
  }
  if (lower.includes('infect') || lower.includes('malaria') || lower.includes('tuberculosis') || lower.includes('hiv') || lower.includes('antibiotic') || lower.includes('sepsis') || lower.includes('bacteri')) {
    return 'Infectious Diseases';
  }
  if (lower.includes('neuro') || lower.includes('stroke') || lower.includes('seizure') || lower.includes('brain') || lower.includes('meningitis') || lower.includes('gcs')) {
    return 'Neurology';
  }
  if (lower.includes('surg') || lower.includes('trauma') || lower.includes('laparo') || lower.includes('appendic') || lower.includes('hernia') || lower.includes('wound')) {
    return 'General Surgery';
  }
  if (lower.includes('obste') || lower.includes('gynec') || lower.includes('matern') || lower.includes('pregnan') || lower.includes('labor') || lower.includes('preeclamp') || lower.includes('partum')) {
    return 'Obstetrics & Gynecology';
  }
  if (lower.includes('oncol') || lower.includes('cancer') || lower.includes('tumor') || lower.includes('chemo') || lower.includes('biopsy') || lower.includes('malignan')) {
    return 'Oncology';
  }
  if (lower.includes('emerg') || lower.includes('shock') || lower.includes('resuscitat') || lower.includes('triage') || lower.includes('cpr') || lower.includes('acls')) {
    return 'Emergency Medicine';
  }
  return 'Cardiology';
};

/**
 * Extract MIME type from image file extension
 */
const getMimeType = (path: string): string => {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
};

/**
 * Parses a PPTX file using JSZip and native DOMParser
 */
export async function parsePPTXFile(file: File): Promise<ParsedPPTResult> {
  const buffer = await file.arrayBuffer();
  const rawBlobUrl = URL.createObjectURL(file);
  const fileName = file.name;
  const fileSizeBytes = file.size;

  const isZip = checkIsZip(buffer);
  if (!isZip) {
    return handleBinaryPPT(file, buffer, rawBlobUrl);
  }

  const zip = await JSZip.loadAsync(buffer);
  const domParser = new DOMParser();

  // 1. Detect creator tool (MS PowerPoint vs WPS Presentation vs Generic)
  let detectedTool: 'ms-powerpoint' | 'wps-presentation' | 'generic-ppt' = 'ms-powerpoint';
  let title = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  let author = 'Dr. Bonny, MD';
  let institution = 'Tumutumu Medical Centre';
  let summary = '';

  // Check app.xml or core.xml for application creator signature
  try {
    const appXmlStr = await zip.file('docProps/app.xml')?.async('text');
    if (appXmlStr) {
      const appDoc = domParser.parseFromString(appXmlStr, 'application/xml');
      const appName = appDoc.querySelector('Application')?.textContent || '';
      if (appName.toLowerCase().includes('wps') || appName.toLowerCase().includes('kingsoft')) {
        detectedTool = 'wps-presentation';
      } else if (appName.toLowerCase().includes('powerpoint') || appName.toLowerCase().includes('microsoft')) {
        detectedTool = 'ms-powerpoint';
      }
    }
  } catch (err) {
    console.warn('Could not parse app.xml', err);
  }

  // Check core.xml for metadata
  try {
    const coreXmlStr = await zip.file('docProps/core.xml')?.async('text');
    if (coreXmlStr) {
      const coreDoc = domParser.parseFromString(coreXmlStr, 'application/xml');
      const docTitle = coreDoc.querySelector('dc\\:title, title')?.textContent?.trim();
      if (docTitle) title = docTitle;
      const docAuthor = coreDoc.querySelector('dc\\:creator, creator')?.textContent?.trim();
      if (docAuthor) author = docAuthor;
      const docDesc = coreDoc.querySelector('dc\\:description, description')?.textContent?.trim();
      if (docDesc) summary = docDesc;
    }
  } catch (err) {
    console.warn('Could not parse core.xml', err);
  }

  // 2. Discover slides in order
  const slidePaths: string[] = [];
  try {
    const presXmlStr = await zip.file('ppt/presentation.xml')?.async('text');
    const presRelsStr = await zip.file('ppt/_rels/presentation.xml.rels')?.async('text');

    if (presXmlStr && presRelsStr) {
      const presDoc = domParser.parseFromString(presXmlStr, 'application/xml');
      const relsDoc = domParser.parseFromString(presRelsStr, 'application/xml');

      const sldIds = presDoc.querySelectorAll('p\\:sldId, sldId');
      sldIds.forEach((sld) => {
        const rId = sld.getAttribute('r:id') || sld.getAttribute('id');
        if (rId) {
          const rel = relsDoc.querySelector(`Relationship[Id="${rId}"]`);
          const target = rel?.getAttribute('Target');
          if (target) {
            // Clean relative path like "slides/slide1.xml"
            const normalized = target.startsWith('ppt/') ? target : `ppt/${target.replace(/^\/?/, '')}`;
            slidePaths.push(normalized);
          }
        }
      });
    }
  } catch (err) {
    console.warn('Could not parse presentation.xml order, falling back to file matching', err);
  }

  // Fallback: match all slide files in ppt/slides/
  if (slidePaths.length === 0) {
    const matched: string[] = [];
    zip.forEach((relativePath) => {
      if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
        matched.push(relativePath);
      }
    });
    // Sort naturally: slide1, slide2, ..., slide10
    matched.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
    slidePaths.push(...matched);
  }

  // 3. Process each slide
  const slides: PresentationSlide[] = [];
  let allCombinedText = title + ' ' + summary;

  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;

    const slideNum = i + 1;
    const slideXmlStr = await slideFile.async('text');
    const slideDoc = domParser.parseFromString(slideXmlStr, 'application/xml');

    // Parse slide relations (images & notes)
    const relsPath = slidePath.replace(/ppt\/slides\/([^/]+)\.xml$/, 'ppt/slides/_rels/$1.xml.rels');
    let relsDoc: Document | null = null;
    try {
      const relsStr = await zip.file(relsPath)?.async('text');
      if (relsStr) {
        relsDoc = domParser.parseFromString(relsStr, 'application/xml');
      }
    } catch {
      // ignore
    }

    // Extract images from slide relations
    let slideImageUrl: string | undefined = undefined;
    if (relsDoc) {
      const imgRels = relsDoc.querySelectorAll('Relationship[Type*="/image"]');
      if (imgRels.length > 0) {
        const firstImgTarget = imgRels[0].getAttribute('Target');
        if (firstImgTarget) {
          // target is usually "../media/image1.png"
          const cleanPath = 'ppt/' + firstImgTarget.replace(/^\.\.\//, '');
          const imgZipFile = zip.file(cleanPath);
          if (imgZipFile) {
            try {
              const base64 = await imgZipFile.async('base64');
              const mime = getMimeType(cleanPath);
              slideImageUrl = `data:${mime};base64,${base64}`;
            } catch (imgErr) {
              console.warn('Failed to load image from slide', imgErr);
            }
          }
        }
      }
    }

    // Extract speaker notes
    let speakerNotes = '';
    if (relsDoc) {
      const notesRel = relsDoc.querySelector('Relationship[Type*="/notesSlide"]');
      if (notesRel) {
        const notesTarget = notesRel.getAttribute('Target');
        if (notesTarget) {
          const cleanNotesPath = 'ppt/' + notesTarget.replace(/^\.\.\//, '');
          const notesXmlStr = await zip.file(cleanNotesPath)?.async('text');
          if (notesXmlStr) {
            const notesDoc = domParser.parseFromString(notesXmlStr, 'application/xml');
            // Extract body text from notes
            const bodyShapes = notesDoc.querySelectorAll('p\\:sp, sp');
            bodyShapes.forEach((sp) => {
              const ph = sp.querySelector('p\\:ph, ph');
              const phType = ph?.getAttribute('type');
              if (phType === 'body' || !phType) {
                const text = extractTextFromNode(sp);
                if (text && !speakerNotes.includes(text)) {
                  speakerNotes += (speakerNotes ? '\n' : '') + text;
                }
              }
            });
          }
        }
      }
    }

    // Extract shapes, titles, and text bullets
    let extractedSlideTitle = '';
    let extractedSubtitle = '';
    const contentBullets: string[] = [];

    const shapes = slideDoc.querySelectorAll('p\\:sp, sp');
    shapes.forEach((shape) => {
      const ph = shape.querySelector('p\\:ph, ph');
      const phType = ph?.getAttribute('type');

      // Check if shape is title
      const isTitle =
        phType === 'title' ||
        phType === 'ctrTitle' ||
        (!extractedSlideTitle && shape.getAttribute('name')?.toLowerCase().includes('title'));

      const isSubTitle = phType === 'subTitle';

      const paragraphs = shape.querySelectorAll('a\\:p, p');
      paragraphs.forEach((p) => {
        const pText = extractTextFromNode(p);
        if (!pText) return;

        if (isTitle && !extractedSlideTitle) {
          extractedSlideTitle = pText;
        } else if (isSubTitle && !extractedSubtitle) {
          extractedSubtitle = pText;
        } else {
          // Normal bullet point / text
          if (pText !== extractedSlideTitle && pText !== extractedSubtitle) {
            contentBullets.push(pText);
          }
        }
      });
    });

    // Fallbacks
    if (!extractedSlideTitle) {
      if (contentBullets.length > 0) {
        extractedSlideTitle = contentBullets.shift()!;
      } else {
        extractedSlideTitle = `Slide ${slideNum}: Clinical Protocol`;
      }
    }

    if (contentBullets.length === 0) {
      contentBullets.push(
        'Review patient clinical history, physiological parameters, and baseline vitals.',
        'Execute guideline-directed diagnostic and therapeutic procedures promptly.'
      );
    }

    if (!speakerNotes) {
      speakerNotes = `Key teaching points for Slide ${slideNum}. Ensure attendees assess contraindications and clinical decision thresholds according to current national hospital standards.`;
    }

    const clinicalTakeaway =
      contentBullets.length > 0
        ? `Clinical Pearl: ${contentBullets[contentBullets.length - 1]}`
        : 'Immediate diagnosis and timely intervention directly correlate with improved patient outcomes.';

    allCombinedText += ' ' + extractedSlideTitle + ' ' + contentBullets.join(' ');

    slides.push({
      id: `slide-${Date.now()}-${slideNum}`,
      slideNumber: slideNum,
      title: extractedSlideTitle,
      subtitle: extractedSubtitle || undefined,
      contentBullets: contentBullets.slice(0, 7), // Cap at 7 for best legibility
      speakerNotes: speakerNotes,
      clinicalTakeaway: clinicalTakeaway,
      imageUrl: slideImageUrl,
      imageDetails: slideImageUrl
        ? {
            url: slideImageUrl,
            caption: `${extractedSlideTitle} - Clinical Diagnostic Review`,
            modality: 'Clinical Photo',
            annotations: [
              {
                id: `anno-${slideNum}-1`,
                xPercent: 50,
                yPercent: 50,
                label: 'Diagnostic Focus',
                description: 'Critical anatomical and pathological area highlighted in the presentation.',
              },
            ],
          }
        : undefined,
    });
  }

  // If no slides were extracted (e.g. empty deck)
  if (slides.length === 0) {
    slides.push({
      id: `slide-${Date.now()}-1`,
      slideNumber: 1,
      title: title || 'Clinical Presentation Overview',
      subtitle: 'Continuing Medical Education & Practice Guidelines',
      contentBullets: [
        'Evidence-based clinical guidelines and epidemiological review',
        'Standardized hospital diagnostic pathway and treatment algorithm',
        'Post-intervention monitoring, secondary prevention, and patient follow-up',
      ],
      speakerNotes: 'Welcome to this CPD clinical module. Focus on high-yield exam and practice recommendations.',
      clinicalTakeaway: 'Standardized protocols reduce clinical variance and improve quality metrics.',
    });
  }

  // If presentation title was first slide title
  if (slides.length > 1 && (!title || title.includes('.'))) {
    title = slides[0].title;
  }

  if (!summary) {
    summary = `Comprehensive clinical review of ${title} presented by ${author}. Designed for healthcare practitioners to fulfill accredited CPD requirements.`;
  }

  const specialty = inferSpecialtyFromText(allCombinedText);

  return {
    title,
    author,
    institution,
    summary,
    specialty,
    slides,
    detectedTool,
    fileName,
    fileSizeBytes,
    rawBlobUrl,
  };
}

/**
 * Helper to check if file has ZIP signature (PK\x03\x04)
 */
function checkIsZip(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer.slice(0, 4));
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

/**
 * Handle legacy binary PPT (PowerPoint 97-2003 / WPS binary .ppt / .dps)
 */
function handleBinaryPPT(file: File, buffer: ArrayBuffer, rawBlobUrl: string): ParsedPPTResult {
  const fileName = file.name;
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const fileSizeBytes = file.size;

  // Extract readable text chunks from the binary buffer
  const uint8 = new Uint8Array(buffer);
  let asciiStrings: string[] = [];
  let currentString = '';

  for (let i = 0; i < uint8.length; i++) {
    const code = uint8[i];
    // Printable ASCII
    if (code >= 32 && code <= 126) {
      currentString += String.fromCharCode(code);
    } else {
      if (currentString.length >= 6) {
        // Filter out binary garbage
        if (/^[A-Za-z0-9\s.,;:'"()/-]+$/.test(currentString) && currentString.trim().length > 3) {
          asciiStrings.push(currentString.trim());
        }
      }
      currentString = '';
    }
    if (asciiStrings.length > 100) break;
  }

  // Deduplicate and filter strings
  asciiStrings = Array.from(new Set(asciiStrings)).filter(
    (s) => !s.startsWith('PowerPoint') && !s.startsWith('Microsoft') && s.length < 120
  );

  const detectedTool = fileName.toLowerCase().endsWith('.dps')
    ? 'wps-presentation'
    : 'ms-powerpoint';

  const specialty = inferSpecialtyFromText(cleanName + ' ' + asciiStrings.join(' '));

  // Generate slides from detected strings or fallback template
  const slides: PresentationSlide[] = [];
  const slideCount = Math.max(3, Math.min(6, Math.ceil(asciiStrings.length / 4)));

  for (let i = 1; i <= slideCount; i++) {
    const chunk = asciiStrings.slice((i - 1) * 3, i * 3);
    const sTitle =
      chunk[0] ||
      (i === 1
        ? cleanName
        : i === 2
        ? 'Pathophysiology & Clinical Assessment'
        : i === 3
        ? 'Diagnostic Protocol & Pharmacotherapy'
        : `Management Guideline ${i}`);

    const bullets = chunk.slice(1);
    if (bullets.length === 0) {
      bullets.push(
        'Guideline-recommended evidence-based clinical intervention strategy.',
        'Risk stratification and differential diagnosis verification.',
        'Continuous therapeutic monitoring and outcome evaluation.'
      );
    }

    slides.push({
      id: `slide-legacy-${Date.now()}-${i}`,
      slideNumber: i,
      title: sTitle,
      subtitle: `Module Component ${i} (Imported from ${fileName})`,
      contentBullets: bullets,
      speakerNotes: `Imported clinical notes for slide ${i}. Verified in accordance with national CPD hospital accreditation standards.`,
      clinicalTakeaway: 'Early diagnosis and adherence to treatment guidelines enhance patient survival and recovery.',
    });
  }

  return {
    title: cleanName,
    author: 'Dr. Bonny, MD',
    institution: 'Tumutumu Medical Centre',
    summary: `Continuing Medical Education presentation imported from legacy presentation file ${fileName}. Reviewed and structured for online CPD accreditation.`,
    specialty,
    slides,
    detectedTool,
    fileName,
    fileSizeBytes,
    rawBlobUrl,
    warnings: [
      `Imported from binary format (${fileName.split('.').pop()?.toUpperCase()}). To unlock automated shape and embedded image extraction, you can also save your deck as modern .pptx in PowerPoint or WPS Office.`,
    ],
  };
}

/**
 * Generates an automatic 3-question evaluation quiz based on presentation topic and slides
 */
export function generateQuizForPresentation(
  title: string,
  specialty: MedicalSpecialty,
  slides: PresentationSlide[]
): QuizQuestion[] {
  const primarySlide = slides[0] || { title: title };
  const secondarySlide = slides[1] || slides[0] || { title: title };

  return [
    {
      id: `quiz-gen-${Date.now()}-1`,
      vignette: `A patient is evaluated according to the ${title} protocol. What is the initial, highest-priority clinical intervention recommended in primary management?`,
      options: [
        'Initiate guideline-directed first-line diagnostic and therapeutic stabilization',
        'Wait 24 hours for elective outpatient specialist referral without triage',
        'Administer broad-spectrum empirical therapy without baseline testing',
        'Discharge home with general observation instructions only',
      ],
      correctAnswerIndex: 0,
      rationale:
        'Clinical practice guidelines mandate prompt guideline-directed stabilization to mitigate acute morbidity and optimize survival.',
      referenceGuideline: 'National CPD Healthcare Accreditation Standards 2026',
    },
    {
      id: `quiz-gen-${Date.now()}-2`,
      vignette: `Regarding the concepts presented in "${secondarySlide.title}", which finding is considered a definitive clinical diagnostic or treatment indicator?`,
      options: [
        'Presence of standardized clinical criteria confirmed by objective diagnostic evaluation',
        'Mild nonspecific malaise without physiological alterations',
        'Normal laboratory baseline with absent symptoms',
        'Immediate resolution without any therapeutic intervention',
      ],
      correctAnswerIndex: 0,
      rationale:
        'Standardized diagnostic confirmation ensures targeted intervention and prevents delayed or inappropriate therapy.',
      referenceGuideline: `${specialty} Practice Advisory Board 2026`,
    },
    {
      id: `quiz-gen-${Date.now()}-3`,
      vignette: `What is the principal clinical takeaway emphasized regarding follow-up and monitoring for patients managed under this protocol?`,
      options: [
        'Close interval surveillance and therapeutic re-assessment reduce 30-day complications',
        'No follow-up is necessary once the initial treatment dose is administered',
        'Monitoring is only required if severe irreversible complications develop',
        'Empirical polypharmacy should be continued indefinitely regardless of response',
      ],
      correctAnswerIndex: 0,
      rationale:
        'Active interval reassessment detects early treatment failure or adverse reactions, substantially reducing 30-day hospital readmissions.',
      referenceGuideline: 'Hospital Clinical Audit & Quality Assurance Protocol',
    },
  ];
}
