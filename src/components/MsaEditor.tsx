import React, { useState } from 'react';
import { ProteinSequence, AlignmentResult } from '../types';
import { MSA_PRESETS, PRESETS_STRUCTURES } from '../data/proteins';
import { performMSA, computeConsensus, getStaticMotifs } from '../utils/alignment';
import { motion } from 'motion/react';
import { Play, Sparkles, HelpCircle, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

export default function MsaEditor() {
  const [activePreset, setActivePreset] = useState<string>('globins');
  const [sequences, setSequences] = useState<ProteinSequence[]>(
    MSA_PRESETS['globins'].sequences
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [alignedResults, setAlignedResults] = useState<AlignmentResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMotifIndex, setSelectedMotifIndex] = useState<number | null>(null);
  const [copyAck, setCopyAck] = useState<boolean>(false);

  // Custom pasting and typing FASTA sequence states
  const [fastaInput, setFastaInput] = useState<string>('');
  const [fastaError, setFastaError] = useState<string>('');

  const aminoAcidColors: { [key: string]: { bg: string; text: string; desc: string } } = {
    // Aliphatic hydrophobic (Yellow)
    'A': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', desc: 'Hydrophobic Aliphatic' },
    'I': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', desc: 'Hydrophobic Aliphatic' },
    'L': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', desc: 'Hydrophobic Aliphatic' },
    'M': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', desc: 'Hydrophobic Aliphatic' },
    'V': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', desc: 'Hydrophobic Aliphatic' },
    
    // Acidic (Red)
    'D': { bg: 'bg-red-100 border-red-300', text: 'text-red-700 font-semibold', desc: 'Acidic Negative' },
    'E': { bg: 'bg-red-100 border-red-300', text: 'text-red-700 font-semibold', desc: 'Acidic Negative' },
    
    // Basic (Blue)
    'H': { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-700 font-semibold', desc: 'Basic Positive' },
    'K': { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-700 font-semibold', desc: 'Basic Positive' },
    'R': { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-700 font-semibold', desc: 'Basic Positive' },
    
    // Polar Uncharged (Green)
    'N': { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', desc: 'Polar Amide' },
    'Q': { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', desc: 'Polar Amide' },
    'S': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', desc: 'Polar Hydroxyl' },
    'T': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', desc: 'Polar Hydroxyl' },
    
    // Aromatic (Purple)
    'F': { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', desc: 'Hydrophobic Aromatic' },
    'W': { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', desc: 'Hydrophobic Aromatic' },
    'Y': { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', desc: 'Hydrophobic Aromatic' },
    
    // Tiny/Unique (Orange)
    'G': { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', desc: 'Small Flexible' },
    'P': { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-850', desc: 'Imine Helix-Breaker' },
    'C': { bg: 'bg-teal-100 border-teal-300', text: 'text-teal-900 font-bold', desc: 'Sulfur Disulfide Covalent' },
    
    // Gaps and Unknowns
    '-': { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-400', desc: 'Deletion Gap' }
  };

  const getLetterStyle = (char: string, index: number) => {
    const isConserved = alignedResults && alignedResults.conservation[index] >= 8;
    const styleObj = aminoAcidColors[char] || { bg: 'bg-white border-gray-100', text: 'text-gray-600', desc: 'Unknown' };
    
    // If inside a selected motif highlight outline
    let isMotified = false;
    if (selectedMotifIndex !== null && alignedResults) {
      const m = alignedResults.motifs[selectedMotifIndex];
      if (index >= m.start && index <= m.end) {
        isMotified = true;
      }
    }

    return `${styleObj.bg} ${styleObj.text} ${isConserved ? 'ring-2 ring-violet-500 ring-offset-1 font-bold scale-[1.03]' : ''} ${isMotified ? 'border-2 border-violet-800 bg-violet-200 scale-105 z-10 font-black font-mono shadow-sm' : ''}`;
  };

  const loadPreset = (id: string) => {
    setActivePreset(id);
    setSequences(MSA_PRESETS[id].sequences);
    setAlignedResults(null);
    setSelectedMotifIndex(null);
    setFastaInput('');
    setFastaError('');
  };

  const handleSequenceChange = (index: number, newSeq: string) => {
    const updated = [...sequences];
    updated[index].sequence = newSeq.toUpperCase().replace(/[^A-Z-]/g, "");
    setSequences(updated);
  };

  const parseFastaAndAdd = () => {
    if (!fastaInput.trim()) {
      setFastaError('Please enter FASTA raw sequence string');
      return;
    }
    
    try {
      const lines = fastaInput.split('\n');
      const parsed: ProteinSequence[] = [];
      let curId = "";
      let curName = "";
      let curSeq = "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('>')) {
          if (curId) {
            parsed.push({
              id: curId,
              name: curName || curId,
              organism: "Custom User Organism",
              accession: curId,
              sequence: curSeq.toUpperCase().replace(/[^A-Z-]/g, "")
            });
          }
          const header = trimmed.substring(1);
          const parts = header.split('|');
          curId = parts[0] || `USR_${Date.now()}`;
          curName = parts[1] || parts[0];
          curSeq = "";
        } else {
          curSeq += trimmed;
        }
      }

      if (curId) {
        parsed.push({
          id: curId,
          name: curName || curId,
          organism: "Custom Pasted Organism",
          accession: curId,
          sequence: curSeq.toUpperCase().replace(/[^A-Z-]/g, "")
        });
      }

      if (parsed.length < 2) {
        // Assume raw raw sequence with no fasta header
        if (fastaInput.replace(/[^A-Z]/gi, "").length > 5) {
          const simpleSeq = fastaInput.toUpperCase().replace(/[^A-Z-]/g, "");
          parsed.push({
            id: `RAW_SEQ_${sequences.length + 1}`,
            name: `User Sequence ${sequences.length + 1}`,
            organism: "Custom Paste",
            accession: "RAW",
            sequence: simpleSeq
          });
        } else {
          throw new Error("Could not parse FASTA structure. Format requirement: >Header\\nSequenceLines");
        }
      }

      setSequences([...sequences, ...parsed]);
      setActivePreset('custom');
      setFastaInput('');
      setFastaError('');
    } catch (e: any) {
      setFastaError(e.message || "Invalid FASTA format");
    }
  };

  const handleTriggerMSA = async () => {
    if (sequences.length < 2) {
      alert("At least 2 sequences of consistent family are required to align.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Run Dynamic Programming math client-side progressively instantly
      const aligned = performMSA(sequences);
      const { consensus, conservation } = computeConsensus(aligned);
      
      // Get predefined biological motifs based on active preset
      const staticMotifs = getStaticMotifs(activePreset);

      // 2. Fetch Deep Gemini evolutionary annotation from full-stack server
      const response = await fetch('/api/msa/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alignedSequences: aligned,
          familyName: MSA_PRESETS[activePreset]?.name || "Custom Mixed Sequences",
          consensus
        })
      });

      const resText = await response.json();
      
      setAlignedResults({
        alignedSequences: aligned,
        consensus,
        conservation,
        motifs: staticMotifs,
        interpretation: resText.interpretation || "Failed to download AI interpretation"
      });

    } catch (e) {
      console.error(e);
      // Fallback
      const aligned = performMSA(sequences);
      const { consensus, conservation } = computeConsensus(aligned);
      setAlignedResults({
        alignedSequences: aligned,
        consensus,
        conservation,
        motifs: getStaticMotifs(activePreset),
        interpretation: "### Execution Completed\nProgressive alignment performed. (Setup GEMINI_API_KEY for evolutionary notes)."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyFASTA = () => {
    if (!alignedResults) return;
    const fasta = alignedResults.alignedSequences
      .map(s => `>${s.id} | ${s.name}\n${s.sequence}`)
      .join('\n');
    navigator.clipboard.writeText(fasta);
    setCopyAck(true);
    setTimeout(() => setCopyAck(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="msa-editor-root">
      {/* LEFT COLUMN: Controls & Paste Sequences */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧬 MSA Studio <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">Task 2</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose a protein family or paste FASTA formats to compute Multiple Sequence Alignments with Needleman-Wunsch math.
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Protein Family</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(MSA_PRESETS).map((key) => (
              <button
                key={key}
                id={`preset-btn-${key}`}
                onClick={() => loadPreset(key)}
                className={`py-2 px-3 text-left text-xs rounded-xl font-medium border transition-all ${
                  activePreset === key
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {MSA_PRESETS[key].name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Paste Box */}
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add Custom FASTA Sequence</label>
          <textarea
            id="fasta-textarea"
            rows={4}
            value={fastaInput}
            onChange={(e) => setFastaInput(e.target.value)}
            placeholder=">GENE_A | Custom protein\nMSEVALYLVCGERGFFY..."
            className="w-full text-xs font-mono p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {fastaError && (
            <p className="text-[10px] text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} className="shrink-0" /> {fastaError}
            </p>
          )}
          <button
            id="add-fasta-btn"
            onClick={parseFastaAndAdd}
            className="w-full py-2 px-4 border border-indigo-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-800 rounded-xl text-xs font-semibold transition"
          >
            + Parse & Append Sequence
          </button>
        </div>

        {/* Current sequences roster */}
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 flex-1">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Sequences in Queue ({sequences.length})</span>
            <button 
              id="clear-seq-btn"
              onClick={() => {
                setSequences([]);
                setAlignedResults(null); 
                setActivePreset('custom');
              }}
              className="text-[10px] text-red-500 hover:underline normal-case"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
            {sequences.map((seq, i) => (
              <div key={seq.id + i} id={`queue-item-${i}`} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs flex flex-col relative group">
                <div className="flex justify-between font-semibold text-gray-700">
                  <span className="truncate max-w-[150px]">{seq.id}</span>
                  <span className="text-[10px] text-gray-450 italic">{seq.sequence.length} aa</span>
                </div>
                <div className="text-[10px] text-gray-450 truncate mt-0.5">{seq.organism}</div>
                
                {editingIndex === i ? (
                  <textarea
                    rows={2}
                    value={seq.sequence}
                    onChange={(e) => handleSequenceChange(i, e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    autoFocus
                    className="w-full text-[10px] font-mono mt-2 p-1 bg-white border border-indigo-400 rounded focus:outline-none"
                  />
                ) : (
                  <div 
                    onClick={() => setEditingIndex(i)}
                    className="text-[10px] font-mono text-gray-400 mt-1 cursor-pointer truncate max-w-[220px] bg-white border border-gray-150 p-1 hover:border-indigo-400 transition"
                    title="Click to edit sequence residues"
                  >
                    {seq.sequence}
                  </div>
                )}

                <button
                  id={`remove-btn-${i}`}
                  onClick={() => setSequences(sequences.filter((_, idx) => idx !== i))}
                  className="absolute right-2 top-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-[10px]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Execute MSA Action block */}
        <button
          id="execute-msa-btn"
          disabled={isLoading || sequences.length < 2}
          onClick={handleTriggerMSA}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-violet-100 hover:shadow-violet-200 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Progressive Alignment Active...
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Perform Multiple Sequence Alignment
            </>
          )}
        </button>
      </div>

      {/* RIGHT COLUMN: Sequence alignment viewer and AI reasoning */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Alignment Display Grid Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                Alignment Results Matrix
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Each block represents an aligned amino acid index. Alignments include dynamic gap placements (-).
              </p>
            </div>
            {alignedResults && (
              <div className="flex gap-2">
                <button
                  id="copy-fasta-btn"
                  onClick={handleCopyFASTA}
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-600 py-1.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-semibold transition"
                >
                  {copyAck ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copyAck ? 'Copied' : 'Copy Aligned FASTA'}
                </button>
                <button
                  id="reset-msa-btn"
                  onClick={() => setAlignedResults(null)}
                  className="flex items-center gap-1 text-gray-400 py-1.5 px-2 hover:text-gray-600 text-xs transition"
                  title="Reset alignment"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}
          </div>

          {!alignedResults ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h4 className="font-semibold text-gray-700 text-sm">Align Protein Sequences to Start</h4>
              <p className="text-xs text-gray-400 max-w-[320px]">
                Click "Perform Multiple Sequence Alignment" on the left panel to execute dynamic-programming Progressive alignment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Amino Acid Legend */}
              <div className="flex flex-wrap gap-2 py-1.5 px-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase self-center mr-1">AA Groups:</span>
                {Array.from(new Set(Object.values(aminoAcidColors).map(v => JSON.stringify(v)))).map((str, idx) => {
                  const val = JSON.parse(str);
                  const char = Object.keys(aminoAcidColors).find(key => JSON.stringify(aminoAcidColors[key]) === str) || '';
                  return (
                    <span key={idx} className={`text-[10px] px-1.5 py-0.5 border rounded flex items-center gap-1 font-mono ${val.bg}`}>
                      <b className="text-[11px]">{char}</b>
                      <span className="opacity-75">{val.desc}</span>
                    </span>
                  );
                })}
              </div>

              {/* Matrix scroll container */}
              <div className="w-full overflow-x-auto border border-gray-100 rounded-xl" id="msa-scroll-container">
                <div className="p-4 bg-gray-50 flex flex-col gap-2 min-w-max">
                  
                  {/* Sequence Grid Rows & Indices */}
                  <div className="flex flex-col gap-1.5 font-mono">
                    
                    {/* Index header mapping row */}
                    <div className="flex items-center h-4 text-[10px] text-gray-400">
                      <div className="w-[120px] select-none text-right pr-4 font-bold">Residue Index</div>
                      <div className="flex gap-[1px]">
                        {Array.from({ length: alignedResults.alignedSequences[0].sequence.length }).map((_, idx) => (
                          <div key={idx} className="w-[18px] text-center select-none text-[8px]">
                            {(idx + 1) % 10 === 0 ? idx + 1 : (idx === 0 ? 1 : '|')}
                          </div>
                        ))}
                      </div>
                    </div>

                    {alignedResults.alignedSequences.map((seqObj) => (
                      <div key={seqObj.id} className="flex items-center group/row">
                        <div className="w-[120px] text-xs font-semibold text-gray-700 truncate pr-4 text-right" title={seqObj.name}>
                          {seqObj.id}
                        </div>
                        <div className="flex gap-[1px]">
                          {seqObj.sequence.split('').map((char, charIdx) => (
                            <div
                              key={charIdx}
                              className={`w-[18px] h-[18px] flex items-center justify-center text-[10px] border border-transparent rounded transition-all text-center select-none cursor-default ${getLetterStyle(char, charIdx)}`}
                              title={`${seqObj.name}: Position ${charIdx + 1}: ${char}`}
                            >
                              {char}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="h-[1px] bg-gray-200 my-1 w-full" />

                    {/* Consensus alignment values */}
                    <div className="flex items-center bg-violet-50/50 py-1 border-t border-b border-indigo-100/50">
                      <div className="w-[120px] text-xs font-bold text-violet-700 text-right pr-4">Consensus</div>
                      <div className="flex gap-[1px]">
                        {alignedResults.consensus.split('').map((char, charIdx) => (
                          <div
                            key={charIdx}
                            className={`w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold ${char === '-' || char === '.' ? 'text-gray-300' : 'text-indigo-805 bg-indigo-50 border border-indigo-150 rounded'}`}
                          >
                            {char}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conservation bars */}
                    <div className="flex items-center mt-1">
                      <div className="w-[120px] text-xs font-bold text-gray-400 text-right pr-4" title="Sequence similarity conservation meter">Conservation</div>
                      <div className="flex gap-[1px]">
                        {alignedResults.conservation.map((score, charIdx) => (
                          <div
                            key={charIdx}
                            className="w-[18px] h-4 flex items-end justify-center group/bar"
                            title={`Position ${charIdx + 1}: score ${score}/10`}
                          >
                            <div 
                              className={`w-2.5 rounded-t transition-all ${
                                score >= 8 
                                  ? 'bg-violet-600 hover:bg-violet-700 h-[100%] ring-1 ring-violet-400' 
                                  : (score >= 5 ? 'bg-indigo-400 h-[60%]' : 'bg-gray-300 h-[20%]')
                              }`} 
                              style={{ height: `${score * 10}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Motifs expandable panel */}
              {alignedResults.motifs.length > 0 && (
                <div className="flex flex-col gap-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                    🎯 Discovered Motifs & Functional Domains ({alignedResults.motifs.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                    {alignedResults.motifs.map((motif, idx) => (
                      <div
                        key={idx}
                        id={`motif-card-${idx}`}
                        onMouseEnter={() => setSelectedMotifIndex(idx)}
                        onMouseLeave={() => setSelectedMotifIndex(null)}
                        className={`p-3 rounded-xl border transition-all cursor-crosshair ${
                          selectedMotifIndex === idx
                            ? 'bg-violet-50 text-violet-900 border-violet-400'
                            : 'bg-white text-gray-700 border-gray-150 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold text-xs">
                          <span>{motif.name}</span>
                          <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-mono">
                            Res {motif.start + 1}-{motif.end + 1}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 mt-1">
                          Consensus Pattern: <span className="text-violet-600">{motif.pattern}</span>
                        </div>
                        <div className="text-[10px] text-gray-450 mt-1">{motif.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Interpretation Markdown block */}
        {alignedResults && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              Evolutionary Interpretation & Motif Analysis
            </h3>
            
            <div className="prose prose-sm max-w-none text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {alignedResults.interpretation.split('\n').map((line, i) => {
                if (line.startsWith('###')) {
                  return <h4 key={i} className="text-sm font-bold text-gray-800 mt-4 mb-2 first:mt-0">{line.replace('###', '').trim()}</h4>;
                } else if (line.startsWith('##')) {
                  return <h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-3 border-b border-gray-50 pb-1">{line.replace('##', '').trim()}</h3>;
                } else if (line.startsWith('* **') || line.startsWith('- **')) {
                  const parts = line.split('**');
                  return (
                    <p key={i} className="mb-2 pl-4 border-l-2 border-indigo-400">
                      <strong>{parts[1]}</strong>{parts.slice(2).join('')}
                    </p>
                  );
                } else if (line.startsWith('*') || line.startsWith('-')) {
                  return <li key={i} className="ml-4 list-disc mb-1.5">{line.substring(2)}</li>;
                }
                return <p key={i} className="mb-2">{line}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
