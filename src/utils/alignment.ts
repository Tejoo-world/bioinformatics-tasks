export interface AlignedPair {
  seqA: string;
  seqB: string;
  score: number;
}

// Simple Needleman-Wunsch Pairwise Global Alignment
export function alignPair(seqA: string, seqB: string): AlignedPair {
  const matchScore = 2;
  const mismatchScore = -1;
  const gapScore = -2;

  const n = seqA.length;
  const m = seqB.length;

  const dp: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * gapScore;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gapScore;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = dp[i - 1][j - 1] + (seqA[i - 1] === seqB[j - 1] ? matchScore : mismatchScore);
      const deleteOp = dp[i - 1][j] + gapScore;
      const insertOp = dp[i][j - 1] + gapScore;
      dp[i][j] = Math.max(match, deleteOp, insertOp);
    }
  }

  let alignedA = "";
  let alignedB = "";
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const score = dp[i][j];
      const match = dp[i - 1][j - 1] + (seqA[i - 1] === seqB[j - 1] ? matchScore : mismatchScore);
      const deleteOp = dp[i - 1][j] + gapScore;

      if (score === match) {
        alignedA = seqA[i - 1] + alignedA;
        alignedB = seqB[j - 1] + alignedB;
        i--;
        j--;
      } else if (score === deleteOp) {
        alignedA = seqA[i - 1] + alignedA;
        alignedB = "-" + alignedB;
        i--;
      } else {
        alignedA = "-" + alignedA;
        alignedB = seqB[j - 1] + alignedB;
        j--;
      }
    } else if (i > 0) {
      alignedA = seqA[i - 1] + alignedA;
      alignedB = "-" + alignedB;
      i--;
    } else {
      alignedA = "-" + alignedA;
      alignedB = seqB[j - 1] + alignedB;
      j--;
    }
  }

  return { seqA: alignedA, seqB: alignedB, score: dp[n][m] };
}

// Progressive Multiple Sequence Alignment (MSA)
// Uses the longest sequence as the initial seed/profile, then aligns subsequent sequences to it, propagating gaps.
export function performMSA(sequences: { id: string; name: string; sequence: string }[]): {
  id: string;
  name: string;
  sequence: string;
}[] {
  if (sequences.length <= 1) {
    return sequences.map(s => ({ ...s }));
  }

  // Sort sequences by length descending
  const sorted = [...sequences].sort((a, b) => b.sequence.length - a.sequence.length);
  
  // Start with the longest sequence as seed profile
  let msaResults: { id: string; name: string; sequence: string }[] = [
    { id: sorted[0].id, name: sorted[0].name, sequence: sorted[0].sequence }
  ];

  for (let k = 1; k < sorted.length; k++) {
    const nextSeqObj = sorted[k];
    
    // Align nextSeq to the first sequence in the currently aligned set (as our proxy profile seed)
    const seedAligned = msaResults[0].sequence;
    // Strip gaps to get raw original sequence for the next pairwise alignment
    const nextRaw = nextSeqObj.sequence.replace(/-/g, "");
    
    const alignment = alignPair(seedAligned.replace(/-/g, ""), nextRaw);
    
    // Now we must propagate the newly introduced gaps back to all previously aligned sequences in our MSA set.
    const newSeedAligned = alignment.seqA;
    const newNextAligned = alignment.seqB;
    
    const updatedMsa: { id: string; name: string; sequence: string }[] = [];
    
    // Gap mapping indices
    let seedIdx = 0;
    const gapMap: boolean[] = []; // true if new hole / gap was introduced at this pos in first sequence
    
    for (let c = 0; c < newSeedAligned.length; c++) {
      if (newSeedAligned[c] === "-") {
        gapMap.push(true);
      } else {
        gapMap.push(false);
        seedIdx++;
      }
    }

    // Adapt all existing aligned sequences to match the new seed alignment gap pattern
    for (const item of msaResults) {
      let currentIdx = 0;
      let reconstructed = "";
      
      for (const isGap of gapMap) {
        if (isGap) {
          reconstructed += "-";
        } else {
          // Keep current character (whether amino acid or pre-existing gap)
          while (currentIdx < item.sequence.length && item.sequence[currentIdx] === "-") {
            reconstructed += "-";
            currentIdx++;
          }
          if (currentIdx < item.sequence.length) {
            reconstructed += item.sequence[currentIdx];
            currentIdx++;
          } else {
            reconstructed += "-";
          }
        }
      }
      
      updatedMsa.push({
        id: item.id,
        name: item.name,
        sequence: reconstructed
      });
    }

    // Add the new aligned sequence
    let nextRecon = "";
    let nextIdx = 0;
    
    for (const isGap of gapMap) {
      if (isGap) {
        nextRecon += "-";
      } else {
        while (nextIdx < newNextAligned.length && newNextAligned[nextIdx] === "-") {
          nextRecon += "-";
          nextIdx++;
        }
        if (nextIdx < newNextAligned.length) {
          nextRecon += newNextAligned[nextIdx];
          nextIdx++;
        } else {
          nextRecon += "-";
        }
      }
    }

    updatedMsa.push({
      id: nextSeqObj.id,
      name: nextSeqObj.name,
      sequence: nextRecon
    });

    msaResults = updatedMsa;
  }

  // Pads all results to be of equal length (if any edge-case offsets exist)
  const maxLen = Math.max(...msaResults.map(r => r.sequence.length));
  return msaResults.map(item => {
    let seq = item.sequence;
    if (seq.length < maxLen) {
      seq += "-".repeat(maxLen - seq.length);
    }
    return { ...item, sequence: seq };
  });
}

// Compute Conservation Scores and Consensus
export function computeConsensus(aligned: { id: string; name: string; sequence: string }[]): {
  consensus: string;
  conservation: number[];
} {
  if (aligned.length === 0) return { consensus: "", conservation: [] };

  const seqLen = aligned[0].sequence.length;
  let consensus = "";
  const conservation: number[] = [];

  for (let c = 0; c < seqLen; c++) {
    const counts: { [char: string]: number } = {};
    let nonGaps = 0;

    for (const item of aligned) {
      const char = item.sequence[c];
      if (char && char !== "-") {
        counts[char] = (counts[char] || 0) + 1;
        nonGaps++;
      }
    }

    if (nonGaps === 0) {
      consensus += "-";
      conservation.push(0);
      continue;
    }

    // Find most frequent character at this alignment column
    let maxChar = "-";
    let maxCount = 0;
    for (const char in counts) {
      if (counts[char] > maxCount) {
        maxCount = counts[char];
        maxChar = char;
      }
    }

    // Conservation is ratio of predominant character relative to total sequences
    const ratio = maxCount / aligned.length;
    const score = Math.round(ratio * 10); // scale 0 to 10
    conservation.push(score);

    // If highly conserved (majority match), place it in consensus, else place low-case or gap
    if (ratio >= 0.6) {
      consensus += maxChar;
    } else if (ratio >= 0.3) {
      consensus += maxChar.toLowerCase();
    } else {
      consensus += ".";
    }
  }

  return { consensus, conservation };
}

// Pre-packaged motifs of standard protein families to show before server AI analysis
export function getStaticMotifs(presetId: string): {
  name: string;
  start: number;
  end: number;
  pattern: string;
  description: string;
}[] {
  if (presetId === "globins") {
    return [
      {
        name: "Distal Histidine Anchor",
        start: 55,
        end: 62,
        pattern: "HGKKVAD",
        description: "Historically conserved distal pocket region containing His58, which coordinates and binds oxygen molecules securely."
      },
      {
        name: "Proximal Histidine Core",
        start: 83,
        end: 90,
        pattern: "HAHKLRV",
        description: "Vital proximal pocket containing His87, which directly coordinates the ferrous iron atom at the heme core."
      }
    ];
  } else if (presetId === "insulins") {
    return [
      {
        name: "Disulfide Chain A Region",
        start: 80,
        end: 95,
        pattern: "GIVEQCCTSICSL",
        description: "Region hosting the conserved Cys-Cys-Thr-Ser-Ile-Cys sequence responsible for A-chain structural stabilization."
      }
    ];
  } else if (presetId === "cytochromes") {
    return [
      {
        name: "Heme Linkage CXXCH",
        start: 12,
        end: 18,
        pattern: "CSQCHT",
        description: "Mitochondrial consensus template Cys-X-X-Cys-His bound covalently to the iron protoporphyrin core."
      }
    ];
  } else if (presetId === "viral_spike") {
    return [
      {
        name: "Receptor Core Binding Motif (RBM)",
        start: 130,
        end: 145,
        pattern: "FPLQSYGFQPTNGVG",
        description: "Primary binding interface loops interacting directly with human ACE2 cell surface peptidase receptors."
      }
    ];
  }
  return [];
}
