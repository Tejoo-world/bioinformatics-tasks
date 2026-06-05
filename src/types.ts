export interface ProteinSequence {
  id: string;
  name: string;
  organism: string;
  sequence: string;
  accession: string;
}

export interface AlignmentResult {
  alignedSequences: {
    id: string;
    name: string;
    sequence: string; // aligned with '-' gaps
  }[];
  consensus: string;
  conservation: number[]; // 0-10 score for each position
  motifs: {
    name: string;
    start: number;
    end: number;
    pattern: string;
    description: string;
  }[];
  interpretation: string;
}

export interface Atom3D {
  x: number;
  y: number;
  z: number;
  type: 'C' | 'N' | 'O' | 'S' | 'FE' | 'H_BOND' | 'CA'; // CA = alpha carbon
  chain: string;
  residueIndex: number;
  residueName: string;
  secStruct?: 'helix' | 'sheet' | 'coil';
}

export interface ProteinStructure {
  id: string;
  name: string;
  uniprotId: string;
  pdbId: string;
  description: string;
  organism: string;
  length: number;
  molecularWeight: string;
  secondaryStructureBreakdown: {
    helices: number; // percentage
    sheets: number;  // percentage
    coils: number;   // percentage
  };
  features: {
    name: string;
    range: string;
    type: string;
    description: string;
  }[];
  atoms: Atom3D[];
  helicesRanges: { start: number; end: number; chain: string }[];
  sheetsRanges: { start: number; end: number; chain: string }[];
}

export interface ReportConfig {
  topicId: 'database' | 'drug_discovery' | 'machine_learning';
  title: string;
  author: string;
  targetOrganism?: string;
  specificDatabase?: string;
  customFocus?: string;
}

export interface AcademicReport {
  id: string;
  topicId: string;
  title: string;
  author: string;
  date: string;
  abstract: string;
  introduction: string;
  comparisonGrid?: {
    header: string[];
    rows: string[][];
  };
  methodology: string; // Markdown or structured
  caseStudies?: {
    title: string;
    content: string;
  }[];
  discussion: string;
  references: string[];
  fullReportMarkdown?: string;
}
