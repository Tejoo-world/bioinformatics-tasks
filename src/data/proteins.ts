import { ProteinSequence, ProteinStructure, Atom3D } from '../types';

export const MSA_PRESETS: { [key: string]: { name: string; sequences: ProteinSequence[] } } = {
  globins: {
    name: "Globin Family (Hemoglobin Alpha Subunits)",
    sequences: [
      {
        id: "HBA_HUMAN",
        name: "Human",
        organism: "Homo sapiens",
        accession: "P69905",
        sequence: "VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
      },
      {
        id: "HBA_PANTR",
        name: "Chimpanzee",
        organism: "Pan troglodytes",
        accession: "P60813",
        sequence: "VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
      },
      {
        id: "HBA_MOUSE",
        name: "Mouse",
        organism: "Mus musculus",
        accession: "P01942",
        sequence: "VLSGEDKSNIKAAWGKIGGHGAEYGAEALERMFASFPTTKTYFPHFDVSHGSAQVKGHGKKVADALASAAGHLDDLPGALSALSDLHAHKLRVDPVNFKLLSHCLLVTLASHHPADFTPAVHASLDKFLASVSTVLTSKYR"
      },
      {
        id: "HBA_CHICK",
        name: "Chicken",
        organism: "Gallus gallus",
        accession: "P01923",
        sequence: "VLSAADKNNVKGIFTKIAGHAEEYGAETLERMFTTYPPTKTYFPHFDLSHGSAQIKGHGKKVADALNNAVAHIDDLPGALSALSDLHAHKLRVDPVNFKLLGQCFLVVVAIHHPAALTPEVHASLDKFLCAVGTVLTAKYR"
      },
      {
        id: "HBA_DANRE",
        name: "Zebrafish",
        organism: "Danio rerio",
        accession: "P01931",
        sequence: "SLTAKDKSVVKAFWGKISGKADECGAEALGRMLVVYPTTKTYFPHFDFSHGSAQIKAHGKKVADALALAVGHLDDLPNALSDLSDLHAHKLRVDPANFKILAHNVIVVIAMYFPGDFTPEMHVSVDKFLAALALALSDKYR"
      }
    ]
  },
  insulins: {
    name: "Insulin Family",
    sequences: [
      {
        id: "INS_HUMAN",
        name: "Human",
        organism: "Homo sapiens",
        accession: "P01308",
        sequence: "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN"
      },
      {
        id: "INS_PIG",
        name: "Pig",
        organism: "Sus scrofa",
        accession: "P01315",
        sequence: "MALWTRLLPLLALLALWAPAPAQAFVNQHLCGSHLVEALYLVCGERGFFYTPKARREAENPQAGAVELGGGLGGLQALALEGPPQKRGIVEQCCTSICSLYQLENYCN"
      },
      {
        id: "INS_BOVIN",
        name: "Cow",
        organism: "Bos taurus",
        accession: "P01317",
        sequence: "MALWTRLVPLLALLALWAPAPAQAFVNQHLCGSHLVEALYLVCGERGFFYTPKARREVEGPQVGALELAGGPGAGGLEGPPQKRGIVEQCCASVCSLYQLENYCN"
      },
      {
        id: "INS_MOUSE",
        name: "Mouse",
        organism: "Mus musculus",
        accession: "P01325",
        sequence: "MALLVHLLPLLALLALWEPKPAQAFVKQHLCGPHLVEALYLVCGERGFFYTPKSRREVEDPQVEQLELGGSPGDLQTLALEVARQKRGIVDQCCTSICSLYQLENYCN"
      },
      {
        id: "INS_DANRE",
        name: "Zebrafish",
        organism: "Danio rerio",
        accession: "O73727",
        sequence: "MASLVRLRPLLVLLVLVGPDAAQAPVNQHLCGSHLVEALYLVCGERGFFYNPKRDVD-ELLGFLPP--KAGAV------EL--G---GIVDQCCTKICSIYQLENYCN"
      }
    ]
  },
  cytochromes: {
    name: "Cytochrome C (Mitochondrial Respiratory)",
    sequences: [
      {
        id: "CYC_HUMAN",
        name: "Human",
        organism: "Homo sapiens",
        accession: "P99999",
        sequence: "MGDVEKGKKIFIMKCSQCHTVEKGGKHKTGPNLHGLFGRKTGQAPGYSYTAANKNKGIIWGEDTLMEYLENPKKYIPGTKMIFVGIKKKEERADLIAYLKKATNE"
      },
      {
        id: "CYC_YEAST",
        name: "Yeast",
        organism: "Saccharomyces cerevisiae",
        accession: "P00044",
        sequence: "MTEFKAGSAKKGATLFKTRCLQCHTVEKGGPHKVGPNLHGIFGRHSGQAEGYSYTDANIKKNVLWDENNMSEYLTNPKKYIPGTKMAFGGLKKEKDRNDLITYLKKACE"
      },
      {
        id: "CYC_HORSE",
        name: "Horse",
        organism: "Equus caballus",
        accession: "P00004",
        sequence: "MGDVEKGKKIFVQKCAQCHTVEKGGKHKTGPNLHGLFGRKTGQAPGFTYTDANKNKGITWKEETLMEYLENPKKYIPGTKMIFAGIKKKTEREDLIAYLKKATNE"
      },
      {
        id: "CYC_DROME",
        name: "Fruit Fly",
        organism: "Drosophila melanogaster",
        accession: "P00030",
        sequence: "MGSGDAENGKKIFVQKCAQCHTVEAGGKHKVGPNLHGLFGRKTGQVEGYSYTDANKAKGITWNEDTLFEYLENPKKYIPGTKMIFAGLKKPNERGDLIAYLKSATK-"
      },
      {
        id: "CYC_ARATH",
        name: "Arabidopsis",
        organism: "Arabidopsis thaliana",
        accession: "P00017",
        sequence: "MASFDEAPPGNSKAGEKIFRTKCAQCHTVEKGAGHKQGPNLNGLFGRQSGTTPGYSYSAANKNKAVEWEEKALYDYLLNPKKYIPGTKMVFPGLKKPQDRADLIAYLKESTA-"
      }
    ]
  },
  viral_spike: {
    name: "SARS-CoV-2 Receptor Binding Domain (RBD)",
    sequences: [
      {
        id: "SPIKE_WUHAN",
        name: "Wuhan-Hu-1 (Reference)",
        organism: "SARS-CoV-2 Wuhan",
        accession: "YP_009724390",
        sequence: "NITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNSASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGKIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTNGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNF"
      },
      {
        id: "SPIKE_ALPHA",
        name: "Alpha Variant (B.1.1.7)",
        organism: "SARS-CoV-2 Alpha",
        accession: "VOC-202012/01",
        sequence: "NITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNSASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGKIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTYGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNF"
      },
      {
        id: "SPIKE_BETA",
        name: "Beta Variant (B.1.351)",
        organism: "SARS-CoV-2 Beta",
        accession: "VOC-202012/02",
        sequence: "NITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNSASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGNIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTNGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNF"
      },
      {
        id: "SPIKE_DELTA",
        name: "Delta Variant (B.1.617.2)",
        organism: "SARS-CoV-2 Delta",
        accession: "VOC-22APR-02",
        sequence: "NITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNSASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGKIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYRYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTNGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNF"
      },
      {
        id: "SPIKE_OMICRON",
        name: "Omicron Variant (B.1.1.529)",
        organism: "SARS-CoV-2 Omicron",
        accession: "VOC-21NOV-01",
        sequence: "NITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNLASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGNIADYNYKLPDDFTGCVIAWNSNNLDSKVSGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLKSYGFQPTYGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNF"
      }
    ]
  }
};

// Generate coordinates mock PDB atoms in gorgeous stylized curves
function generateHelicesAtoms(
  chain: string, 
  residueStart: number, 
  length: number, 
  startResName: string,
  startCoord: { x: number; y: number; z: number }, 
  direction: { x: number; y: number; z: number },
  radius = 3.5,
  pitch = 5.4
): Atom3D[] {
  const atoms: Atom3D[] = [];
  const resNames = ["ALA", "LEU", "ILE", "VAL", "GLU", "GLN", "LYS", "HIS", "MET", "PHE"];
  
  for (let i = 0; i < length; i++) {
    const angle = (i * 100 * Math.PI) / 180; // ~100 degrees per residue
    const zOffset = (i * pitch) / 3.6; // ~1.5A translation per residue
    
    // Normal vectors to the direction (simple ortho calculation)
    const normX = direction.y;
    const normY = -direction.x;
    const normZ = 0;
    
    // Normalize Norman vectors
    const normLen = Math.sqrt(normX*normX + normY*normY) || 1;
    const nx = normX / normLen;
    const ny = normY / normLen;
    
    const binormalX = -ny * direction.z;
    const binormalY = nx * direction.z;
    const binormalZ = nx * direction.y - ny * direction.x;
    
    const bx = binormalX;
    const by = binormalY;
    const bz = binormalZ;

    const radialX = (nx * Math.cos(angle) + bx * Math.sin(angle)) * radius;
    const radialY = (ny * Math.cos(angle) + by * Math.sin(angle)) * radius;
    const radialZ = (normZ * Math.cos(angle) + bz * Math.sin(angle)) * radius;

    const x = startCoord.x + direction.x * zOffset + radialX;
    const y = startCoord.y + direction.y * zOffset + radialY;
    const z = startCoord.z + direction.z * zOffset + radialZ;

    const resInd = residueStart + i;
    const resName = resNames[resInd % resNames.length];

    // Alpha carbon (CA)
    atoms.push({
      x, y, z,
      type: 'CA',
      chain,
      residueIndex: resInd,
      residueName: resName,
      secStruct: 'helix'
    });

    // Side-chain oxygen (O) and Nitrogen (N) for structural texture
    atoms.push({
      x: x + Math.cos(angle + 1) * 1.5,
      y: y + Math.sin(angle + 1) * 1.5,
      z: z + 0.5,
      type: 'O',
      chain,
      residueIndex: resInd,
      residueName: resName,
      secStruct: 'helix'
    });

    atoms.push({
      x: x + Math.cos(angle - 1) * 1.2,
      y: y + Math.sin(angle - 1) * 1.2,
      z: z - 0.5,
      type: 'N',
      chain,
      residueIndex: resInd,
      residueName: resName,
      secStruct: 'helix'
    });
  }
  return atoms;
}

function generateSheetsAtoms(
  chain: string,
  residueStart: number,
  length: number,
  startCoord: { x: number; y: number; z: number },
  endCoord: { x: number; y: number; z: number },
  widthOffset = { x: 0, y: 0, z: 0 }
): Atom3D[] {
  const atoms: Atom3D[] = [];
  const resNames = ["GLY", "VAL", "TYR", "TRP", "PHE", "SER", "THR", "CYS"];
  
  for (let i = 0; i < length; i++) {
    const t = i / (length - 1);
    
    // Zig zag effect representing peptide backbone beta conformation
    const wiggle = (i % 2 === 0 ? 0.8 : -0.8);
    const x = startCoord.x + (endCoord.x - startCoord.x) * t + widthOffset.x * wiggle;
    const y = startCoord.y + (endCoord.y - startCoord.y) * t + widthOffset.y * wiggle;
    const z = startCoord.z + (endCoord.z - startCoord.z) * t + widthOffset.z * wiggle;

    const resInd = residueStart + i;
    const resName = resNames[resInd % resNames.length];

    atoms.push({
      x, y, z,
      type: 'CA',
      chain,
      residueIndex: resInd,
      residueName: resName,
      secStruct: 'sheet'
    });

    atoms.push({
      x: x + 1.2,
      y: y + 0.5,
      z: z - 0.5,
      type: 'O',
      chain,
      residueIndex: resInd,
      residueName: resName,
      secStruct: 'sheet'
    });
  }
  return atoms;
}

function generateCoilsAtoms(
  chain: string,
  residueStart: number,
  length: number,
  startCoord: { x: number; y: number; z: number },
  endCoord: { x: number; y: number; z: number }
): Atom3D[] {
  const atoms: Atom3D[] = [];
  const resNames = ["PRO", "SER", "ASP", "ASN", "GLY", "ALA", "LYS"];
  
  for (let i = 0; i < length; i++) {
    const t = i / (length - 1);
    
    // Smooth loop sine wave curve
    const curveAmp = 3.5 * Math.sin(t * Math.PI);
    const x = startCoord.x + (endCoord.x - startCoord.x) * t;
    const y = startCoord.y + (endCoord.y - startCoord.y) * t + curveAmp;
    const z = startCoord.z + (endCoord.z - startCoord.z) * t + curveAmp * 0.5;

    const resInd = residueStart + i;
    const resName = resNames[resInd % resNames.length];

    atoms.push({
      x, y, z,
      type: 'CA',
      chain,
      residueIndex: resInd,
      residueName: resName,
      secStruct: 'coil'
    });
  }
  return atoms;
}

// Construct protein structures with beautiful folds
export const PRESETS_STRUCTURES: ProteinStructure[] = [
  {
    id: "hemoglobin",
    name: "Hemoglobin (Alpha subunit with Heme Group)",
    uniprotId: "P69905",
    pdbId: "1A3N",
    description: "Monomer subunit of vertebrate oxygen transport protein Hemoglobin. It features 8 distinct right-handed alpha-helices (marked A through H) forming a hydrophobic pocket that coordinates a crucial Heme B prosthetic group holding an iron atom.",
    organism: "Homo sapiens (Human)",
    length: 141,
    molecularWeight: "15.1 kDa",
    secondaryStructureBreakdown: { helices: 78, sheets: 0, coils: 22 },
    helicesRanges: [
      { start: 4, end: 18, chain: 'A' },
      { start: 21, end: 35, chain: 'A' },
      { start: 37, end: 41, chain: 'A' },
      { start: 53, end: 71, chain: 'A' },
      { start: 73, end: 79, chain: 'A' },
      { start: 81, end: 89, chain: 'A' },
      { start: 95, end: 112, chain: 'A' },
      { start: 119, end: 138, chain: 'A' }
    ],
    sheetsRanges: [],
    features: [
      { name: "Heme Binding (Proximal His)", range: "87", type: "Active Site", description: "Coordination bond to Heme iron atom (His87)" },
      { name: "Heme Binding (Distal His)", range: "58", type: "Active Site", description: "Stabilizes the bound dialkyl-oxygen molecule through hydrogen bonding (His58)" },
      { name: "Cooperativity Interface", range: "92-96", type: "Inhibitory / Regulatory", description: "Interaction domain mediating transition between relaxed (R) and tense (T) quaternary states" }
    ],
    atoms: [
      // Draw 8 Interconnecting helices
      ...generateHelicesAtoms('A', 4, 15, "PRO", { x: -20, y: -20, z: -5 }, { x: 1, y: 0.5, z: 0.3 }), // Helix A
      ...generateCoilsAtoms('A', 19, 2, { x: -5, y: -12.5, z: -0.5 }, { x: -8, y: -10, z: 5 }), // Loop AB
      ...generateHelicesAtoms('A', 21, 15, "ALA", { x: -8, y: -10, z: 5 }, { x: -0.5, y: 1, z: -0.2 }), // Helix B
      ...generateCoilsAtoms('A', 36, 1, { x: -14.5, y: 3, z: 2.4 }, { x: -12, y: 5, z: -2 }),
      ...generateHelicesAtoms('A', 37, 5, "PRO", { x: -12, y: 5, z: -2 }, { x: 0.2, y: 0.8, z: 0.8 }), // Helix C
      ...generateCoilsAtoms('A', 42, 11, { x: -11, y: 9, z: 2 }, { x: -1, y: 1, z: 12 }), // Loop CD
      ...generateHelicesAtoms('A', 53, 19, "GLY", { x: -1, y: 1, z: 12 }, { x: 1, y: -0.8, z: -0.6 }), // Helix E
      ...generateCoilsAtoms('A', 72, 1, { x: 18, y: -14.2, z: 0.6 }, { x: 15, y: -13, z: -5 }),
      ...generateHelicesAtoms('A', 73, 7, "VAL", { x: 15, y: -13, z: -5 }, { x: -0.8, y: 0.2, z: -1 }), // Helix F
      ...generateCoilsAtoms('A', 80, 1, { x: 9.4, y: -11.6, z: -12 }, { x: 5, y: -8, z: -15 }),
      ...generateHelicesAtoms('A', 81, 9, "ASP", { x: 5, y: -8, z: -15 }, { x: -0.5, y: 0.8, z: -0.5 }), // Helix FG
      ...generateCoilsAtoms('A', 90, 5, { x: 0.5, y: -0.8, z: -19.5 }, { x: -5, y: 15, z: -10 }),
      ...generateHelicesAtoms('A', 95, 18, "ASP", { x: -5, y: 15, z: -10 }, { x: 0.5, y: -1.2, z: 0.6 }), // Helix G
      ...generateCoilsAtoms('A', 113, 6, { x: 4, y: -6.6, z: 0.8 }, { x: 1, y: -2, z: 8 }),
      ...generateHelicesAtoms('A', 119, 20, "ALA", { x: 1, y: -2, z: 8 }, { x: -0.8, y: 0.3, z: -1.5 }), // Helix H
      ...generateCoilsAtoms('A', 139, 3, { x: -15, y: 4, z: -22 }, { x: -18, y: 2, z: -25 }),
      
      // HEME GROUP: Central Ring complex around (0,0,0) - represented by customized sulfur type atoms
      { x: -1.5, y: -1.5, z: -3.5, type: 'FE', chain: 'H', residueIndex: 1, residueName: 'HEM' }, // Central Iron
      // Heme Porphyrin Nitrogen atoms
      { x: -0.5, y: -2.3, z: -2.5, type: 'N', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -2.5, y: -0.7, z: -3.5, type: 'N', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -2.5, y: -2.3, z: -4.5, type: 'N', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -0.5, y: -0.7, z: -2.5, type: 'N', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      // Ring Carbon atoms (creates a beautiful flat square surrounding the iron)
      { x: 1, y: -3, z: -2.0, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: 1, y: -1, z: -1.5, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -1, y: 1, z: -2.0, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -3, y: 1, z: -3.5, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -4, y: -1, z: -4.5, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -3, y: -3, z: -5.0, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: -1, y: -4, z: -4.5, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' },
      { x: 1, y: -4, z: -3.5, type: 'C', chain: 'H', residueIndex: 1, residueName: 'HEM' }
    ]
  },
  {
    id: "gfp",
    name: "Green Fluorescent Protein (GFP)",
    uniprotId: "P42212",
    pdbId: "1EMA",
    description: "Consists of 238 amino acids. Structurally, it forms a classic pristine 11-stranded antiparallel beta-barrel (the 'beta-can') enclosing an alpha-helix that runs along the central axis containing the fluorescent tripeptide chromophore (S65-Y66-G67).",
    organism: "Aequorea victoria (Jellyfish)",
    length: 238,
    molecularWeight: "26.9 kDa",
    secondaryStructureBreakdown: { helices: 8, sheets: 68, coils: 24 },
    helicesRanges: [
      { start: 56, end: 72, chain: 'A' }
    ],
    sheetsRanges: [
      { start: 10, end: 25, chain: 'A' },
      { start: 28, end: 41, chain: 'A' },
      { start: 44, end: 54, chain: 'A' },
      { start: 78, end: 90, chain: 'A' },
      { start: 94, end: 110, chain: 'A' },
      { start: 114, end: 125, chain: 'A' },
      { start: 130, end: 142, chain: 'A' },
      { start: 145, end: 158, chain: 'A' },
      { start: 161, end: 173, chain: 'A' },
      { start: 195, end: 209, chain: 'A' },
      { start: 212, end: 230, chain: 'A' }
    ],
    features: [
      { name: "Active Chromophore", range: "65-67", type: "Catalytic / Structural", description: "Imidazolidinone ring formed of -Ser-Tyr-Gly- that yields highly stable green fluorescence upon oxygen oxidation" },
      { name: "Beta-Can Shield", range: "11-230", type: "Structural Domain", description: "11-stranded rigid beta barrel structure that isolates the auto-catalytic chromophore from bulk water quenching" }
    ],
    atoms: [
      // Let's create an 11-stranded beta-barrel. Placed as a neat cylinder around (0,0) with height.
      // Top circle and bottom circle.
      ...generateSheetsAtoms('A', 10, 10, { x: 12 * Math.cos(0), y: -15, z: 12 * Math.sin(0) }, { x: 12 * Math.cos(0.5), y: 15, z: 12 * Math.sin(0.5) }, { x: -2, y: 0, z: 2 }),
      ...generateSheetsAtoms('A', 28, 10, { x: 12 * Math.cos(0.5), y: 15, z: 12 * Math.sin(0.5) }, { x: 12 * Math.cos(1.1), y: -15, z: 12 * Math.sin(1.1) }),
      ...generateSheetsAtoms('A', 44, 10, { x: 12 * Math.cos(1.1), y: -15, z: 12 * Math.sin(1.1) }, { x: 12 * Math.cos(1.7), y: 15, z: 12 * Math.sin(1.7) }),
      ...generateSheetsAtoms('A', 78, 10, { x: 12 * Math.cos(1.7), y: 15, z: 12 * Math.sin(1.7) }, { x: 12 * Math.cos(2.3), y: -15, z: 12 * Math.sin(2.3) }),
      ...generateSheetsAtoms('A', 94, 10, { x: 12 * Math.cos(2.3), y: -15, z: 12 * Math.sin(2.3) }, { x: 12 * Math.cos(2.9), y: 15, z: 12 * Math.sin(2.9) }),
      ...generateSheetsAtoms('A', 114, 10, { x: 12 * Math.cos(2.9), y: 15, z: 12 * Math.sin(2.9) }, { x: 12 * Math.cos(3.5), y: -15, z: 12 * Math.sin(3.5) }),
      ...generateSheetsAtoms('A', 130, 10, { x: 12 * Math.cos(3.5), y: -15, z: 12 * Math.sin(3.5) }, { x: 12 * Math.cos(4.1), y: 15, z: 12 * Math.sin(4.1) }),
      ...generateSheetsAtoms('A', 145, 10, { x: 12 * Math.cos(4.1), y: 15, z: 12 * Math.sin(4.1) }, { x: 12 * Math.cos(4.7), y: -15, z: 12 * Math.sin(4.7) }),
      ...generateSheetsAtoms('A', 161, 10, { x: 12 * Math.cos(4.7), y: -15, z: 12 * Math.sin(4.7) }, { x: 12 * Math.cos(5.3), y: 15, z: 12 * Math.sin(5.3) }),
      ...generateSheetsAtoms('A', 195, 10, { x: 12 * Math.cos(5.3), y: 15, z: 12 * Math.sin(5.3) }, { x: 12 * Math.cos(5.9), y: -15, z: 12 * Math.sin(5.9) }),
      ...generateSheetsAtoms('A', 212, 10, { x: 12 * Math.cos(5.9), y: -15, z: 12 * Math.sin(5.9) }, { x: 12 * Math.cos(6.28), y: 15, z: 12 * Math.sin(6.28) }),
      
      // Connecting loops mapping around top and bottom borders
      ...generateCoilsAtoms('A', 26, 2, { x: 12, y: -15, z: 0 }, { x: 12 * Math.cos(0.5), y: 15, z: 12 * Math.sin(0.5) }),
      
      // Central Helix containing chromophore
      ...generateHelicesAtoms('A', 56, 16, "SER", { x: 0, y: -10, z: 0 }, { x: 0.1, y: 1.5, z: -0.1 }, 1.5, 3.5),
      
      // Green Chromophore Atoms inside central core - glowing fluorescent sulphur styles
      { x: 0.5, y: -1, z: 0.2, type: 'S', chain: 'C', residueIndex: 66, residueName: 'CRO' }, // TYR-66 Phenol Ring center
      { x: -0.5, y: -0.5, z: 1.5, type: 'FE', chain: 'C', residueIndex: 66, residueName: 'CRO' }, // core bright glow emitter anchor
      { x: -1.7, y: -0.1, z: 2.2, type: 'O', chain: 'C', residueIndex: 66, residueName: 'CRO' },
      { x: 1.5, y: -1.2, z: -1.2, type: 'C', chain: 'C', residueIndex: 66, residueName: 'CRO' },
      { x: 2.2, y: -1.8, z: -2.3, type: 'O', chain: 'C', residueIndex: 66, residueName: 'CRO' }
    ]
  },
  {
    id: "gpcb2",
    name: "Beta-2 Adrenergic Receptor (GPCR 7TM)",
    uniprotId: "P07550",
    pdbId: "2RH1",
    description: "A prominent G-protein coupled receptor. It comprises an extracellular N-terminus, 3 extracellular loops, 3 intracellular loops, dual palmitoylation intracellular residues, and a critical core bundle of 7 trans-membrane alpha-helices capturing ligands such as adrenaline.",
    organism: "Homo sapiens (Human)",
    length: 413,
    molecularWeight: "46.5 kDa",
    secondaryStructureBreakdown: { helices: 72, sheets: 0, coils: 28 },
    helicesRanges: [
      { start: 34, end: 60, chain: 'A' },
      { start: 67, end: 96, chain: 'A' },
      { start: 103, end: 136, chain: 'A' },
      { start: 147, end: 171, chain: 'A' },
      { start: 197, end: 229, chain: 'A' },
      { start: 267, end: 306, chain: 'A' },
      { start: 315, end: 342, chain: 'A' }
    ],
    sheetsRanges: [],
    features: [
      { name: "Ligand Pocket (Asp113)", range: "113", type: "Active Site", description: "Anchors catecholamine ligands through electrostatic carboxylate salt bridge interactions" },
      { name: "G-Protein Activation DRY Motif", range: "130-132", type: "Catalytic / Structural", description: "Conserved Asp-Arg-Tyr motif on TM3 that blocks or triggers G-protein subunit coupled exchange" }
    ],
    atoms: [
      // 7 bundle TM helices arranged in circular hexagonal pattern punch through membrane z = [-15, 15]
      ...generateHelicesAtoms('A', 34, 25, "LEU", { x: -8 * Math.cos(0 * Math.PI/3.5), y: -8 * Math.sin(0 * Math.PI/3.5), z: -18 }, { x: 0.1, y: 0.1, z: 1.5 }), // TM1
      ...generateHelicesAtoms('A', 67, 28, "ILE", { x: -8 * Math.cos(1 * Math.PI/3.5), y: -8 * Math.sin(1 * Math.PI/3.5), z: 18 }, { x: -0.1, y: 0.05, z: -1.3 }), // TM2
      ...generateHelicesAtoms('A', 103, 30, "ASP", { x: -8 * Math.cos(2 * Math.PI/3.5), y: -8 * Math.sin(2 * Math.PI/3.5), z: -18 }, { x: 0.05, y: -0.1, z: 1.3 }), // TM3
      ...generateHelicesAtoms('A', 147, 24, "PHE", { x: -8 * Math.cos(3 * Math.PI/3.5), y: -8 * Math.sin(3 * Math.PI/3.5), z: 16 }, { x: 0.1, y: -0.05, z: -1.4 }), // TM4
      ...generateHelicesAtoms('A', 197, 30, "VAL", { x: -8 * Math.cos(4 * Math.PI/3.5), y: -8 * Math.sin(4 * Math.PI/3.5), z: -18 }, { x: -0.05, y: 0.1, z: 1.4 }), // TM5
      ...generateHelicesAtoms('A', 267, 34, "TRP", { x: -8 * Math.cos(5 * Math.PI/3.5), y: -8 * Math.sin(5 * Math.PI/3.5), z: 20 }, { x: 0.05, y: -0.05, z: -1.2 }), // TM6
      ...generateHelicesAtoms('A', 315, 26, "TYR", { x: -8 * Math.cos(6 * Math.PI/3.5), y: -8 * Math.sin(6 * Math.PI/3.5), z: -16 }, { x: -0.1, y: 0.1, z: 1.5 }), // TM7

      // Transcellular connecting loop strings
      ...generateCoilsAtoms('A', 61, 5, { x: -8, y: 0, z: 19.5 }, { x: -4, y: 6.9, z: 18 }), // ECL1
      ...generateCoilsAtoms('A', 97, 5, { x: -4, y: 6.9, z: -18.4 }, { x: 4, y: 6.9, z: -18.4 }), // ICL1
      
      // Ligand molecule in the center binding core (represented as highly descriptive chemical compound sulfur atom)
      { x: -1, y: 0, z: 2, type: 'S', chain: 'L', residueIndex: 1, residueName: 'CAR' }, // Carazolol inhibitor ligand
      { x: 0.8, y: 0.2, z: 1, type: 'FE', chain: 'L', residueIndex: 1, residueName: 'CAR' },
      { x: -2.3, y: -1, z: 2.8, type: 'O', chain: 'L', residueIndex: 1, residueName: 'CAR' },
      { x: -0.5, y: 1.8, z: 1.8, type: 'N', chain: 'L', residueIndex: 1, residueName: 'CAR' }
    ]
  },
  {
    id: "insulin_dimer",
    name: "Insulin (Active Hexamer Subunit)",
    uniprotId: "P01308",
    pdbId: "4INS",
    description: "Insulin is synthesized as a single-chain precursor (proinsulin) which is proteolytically cleaved into Chain A (21 residues) and Chain B (30 residues) linked firmly by dual inter-chain disulfide bridges and one internal intra-chain disulfide loop.",
    organism: "Homo sapiens (Human)",
    length: 51,
    molecularWeight: "5.8 kDa",
    secondaryStructureBreakdown: { helices: 52, sheets: 0, coils: 48 },
    helicesRanges: [
      { start: 2, end: 8, chain: 'A' },
      { start: 13, end: 19, chain: 'A' },
      { start: 9, end: 19, chain: 'B' }
    ],
    sheetsRanges: [],
    features: [
      { name: "Disulfide CysA7-CysB7", range: "A7 - B7", type: "Active Site", description: "Covalent disulfide link crucial for molecule folding stability" },
      { name: "Disulfide CysA20-CysB19", range: "A20 - B19", type: "Active Site", description: "Disulfide bond critical for signaling conformation binding receptor" },
      { name: "Disulfide Intrachain Loop", range: "A6 - A11", type: "Structural Domain", description: "Conserved internal link shaping active receptor interface site" }
    ],
    atoms: [
      // Chain A: 21 residues, 2 helices linked by loops
      ...generateHelicesAtoms('A', 1, 8, "GLY", { x: -10, y: -6, z: 5 }, { x: 0.8, y: -0.2, z: 0.5 }, 2, 3), // Helix A1
      ...generateCoilsAtoms('A', 9, 3, { x: -3.5, y: -7.5, z: 8.5 }, { x: 2, y: -5, z: 4 }), // Loop A
      ...generateHelicesAtoms('A', 12, 8, "SER", { x: 2, y: -5, z: 4 }, { x: -0.5, y: 1.2, z: -0.6 }, 2, 3), // Helix A2
      ...generateCoilsAtoms('A', 20, 2, { x: -1.5, y: 4.6, z: -0.8 }, { x: -4, y: 6, z: -3 }),
      
      // Chain B: 30 residues, 1 long central helix flanked by terminal tails
      ...generateCoilsAtoms('B', 1, 8, { x: -14, y: 10, z: -10 }, { x: -5, y: 2, z: -4 }), // N-terminal tail
      ...generateHelicesAtoms('B', 9, 12, "SER", { x: -5, y: 2, z: -4 }, { x: 1.2, y: -0.8, z: 0.8 }), // TM central Helix B
      ...generateCoilsAtoms('B', 21, 10, { x: 7, y: -6, z: 4 }, { x: 12, y: -12, z: 12 }), // C-terminal tail

      // Highlight custom covalent bond linkages using sulfur atoms
      { x: -5.1, y: -6.5, z: 6, type: 'S', chain: 'A', residueIndex: 7, residueName: 'CYS' }, // Disulfide sulfur A7
      { x: -5.2, y: 2.1, z: -3.8, type: 'S', chain: 'B', residueIndex: 7, residueName: 'CYS' }, // Disulfide sulfur B7
      
      { x: -1, y: 4, z: -0.2, type: 'S', chain: 'A', residueIndex: 20, residueName: 'CYS' }, // Disulfide sulfur A20
      { x: 5.8, y: -5.1, z: 3.1, type: 'S', chain: 'B', residueIndex: 19, residueName: 'CYS' } // Disulfide sulfur B19
    ]
  }
];
