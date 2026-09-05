import JSZip from 'jszip';

export interface SamplePptxOptions {
  title: string;
  author: string;
  toolType: 'ms-powerpoint' | 'wps-presentation';
  slides: {
    title: string;
    subtitle?: string;
    bullets: string[];
    notes?: string;
  }[];
}

/**
 * Creates a valid, well-structured .pptx file in memory using JSZip
 */
export async function generateSamplePptxBlob(options: SamplePptxOptions): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`;

  options.slides.forEach((_, idx) => {
    contentTypesXml += `\n  <Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    contentTypesXml += `\n  <Override PartName="/ppt/notesSlides/notesSlide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
  });

  contentTypesXml += '\n</Types>';
  zip.file('[Content_Types].xml', contentTypesXml);

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
  );

  // 3. docProps/app.xml
  const appName =
    options.toolType === 'wps-presentation'
      ? 'WPS Office Presentation 2026'
      : 'Microsoft Office PowerPoint (16.0000)';

  zip.file(
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>${appName}</Application>
  <Slides>${options.slides.length}</Slides>
</Properties>`
  );

  // 4. docProps/core.xml
  zip.file(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>${options.title}</dc:title>
  <dc:creator>${options.author}</dc:creator>
  <cp:lastModifiedBy>${options.author}</cp:lastModifiedBy>
  <dc:description>Clinical Continuing Medical Education PowerPoint Module created for professional healthcare practitioners.</dc:description>
</cp:coreProperties>`
  );

  // 5. ppt/presentation.xml & ppt/_rels/presentation.xml.rels
  let sldIdList = '';
  let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;

  options.slides.forEach((_, idx) => {
    const rId = `rId${idx + 1}`;
    sldIdList += `\n    <p:sldId id="${256 + idx}" r:id="${rId}"/>`;
    presRels += `\n  <Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>`;
  });

  presRels += '\n</Relationships>';

  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>${sldIdList}
  </p:sldIdLst>
</p:presentation>`
  );

  zip.file('ppt/_rels/presentation.xml.rels', presRels);

  // 6. Each Slide & Slide Relationships & Notes
  options.slides.forEach((slide, idx) => {
    const slideNum = idx + 1;

    // Slide XML
    let bulletXml = '';
    slide.bullets.forEach((bullet) => {
      bulletXml += `
        <a:p>
          <a:pPr lvl="0"/>
          <a:r>
            <a:rPr lang="en-US" sz="1800"/>
            <a:t>${escapeXml(bullet)}</a:t>
          </a:r>
        </a:p>`;
    });

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <!-- Title Shape -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2800" b="1"/>
              <a:t>${escapeXml(slide.title)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <!-- Subtitle or Content Shape -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content 2"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="body" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>${bulletXml}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

    zip.file(`ppt/slides/slide${slideNum}.xml`, slideXml);

    // Slide rels linking to notes
    zip.file(
      `ppt/slides/_rels/slide${slideNum}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${slideNum}.xml"/>
</Relationships>`
    );

    // Notes Slide XML
    const notesContent = slide.notes || `Speaker notes for slide ${slideNum}: emphasize key diagnostic thresholds and guidelines.`;
    const notesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Notes Body"/>
          <p:cNvSpPr/>
          <p:nvPr>
            <p:ph type="body"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:p>
            <a:r>
              <a:t>${escapeXml(notesContent)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:notes>`;

    zip.file(`ppt/notesSlides/notesSlide${slideNum}.xml`, notesXml);
  });

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const SAMPLE_MS_POWERPOINT: SamplePptxOptions = {
  title: 'Acute Heart Failure & Inotropic Support in District Hospitals',
  author: 'Dr. Bonny, MD, FCP',
  toolType: 'ms-powerpoint',
  slides: [
    {
      title: 'Clinical Presentation & Bedside Hemodynamics',
      bullets: [
        'Rapid assessment of clinical perfusion ("warm vs. cold") and volume congestion ("dry vs. wet")',
        'Identification of precipitating factors: hypertensive crisis, myocardial ischemia, arrhythmias, or severe infection',
        'Bedside point-of-care lung ultrasound (B-lines) and point-of-care NT-proBNP correlation',
        'Immediate oxygenation target: maintain SpO2 ≥ 94% using non-invasive ventilation (CPAP)',
      ],
      notes: 'Speaker Note: Emphasize that loop diuretics should be initiated within 60 minutes of presentation, but avoid overdiuresis in preload-dependent states.',
    },
    {
      title: 'Guideline-Directed Vasodilators & Inotrope Selection',
      bullets: [
        'Intravenous Nitroglycerin/Nitroprusside titration in hypertensive acute pulmonary edema',
        'Dobutamine vs. Milrinone indications in cardiogenic hypoperfusion',
        'Norepinephrine as the first-line vasopressor for cardiogenic shock with SBP < 85 mmHg',
        'Monitoring parameters: Mean arterial pressure (target ≥ 65 mmHg), lactate clearance, and hourly urine output',
      ],
      notes: 'Speaker Note: Do not use inotropes routinely without evidence of low cardiac output or hypoperfusion due to arrhythmogenic risks.',
    },
    {
      title: 'Transition to Guideline-Directed Medical Therapy (GDMT)',
      bullets: [
        'Early initiation of four pillars: ARNI/ACEi, beta-blocker, MRA, and SGLT2 inhibitor prior to hospital discharge',
        'Dose up-titration scheduling at 2-week post-discharge clinic follow-up',
        'Patient empowerment: daily weight tracking, sodium restriction, and red-flag symptom education',
      ],
      notes: 'Speaker Note: Discharge planning must include documented follow-up within 7 to 14 days to prevent readmissions.',
    },
  ],
};

export const SAMPLE_WPS_POWERPOINT: SamplePptxOptions = {
  title: 'Pediatric Severe Malaria: Emergency Triage and IV Artesunate',
  author: 'Dr. Bonny, MD & Kenya Pediatric Association',
  toolType: 'wps-presentation',
  slides: [
    {
      title: 'WHO Severe Malaria Diagnostic Indicators in Children',
      bullets: [
        'Cerebral malaria manifested by unarousable coma (Blantyre Coma Score ≤ 2)',
        'Severe normocytic anemia (Hemoglobin < 5.0 g/dL or Hematocrit < 15%)',
        'Metabolic acidosis (respiratory distress characterized by deep acidotic breathing)',
        'Acute kidney injury, hypoglycemia (blood glucose < 2.2 mmol/L), and hyperparasitemia (> 10%)',
      ],
      notes: 'WPS Presentation Note: Immediate blood glucose check is mandatory for every child with suspected severe malaria before any lumbar puncture.',
    },
    {
      title: 'Intravenous Artesunate Reconstitution & Dosing Schedule',
      bullets: [
        'Weight-adjusted dosage: 3.0 mg/kg per dose for children weighing < 20 kg',
        'Standard dosage: 2.4 mg/kg per dose for children weighing ≥ 20 kg',
        'Three primary doses required at 0, 12, and 24 hours via slow IV bolus (1-2 minutes)',
        'Reconstitution with 5% sodium bicarbonate diluent followed by normal saline dilution',
      ],
      notes: 'WPS Presentation Note: Artesunate significantly outperforms IV quinine by demonstrating a 22.5% relative reduction in mortality in the AQUAMAT clinical trial.',
    },
    {
      title: 'Fluid Resuscitation Caution & Blood Transfusion Thresholds',
      bullets: [
        'Avoid rapid large-volume fluid boluses to prevent fatal pulmonary or cerebral edema (FEAST trial findings)',
        'Maintenance fluid infusion: 3-4 mL/kg/hour with 5% Dextrose in normal saline',
        'Indications for packed red cell transfusion: Hb < 5 g/dL or Hb 5-7 g/dL with clinical signs of decompensation',
        'Switch to a full 3-day oral Artemisinin-based Combination Therapy (ACT) course as soon as the child tolerates oral intake',
      ],
      notes: 'WPS Presentation Note: Always record baseline Blantyre coma score every 4 hours during the first 24 hours of inpatient admission.',
    },
  ],
};
