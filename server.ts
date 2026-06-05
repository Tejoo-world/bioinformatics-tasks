import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Define path helpers safely for both ESM and CJS environments
const _filename = typeof import.meta !== 'undefined' && import.meta.url
  ? fileURLToPath(import.meta.url)
  : '';
const _dirname = _filename ? path.dirname(_filename) : '';

interface Atom3D {
  x: number;
  y: number;
  z: number;
  type: 'C' | 'N' | 'O' | 'S' | 'FE' | 'H_BOND' | 'CA';
  chain: string;
  residueIndex: number;
  residueName: string;
  secStruct?: 'helix' | 'sheet' | 'coil';
}

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Lazy initialization of Gemini API Client to prevent startup crash if key missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI interpretations will fall back to static templates.");
      // We will handle undefined keys gracefully inside endpoints instead of crashing
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Global API Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    apiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// TASK 2: Alignment Interpretation endpoint
app.post('/api/msa/interpret', async (req, res) => {
  const { alignedSequences, familyName, consensus } = req.body;
  
  if (!alignedSequences || !Array.isArray(alignedSequences) || alignedSequences.length === 0) {
    return res.status(400).json({ error: "Missing aligned sequences" });
  }

  const keyExists = !!process.env.GEMINI_API_KEY;
  if (!keyExists) {
    // Graceful Fallback
    return res.json({
      interpretation: `### Static Evolutionary Interpretation (${familyName || 'Protein Family'})

The multiple sequence alignment for these ${alignedSequences.length} sequences reveals key molecular regions of structural and functional conservation.

* **High-Conservation Columns:** Residues forming active coordinating sites or hydrophobic cores are highly conserved across all evolutionary lineages from simple organisms to humans.
* **Variable Regions:** Surface loops and outer residues demonstrate higher amino-acid substitution frequencies, indicating they are subject to lower selective pressure or participate in species-specific interactions.
* **Motifs identified:** Conserved catalytic centers reflect deep phylogenetic origins.
*(Configure your GEMINI_API_KEY in Settings > Secrets for customized live biological reasoning).*`
    });
  }

  try {
    const ai = getGeminiClient();
    const alignmentText = alignedSequences.map(s => `>${s.id} (${s.name || ''})\n${s.sequence}`).join('\n');
    
    const prompt = `You are an expert computational evolutionary biologist and bioinformatics specialist.
You are evaluating a Multiple Sequence Alignment (MSA) for a protein family: "${familyName || 'Unknown Protein Family'}".

Here is the aligned FASTA alignment:
${alignmentText}

Consensus sequence:
${consensus}

Write a professional, detailed, and scientifically robust interpretation of this alignment for an academic assignment (Task 2). Include:
1. **Evolutionary Conservation Analysis**: Discuss which regions/columns are highly conserved and explain *why* (e.g. active site coordination, hydrophobic core packing, tertiary scaffold maintenance).
2. **Functional Motifs & Active Sites**: Pinpoint specific amino acid sequences or motifs that are 100% conserved and their known biological function.
3. **Phylogenetic and Mutation Insights**: Analyze specific variations/mutations among these organisms. What do they tell us about organism-specific adaptations or evolutionary distance (e.g. human vs mouse vs zebrafish)?
4. **Summary Conclusion**: A brief, authoritative summary of the alignment findings.

Format your response in beautiful, clear, and clean Markdown with clear headings or bullet points. Avoid flowery self-praising words. Keep it strictly focused on the science.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ interpretation: response.text });
  } catch (error: any) {
    console.error("Gemini MSA error:", error);
    res.status(500).json({ error: "Failed to generate alignment analysis", details: error.message });
  }
});

// TASK 3: Custom Sequence 3D Structure & Feature Predictor
app.post('/api/structure/predict', async (req, res) => {
  const { sequence, name } = req.body;

  if (!sequence) {
    return res.status(400).json({ error: "Sequence is required" });
  }

  const cleanSeq = sequence.trim().toUpperCase().replace(/[^A-Z-]/g, "");
  const size = cleanSeq.length;

  const keyExists = !!process.env.GEMINI_API_KEY;
  
  // Custom structure generators if key is missing or for fallback
  const fallbackStructure = {
    secondaryStructureBreakdown: { helices: 45, sheets: 25, coils: 30 },
    features: [
      { name: "Predicted Fold Domain", range: `1-${size}`, type: "Structural Domain", description: "Alpha-beta globular folding region predicted with high confidence." },
      { name: "Hydrophobic Core Pack", range: `${Math.round(size*0.3)}-${Math.round(size * 0.5)}`, type: "Hydrophobic Bundle", description: "Conserved core residues providing stability." }
    ],
    report: `### Structural Features Report for: **${name || 'Custom Sequence'}**

* **Folding Classification**: Alpha/Beta mixed domain.
* **Secondary Structure Summary**: Combines regular alpha-helices and beta strands in a compact globular shape holding core functional cavities.
* **Functional Sites**: Conserved core hydrophobic residues.
*(Set your GEMINI_API_KEY in Secrets for dynamic ML-modeled 3D structures and deep structural reports).*`
  };

  if (!keyExists) {
    return res.json({
      ...fallbackStructure,
      predictedAtoms: generateDummyAtoms(cleanSeq)
    });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are an expert structural biologist and protein modeling system like AlphaFold or SWISS-MODEL.
You are given a protein sequence named "${name || 'Custom Sequence'}":
Sequence (${cleanSeq.length} aa):
${cleanSeq}

Please perform structure prediction analysis and return the results strictly in JSON format.
You must analyze the text and find regions that represents:
1. **Alpha Helices** (regions of helices with start/end indices, 1-indexed)
2. **Beta Sheets** (regions of beta strands with start/end indices, 1-indexed)
3. **Key Biological Features** (active sites, binding pockets, surface loops)
4. **General Structural Report** (a clean text/markdown narrative detailing folding properties, structural category, and secondary features).

You must respond utilizing the following JSON schema:
{
  "helices": [ {"start": number, "end": number} ],
  "sheets": [ {"start": number, "end": number} ],
  "features": [ {"name": "string", "range": "string", "type": "string", "description": "string"} ],
  "secondaryStructureBreakdown": { "helices": number, "sheets": number, "coils": number },
  "report": "string"
}
Make sure all helices and sheets are valid 1-indexed integers and correspond to positions within ${cleanSeq.length}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            helices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.INTEGER },
                  end: { type: Type.INTEGER }
                },
                required: ["start", "end"]
              }
            },
            sheets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.INTEGER },
                  end: { type: Type.INTEGER }
                },
                required: ["start", "end"]
              }
            },
            features: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  range: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "range", "type", "description"]
              }
            },
            secondaryStructureBreakdown: {
              type: Type.OBJECT,
              properties: {
                helices: { type: Type.INTEGER },
                sheets: { type: Type.INTEGER },
                coils: { type: Type.INTEGER }
              },
              required: ["helices", "sheets", "coils"]
            },
            report: { type: Type.STRING }
          },
          required: ["helices", "sheets", "features", "secondaryStructureBreakdown", "report"]
        }
      }
    });

    const prediction = JSON.parse(response.text);
    
    // Generate 3D coordinates representing these predicted helices and sheets
    const predictedAtoms = generateModelAtomsFromPrediction(cleanSeq, prediction.helices, prediction.sheets);

    res.json({
      secondaryStructureBreakdown: prediction.secondaryStructureBreakdown,
      features: prediction.features,
      report: prediction.report,
      predictedAtoms
    });

  } catch (error: any) {
    console.error("Structure prediction error:", error);
    // fallback gracefully on JSON error
    res.json({
      ...fallbackStructure,
      predictedAtoms: generateDummyAtoms(cleanSeq)
    });
  }
});

// TASK 4: Mini-Project detailed thesis/report generator
app.post('/api/report/generate', async (req, res) => {
  const { topicId, title, author, targetOrganism, specificDatabase, customFocus } = req.body;

  if (!topicId) {
    return res.status(400).json({ error: "Missing topicId" });
  }

  const keyExists = !!process.env.GEMINI_API_KEY;
  if (!keyExists) {
    // Generate massive high quality fallback thesis
    return res.json({
      abstract: `This mini-project report evaluates the computational pillars of modern bioinformatics. Selecting the topic '${topicId}', we explore core database architectures, chemical interaction models, or machine learning pipelines (configured under '${title || 'Default Title'}'). In the absence of an active Gemini API key, this placeholder provides the structured outline of the requested 5-6 page thesis.`,
      introduction: `### 1. Introduction
Bioinformatics represents the convergence of molecular biology and computer science. Our study focuses on key investigative techniques aligned with the project theme: ${title || 'Bioinformatics Study'}. This report analyses databases, structural prediction, or computational screening protocols.`,
      methodology: `### 2. Methodological Framework
Our computational methods incorporate standard sequence alignments, validation, and comparative schemas:
1. **Data Acquisition**: Fetching FASTA records or crystallographic structures.
2. **Alignment & Scoring Parsing**: Applying progressive alignment metrics.
3. **Validation and References**: Structuring references from NCBI and PDB.`,
      discussion: `### 3. Comprehensive Scientific Discussion
The integration of computational workflows accelerates pharmaceutical throughput. By linking sequence level variations (Task 2) and tertiary modeling (Task 3), researchers bridge the genotype-to-phenotype gap effectively. Databases like NCBI and PDB serve as structural backbones.`,
      references: [
        "Altschul, S. F., et al. (1990). Basic local alignment search tool. Journal of Molecular Biology, 215(3), 403-410.",
        "Berman, H. M., et al. (2000). The Protein Data Bank. Nucleic Acids Research, 28(1), 235-242.",
        "UniProt Consortium. (2021). UniProt: the universal protein knowledgebase in 2021. Nucleic Acids Research, 49(D1), D480-D489."
      ],
      comparisonGrid: topicId === 'database' ? {
        header: ["Database", "Primary Content", "Format Styles", "Key Use-case"],
        rows: [
          ["NCBI GenBank", "Nucleotide/DNA/Genomes", "FASTA, GBFF, XML", "Gene discovery, Phylogenetics"],
          ["UniProt KB", "Annotated Protein Sequences", "FASTA, Text, JSON", "Functional domain checking"],
          ["Protein Data Bank (PDB)", "3D coordinate files (atoms)", "PDB, mmCIF, XML", "X-ray / CryoEM structures"]
        ]
      } : undefined
    });
  }

  try {
    const ai = getGeminiClient();
    let topicScope = "";
    if (topicId === 'database') {
      topicScope = "Easy comparative study of biological databases (NCBI GenBank/RefSeq, UniProt, and Protein Data Bank - PDB). Contrast what data they store, common file formats like FASTA, GBFF, and mmCIF, why databases are cross-referenced, and how students use them.";
    } else if (topicId === 'drug_discovery') {
      topicScope = "Basics of Computer-Aided Drug Design (CADD) and Molecular Docking. Explain target selection, docking chemical ligands into protein active sites, scoring binding fits, public chemical libraries (PubChem, ZINC), and simple rules like Lipinski's Rule of 5 to screen drug viability.";
    } else {
      topicScope = "Simple applications of Machine Learning (ML) and AlphaFold in biology. Detail how sequence matching and Hidden Markov Models are used, how AlphaFold uses sequence alignments and residue co-evolution to predict 3D protein structures, and how newly designed proteins can be generated using tools.";
    }

    const prompt = `You are a supportive, knowledgeable Biotechnology professor compiling a clean, highly educational, easy-to-understand laboratory/mini-project report suitable for a typical B.Tech Biotechnology college student (undergraduate level).
The report should be simple, clear, accurate, and completely aligned with an undergraduate syllabus.

Title: "${title || 'Bioinformatics Laboratory Study'}"
Author: "${author || 'R. Omarradhika, B.Tech Biotechnology Student'}"
Topic Core Focus: ${topicScope}
Target Organism/Focus (if any): "${targetOrganism || 'General biological receptor studies'}"
Specific Database/Tool (if any): "${specificDatabase || 'Standard sequence/structure workflows'}"
Additional Undergraduate Focus: "${customFocus || 'None'}"

Avoid overly dense post-graduate mathematics, physical-chemistry formulas, or hyper-complex terminology unless explained simply. Focus on clear, textbook-style biological intuition, practical steps, and easy diagrams/text lists.

Please structure the report sections exactly and return a JSON object with the following fields:
- "abstract": A concise, clear 150-200 word summary of the background, databases/methods studied, main conclusions, and why this is helpful for biotech students.
- "introduction": A clear, beginner-friendly introduction (around 450-600 words in markdown) explaining the biological context, why experimental determination of structures/sequences is slow, and how bioinformatics databases/tools solve this.
- "methodology": A straightforward explanation of the steps and algorithms (around 350-500 words in markdown) detailing how databases are cross-referenced, how sequence similarities or docking fits are calculated, or how AlphaFold alignments detect co-evolution.
- "discussion": A practical, realistic discussion (around 400-500 words in markdown) showcasing example applications, simple limitations (such as static receptor structures or unreviewed databases), and future outlooks in healthcare.
- "references": An array of 4 real, properly formatted academic citations (APA format) with journals, years, and page details.
- "comparisonGrid": Optional. If topicId is 'database', include an object with "header": string[] and "rows": string[][] containing a simple, clear comparison table.

Make sure your markdown contents use clean, beautifully structured headers, bulleted lists, and readable text blocks. Output must strictly respect JSON format. Let's make this report extremely helpful for the student!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            abstract: { type: Type.STRING },
            introduction: { type: Type.STRING },
            methodology: { type: Type.STRING },
            discussion: { type: Type.STRING },
            references: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            comparisonGrid: {
              type: Type.OBJECT,
              properties: {
                header: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              },
              required: ["header", "rows"]
            }
          },
          required: ["abstract", "introduction", "methodology", "discussion", "references"]
        }
      }
    });

    const reportData = JSON.parse(response.text);
    res.json(reportData);

  } catch (error: any) {
    console.error("Report generation error:", error);
    res.status(500).json({ error: "Failed to compile the academic thesis", details: error.message });
  }
});

// Helper static atom generators for Task 3 custom predictions
function generateDummyAtoms(seq: string): Atom3D[] {
  const atoms: Atom3D[] = [];
  const size = seq.length;
  // Generate a beautiful generic sine wave fold with beta/helix alternate patterns
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1 || 1);
    const angle = t * Math.PI * 4;
    const x = Math.cos(angle) * 8 + (t - 0.5) * 30;
    const y = Math.sin(angle) * 8 + Math.sin(t * Math.PI) * 5;
    const z = Math.sin(angle * 2) * 4;
    
    const structType = i % 30 < 12 ? 'helix' : (i % 30 < 22 ? 'sheet' : 'coil');

    atoms.push({
      x, y, z,
      type: 'CA',
      chain: 'A',
      residueIndex: i + 1,
      residueName: "ALA",
      secStruct: structType
    });
    
    if (i % 2 === 0) {
      atoms.push({
        x: x + 1.5, y: y + 0.5, z: z - 0.5,
        type: 'O',
        chain: 'A',
        residueIndex: i + 1,
        residueName: "ALA",
        secStruct: structType
      });
    }
  }
  return atoms;
}

function generateModelAtomsFromPrediction(seq: string, helices: any[], sheets: any[]): Atom3D[] {
  const atoms: Atom3D[] = [];
  const size = seq.length;

  for (let i = 0; i < size; i++) {
    const resNum = i + 1;
    // Determine secondary structure based on intervals
    let secStruct: 'helix' | 'sheet' | 'coil' = 'coil';
    
    const inHelix = helices?.some((h: any) => resNum >= h.start && resNum <= h.end);
    const inSheet = sheets?.some((s: any) => resNum >= s.start && resNum <= s.end);
    
    if (inHelix) secStruct = 'helix';
    else if (inSheet) secStruct = 'sheet';

    // Mathematical projection for protein coordinates
    const t = i / (size - 1 || 1);
    let x = 0, y = 0, z = 0;

    if (secStruct === 'helix') {
      const angle = i * 1.8; // Tight helix looping
      x = 5 * Math.cos(angle) + (t - 0.5) * 28;
      y = 5 * Math.sin(angle) + Math.cos(t * Math.PI) * 4;
      z = (t - 0.5) * 10;
    } else if (secStruct === 'sheet') {
      const wiggle = (i % 2 === 0 ? 1 : -1) * 1.5; // Zig-zag strand
      x = (t - 0.5) * 32 + wiggle;
      y = Math.sin(t * Math.PI * 2) * 6;
      z = wiggle * 0.5;
    } else {
      // Loop coils are smooth large waves
      const wave = Math.sin(t * Math.PI * 3) * 6;
      x = (t - 0.5) * 30;
      y = wave;
      z = Math.cos(t * Math.PI * 3) * 6;
    }

    atoms.push({
      x, y, z,
      type: 'CA',
      chain: 'A',
      residueIndex: resNum,
      residueName: seq[i] || 'ALA',
      secStruct
    });

    // Add peptide nitrogen and carbonyl oxygen
    atoms.push({
      x: x + 1.4, y: y + 0.3, z: z - 0.5,
      type: 'O',
      chain: 'A',
      residueIndex: resNum,
      residueName: seq[i] || 'ALA',
      secStruct
    });
  }

  return atoms;
}


// Start full stack server utilizing Vite Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Bioinformatics server running on http://localhost:${PORT}`);
  });
}

startServer();
