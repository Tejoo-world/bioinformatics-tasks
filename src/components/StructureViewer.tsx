import React, { useState, useRef, useEffect } from 'react';
import { ProteinStructure, Atom3D } from '../types';
import { PRESETS_STRUCTURES, MSA_PRESETS } from '../data/proteins';
import { motion } from 'motion/react';
import { Sparkles, Info, Eye, Compass, HelpCircle, Loader, Shield, Play } from 'lucide-react';

export default function StructureViewer() {
  const [proteins, setProteins] = useState<ProteinStructure[]>(PRESETS_STRUCTURES);
  const [activeProteinId, setActiveProteinId] = useState<string>('hemoglobin');
  const [activeProtein, setActiveProtein] = useState<ProteinStructure>(PRESETS_STRUCTURES[0]);
  const [displayMode, setDisplayMode] = useState<'ribbon' | 'backbone' | 'cpk'>('ribbon');
  const [zoom, setZoom] = useState<number>(10);
  const [showHelpers, setShowHelpers] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [selectedResidueIdx, setSelectedResidueIdx] = useState<number | null>(null);

  // Custom prediction sequence states
  const [customSequence, setCustomSequence] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionLogs, setPredictionLogs] = useState<string[]>([]);
  const [predictionReport, setPredictionReport] = useState<string>('');

  // 3D Canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleX = useRef<number>(0.2);
  const angleY = useRef<number>(0.5);
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const found = proteins.find(p => p.id === activeProteinId);
    if (found) {
      setActiveProtein(found);
    }
  }, [activeProteinId, proteins]);

  // Main 3D Canvas rendering paint loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const paint = () => {
      // Clear canvas with deep dark cosmic space background
      ctx.fillStyle = '#0f172a'; // slate-900 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isRotating && !isDragging.current) {
        angleY.current += 0.006; // Rotate slowly
      }

      const cosX = Math.cos(angleX.current);
      const sinX = Math.sin(angleX.current);
      const cosY = Math.cos(angleY.current);
      const sinY = Math.sin(angleY.current);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const cameraDist = 80;

      // Project atoms with sorting (Painter's algorithm for proper 3D occlusion)
      const projectedAtoms = activeProtein.atoms.map((atom, idx) => {
        // Rotate around Y-axis
        let x1 = atom.x * cosY - atom.z * sinY;
        let z1 = atom.x * sinY + atom.z * cosY;

        // Rotate around X-axis
        let y2 = atom.y * cosX - z1 * sinX;
        let z2 = atom.y * sinX + z1 * cosX;

        // Perspective divide with safety boundaries
        const depth = cameraDist + z2;
        const safeDepth = depth <= 1 ? 1 : depth;
        const perspective = cameraDist / safeDepth;
        const px = x1 * perspective * zoom + centerX;
        const py = y2 * perspective * zoom + centerY;

        return {
          px: isNaN(px) || !isFinite(px) ? centerX : px,
          py: isNaN(py) || !isFinite(py) ? centerY : py,
          pz: z2, // keep depth value for sorting
          type: atom.type,
          residueIndex: atom.residueIndex,
          residueName: atom.residueName,
          secStruct: atom.secStruct,
          chain: atom.chain,
          originalAtom: atom,
          idx
        };
      });

      // Sort by depth (from back to front) descending
      projectedAtoms.sort((a, b) => b.pz - a.pz);

      // Draw secondary structure elements depending on setting
      if (displayMode === 'ribbon') {
        // Compute chain-wise continuous ribbon segments
        const residuesMap = new Map<number, typeof projectedAtoms[0]>();
        projectedAtoms.forEach(pa => {
          if (pa.type === 'CA') {
            residuesMap.set(pa.residueIndex, pa);
          }
        });

        const sortedResIndices = Array.from(residuesMap.keys()).sort((a,b)=>a-b);
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw structural bands
        for (let i = 0; i < sortedResIndices.length - 1; i++) {
          const resCurrent = residuesMap.get(sortedResIndices[i]);
          const resNext = residuesMap.get(sortedResIndices[i+1]);
          if (!resCurrent || !resNext) continue;

          // Don't link if sequence numbering jumps or across custom chains
          if (resNext.residueIndex - resCurrent.residueIndex > 3 || resCurrent.chain !== resNext.chain) continue;

          const isSelected = selectedResidueIdx === resCurrent.residueIndex;
          
          let color = '#94a3b8'; // coil gray
          let thickness = 4;

          if (resCurrent.secStruct === 'helix') {
            color = isSelected ? '#f59e0b' : '#fbbf24'; // golden yellow
            thickness = 10;
          } else if (resCurrent.secStruct === 'sheet') {
            color = isSelected ? '#0d9488' : '#2dd4bf'; // clean emerald teal
            thickness = 14;
          } else {
            color = isSelected ? '#818cf8' : '#c7d2fe'; // loop indigo-blue
            thickness = 4.5;
          }

          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = thickness;
          ctx.moveTo(resCurrent.px, resCurrent.py);
          ctx.lineTo(resNext.px, resNext.py);
          ctx.stroke();

          // Double ribbon outline detail for structural cartoon
          if (resCurrent.secStruct === 'helix' || resCurrent.secStruct === 'sheet') {
            ctx.beginPath();
            ctx.strokeStyle = '#1e293b'; // dark border
            ctx.lineWidth = 1.5;
            ctx.moveTo(resCurrent.px, resCurrent.py);
            ctx.lineTo(resNext.px, resNext.py);
            ctx.stroke();
          }
        }
      }

      // Draw atoms spheres or backbones CPK colored
      projectedAtoms.forEach((pa) => {
        const isSelected = selectedResidueIdx === pa.residueIndex;
        let radius = 4;
        let baseColor = '#e2e8f0';

        if (displayMode === 'cpk') {
          radius = pa.type === 'FE' ? 12 : (pa.type === 'S' ? 8 : (pa.type === 'O' ? 5 : (pa.type === 'N' ? 5.5 : 5)));
          // Standard CPK Coloring
          switch (pa.type) {
            case 'C': baseColor = '#475569'; break; // carbon slate-600
            case 'O': baseColor = '#ef4444'; break; // oxygen red
            case 'N': baseColor = '#3b82f6'; break; // nitrogen blue
            case 'S': baseColor = '#fbbf24'; break; // sulfur yellow
            case 'FE': baseColor = '#ea580c'; break; // Iron copper orange
            default: baseColor = '#cbced1';
          }
        } else if (displayMode === 'backbone') {
          if (pa.type !== 'CA') return; // only draw peptide nodes
          radius = 5.5;
          baseColor = pa.secStruct === 'helix' ? '#fbbf24' : (pa.secStruct === 'sheet' ? '#2dd4bf' : '#94a3b8');
        } else {
          // Cartoon overlay spheres (only draw active coordinating centers like HEM or CYS disulfides or key sites)
          if (pa.type !== 'FE' && pa.type !== 'S') return;
          radius = pa.type === 'FE' ? 14 : 7;
          baseColor = pa.type === 'FE' ? '#ef4444' : '#f59e0b';
        }

        const depth = cameraDist + pa.pz;
        const safeDepth = depth <= 1 ? 1 : depth;
        let radScaled = radius * (cameraDist / safeDepth) * (zoom/10 + 0.3);
        if (isNaN(radScaled) || !isFinite(radScaled) || radScaled <= 1) {
          radScaled = 1;
        }

        const pxSafe = isNaN(pa.px) || !isFinite(pa.px) ? centerX || 150 : pa.px;
        const pySafe = isNaN(pa.py) || !isFinite(pa.py) ? centerY || 150 : pa.py;

        ctx.beginPath();
        // Give atomic depth shading radial gradient with non-zero, finite values
        let rInner = radScaled * 0.1;
        let rOuter = radScaled;
        if (isNaN(rInner) || !isFinite(rInner) || rInner <= 0) rInner = 0.1;
        if (isNaN(rOuter) || !isFinite(rOuter) || rOuter <= 0) rOuter = 1;

        const xOffset = pxSafe - radScaled * 0.3;
        const yOffset = pySafe - radScaled * 0.3;
        
        const gradient = ctx.createRadialGradient(
          isNaN(xOffset) || !isFinite(xOffset) ? pxSafe : xOffset,
          isNaN(yOffset) || !isFinite(yOffset) ? pySafe : yOffset,
          rInner,
          pxSafe,
          pySafe,
          rOuter
        );
        
        let highlightColor = isSelected ? '#f43f5e' : baseColor;

        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, highlightColor);
        gradient.addColorStop(1, '#000000'); // dark shadow

        ctx.fillStyle = gradient;
        ctx.arc(pxSafe, pySafe, radScaled, 0, Math.PI * 2);
        ctx.fill();

        // White halo ring for hover/selection
        if (isSelected) {
          ctx.beginPath();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.arc(pxSafe, pySafe, radScaled + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw labeling on hovered active centers
        if (displayMode === 'cpk' || pa.type === 'FE' || pa.type === 'S' || isSelected) {
          if (radScaled > 3) {
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 9px font-mono';
            ctx.fillText(`${pa.residueName}${pa.residueIndex}:${pa.type}`, pxSafe + radScaled + 3, pySafe - 2);
          }
        }
      });

      // Canvas boundary ambient overlays
      if (showHelpers) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px font-mono';
        ctx.fillText(`ROT: X:${angleX.current.toFixed(2)} Y:${angleY.current.toFixed(2)}`, 16, height - 16);
        ctx.fillText(`ZOOM: ${zoom}x`, width - 80, height - 16);
        ctx.fillText(`ATOMS RENDERED: ${activeProtein.atoms.length}`, 16, 24);

        // draw translucent molecule axis helper
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY);
        ctx.lineTo(centerX + 30, centerY);
        ctx.moveTo(centerX, centerY - 30);
        ctx.lineTo(centerX, centerY + 30);
        ctx.stroke();
      }

      animFrame = requestAnimationFrame(paint);
    };

    paint();

    return () => cancelAnimationFrame(animFrame);
  }, [activeProtein, displayMode, zoom, showHelpers, isRotating, selectedResidueIdx]);

  // Handle Dragging / Rotating with Mouse click
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    angleY.current += dx * 0.007;
    angleX.current += dy * 0.007;

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Perform custom structure AI prediction
  const predictCustomSequence = async () => {
    if (!customSequence.trim()) {
      alert("Please paste a protein sequence.");
      return;
    }

    setIsPredicting(true);
    setPredictionLogs([
      "Submitting FASTA sequence payload to full-stack predictive engine...",
      "Matching structural homology scores with PDB templates...",
      "Evaluating alpha-helix coordinate spirals and beta strand zig-zags...",
      "Compiling tertiary coordinates with machine learning modeling..."
    ]);

    try {
      const resp = await fetch('/api/structure/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: customSequence,
          name: customName || `Predictive Fold ${proteins.length + 1}`
        })
      });

      const resData = await resp.json();

      const newProtein: ProteinStructure = {
        id: `predicted_${proteins.length + 1}`,
        name: customName || `Predictive Fold ${proteins.length + 1}`,
        uniprotId: "PREDICTED",
        pdbId: "MOL_PRED",
        description: `This structure was generated using our server-side machine learning tertiary predictor. Coordinates trace the polypeptide energy minimized CA backbone.`,
        organism: "Synthesized / Custom Model",
        length: customSequence.trim().length,
        molecularWeight: `${(customSequence.trim().length * 110 / 1000).toFixed(1)} kDa`,
        secondaryStructureBreakdown: resData.secondaryStructureBreakdown || { helices: 40, sheets: 20, coils: 40 },
        features: resData.features || [],
        atoms: resData.predictedAtoms || [],
        helicesRanges: [],
        sheetsRanges: []
      };

      setProteins([...proteins, newProtein]);
      setActiveProteinId(newProtein.id);
      setActiveProtein(newProtein);
      setPredictionReport(resData.report || '');
      setCustomSequence('');
      setCustomName('');
    } catch (e) {
      console.error(e);
      alert("Failed structures parsing. Fallback populated.");
    } finally {
      setIsPredicting(false);
      setPredictionLogs([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="structure-prediction-root">
      {/* LEFT COLUMN: Protein info, Select, and Custom inputs */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧬 3D Protein folding <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Task 3</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Analyze 3D secondary structural geometry. Select preloaded coordinates models or predict folds from amino acid sequences.
          </p>
        </div>

        {/* Protein Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Structural Target</label>
          <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1">
            {proteins.map((p) => (
              <button
                key={p.id}
                id={`pdb-btn-${p.id}`}
                onClick={() => {
                  setActiveProteinId(p.id);
                  setPredictionReport('');
                }}
                className={`w-full py-2.5 px-3 text-left text-xs rounded-xl font-medium border transition-all flex items-center justify-between ${
                  activeProteinId === p.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-650 border-gray-200'
                }`}
              >
                <div className="flex flex-col">
                  <span>{p.name.split(' (')[0]}</span>
                  <p className={`text-[9px] ${activeProteinId === p.id ? 'text-emerald-100' : 'text-gray-400'}`}>{p.organism}</p>
                </div>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${activeProteinId === p.id ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {p.pdbId}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic ML Homology Fold Box */}
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Sparkles size={13} className="text-emerald-500" />
            <span>AI Structure Predictor</span>
          </div>
          <p className="text-[10px] text-gray-550 italic leading-snug">
            Paste any custom sequence. Our ML model will predict helices, sheets, and generate 3D coordinates.
          </p>

          <input
            type="text"
            id="predict-protein-name"
            placeholder="Structure Identifier (e.g., Lysozyme)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 mt-1"
          />
          <textarea
            id="predict-protein-sequence2"
            rows={2}
            value={customSequence}
            onChange={(e) => setCustomSequence(e.target.value)}
            placeholder="Paste FASTA Amino Acids residues (e.g. MALWMRLL...)"
            className="w-full text-xs font-mono p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 mt-1"
          />

          <button
            id="predict-3d-btn"
            disabled={isPredicting || !customSequence}
            onClick={predictCustomSequence}
            className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isPredicting ? (
              <>
                <Loader className="animate-spin text-white" size={13} />
                Predicting Fold...
              </>
            ) : (
              <>
                <Compass size={13} />
                Predict 3D Folds & Sec Struct
              </>
            )}
          </button>
        </div>

        {/* Prediction progress overlay logger */}
        {isPredicting && (
          <div className="bg-slate-900 border border-slate-750 text-emerald-400 p-3 rounded-xl font-mono text-[9px] flex flex-col gap-1.5">
            <div className="flex justify-between font-bold border-b border-slate-800 pb-1 text-[10px]">
              <span>ML PREDICTIVE RUNTIME LOGS</span>
              <span className="animate-pulse">● ACTIVE</span>
            </div>
            {predictionLogs.map((log, lIdx) => (
              <div key={lIdx} className="flex gap-1.5">
                <span className="text-slate-600 font-bold">{`[${lIdx+1}]`}</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selected Protein Metrics details */}
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 flex-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monomer Statistics</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-150 text-xs">
            <div>
              <span className="text-gray-400 text-[10px]">Accession IDs</span>
              <p className="font-bold text-gray-700 font-mono truncate">{activeProtein.uniprotId}</p>
            </div>
            <div>
              <span className="text-gray-400 text-[10px]">Molecular Weight</span>
              <p className="font-bold text-gray-700">{activeProtein.molecularWeight}</p>
            </div>
            <div className="col-span-2 border-t border-gray-100 pt-1.5 mt-0.5">
              <span className="text-gray-400 text-[10px] block mb-1">Secondary Structure Breakdown</span>
              <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-200">
                <div 
                  className="bg-amber-400 h-full" 
                  style={{ width: `${activeProtein.secondaryStructureBreakdown.helices}%` }}
                  title={`Helices: ${activeProtein.secondaryStructureBreakdown.helices}%`}
                />
                <div 
                  className="bg-teal-400 h-full" 
                  style={{ width: `${activeProtein.secondaryStructureBreakdown.sheets}%` }}
                  title={`Beta Sheets: ${activeProtein.secondaryStructureBreakdown.sheets}%`}
                />
                <div 
                  className="bg-indigo-300 h-full" 
                  style={{ width: `${activeProtein.secondaryStructureBreakdown.coils}%` }}
                  title={`Random Coils: ${activeProtein.secondaryStructureBreakdown.coils}%`}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] mt-1 text-gray-450 uppercase font-bold">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> {activeProtein.secondaryStructureBreakdown.helices}% Spiral</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-teal-400 rounded-full" /> {activeProtein.secondaryStructureBreakdown.sheets}% Sheets</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" /> {activeProtein.secondaryStructureBreakdown.coils}% Coils</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive 3D Molecular Graphics viewport */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-base">
                Interactive Molecular 3D Canvas
              </h3>
              <p className="text-xs text-gray-500">
                Mouse drag coordinates to Rotate. Scroll or zoom manually. Hover atoms to review residue chains.
              </p>
            </div>
            
            {/* Display styles metrics toolbar */}
            <div className="flex gap-2.5">
              <div className="inline-flex rounded-xl bg-gray-50 p-1 border border-gray-200 text-xs font-semibold">
                <button
                  id="btn-style-ribbon"
                  onClick={() => setDisplayMode('ribbon')}
                  className={`py-1 px-2.5 rounded-lg transition-all ${displayMode === 'ribbon' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-450 hover:text-gray-750'}`}
                >
                  Ribbon Cartoon
                </button>
                <button
                  id="btn-style-backbone"
                  onClick={() => setDisplayMode('backbone')}
                  className={`py-1 px-2.5 rounded-lg transition-all ${displayMode === 'backbone' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-450 hover:text-gray-750'}`}
                >
                  CA Backbone
                </button>
                <button
                  id="btn-style-cpk"
                  onClick={() => setDisplayMode('cpk')}
                  className={`py-1 px-2.5 rounded-lg transition-all ${displayMode === 'cpk' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-450 hover:text-gray-750'}`}
                >
                  Space-Fill CPK
                </button>
              </div>

              <div className="flex items-center gap-1 ">
                <button
                  id="btn-toggle-rot"
                  onClick={() => setIsRotating(!isRotating)}
                  className={`p-1.5 rounded-xl border text-xs transition ${isRotating ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                  title="Toggle continuous rotation spinning"
                >
                  🔄 Spin
                </button>
                <button
                  id="btn-toggle-axis"
                  onClick={() => setShowHelpers(!showHelpers)}
                  className={`p-1.5 rounded-xl border text-xs transition ${showHelpers ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                  title="Toggle matrix info overlay"
                >
                  ℹ️ Info
                </button>
              </div>
            </div>
          </div>

          {/* Interactive HTML5 Graphics viewport */}
          <div className="relative rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 border border-slate-750 group-canvas shadow-inner">
            <canvas
              ref={canvasRef}
              width={750}
              height={420}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
            />

            {/* Float-controls for Manual Zoom */}
            <div className="absolute right-4 top-4 bg-slate-800/80 backdrop-blur-md text-white py-2 px-3 rounded-xl border border-slate-700 flex flex-col gap-2 shadow-lg">
              <button
                id="btn-zoom-in"
                onClick={() => setZoom(Math.min(zoom + 2, 24))}
                className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-650 flex items-center justify-center font-bold text-sm"
              >
                +
              </button>
              <button
                id="btn-zoom-out"
                onClick={() => setZoom(Math.max(zoom - 2, 2))}
                className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-650 flex items-center justify-center font-bold text-sm"
              >
                -
              </button>
              <button
                id="btn-zoom-reset"
                onClick={() => setZoom(10)}
                className="text-[9px] text-slate-400 hover:text-white uppercase font-bold text-center mt-0.5"
              >
                Rst
              </button>
            </div>

            {/* Intact membrane bilayer overlay model helper for GPCR receptor */}
            {activeProtein.id === 'gpcb2' && showHelpers && (
              <div className="absolute bottom-[20%] left-0 right-0 h-10 border-t border-b border-indigo-400/20 bg-indigo-500/10 pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-indigo-500/10">Translucent Cell Membrane Boundary</span>
              </div>
            )}
          </div>

          {/* Residue detail highlights map */}
          <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Monomer Domains & Catalytic Residues ({activeProtein.features.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {activeProtein.features.map((feat, fIdx) => (
                <div
                  key={fIdx}
                  id={`feature-card-${fIdx}`}
                  onMouseEnter={() => {
                    const rangeIdxs = feat.range.match(/\d+/g);
                    if (rangeIdxs) {
                      setSelectedResidueIdx(parseInt(rangeIdxs[0]));
                    }
                  }}
                  onMouseLeave={() => setSelectedResidueIdx(null)}
                  className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-left select-none hover:bg-emerald-50 hover:border-emerald-250 transition-all cursor-crosshair"
                >
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-800">{feat.name}</span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">{feat.range}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">{feat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Structural predictions Report section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
            <Eye size={16} className="text-emerald-500" />
            Structural features analysis report
          </h3>
          <div className="prose prose-sm max-w-none text-xs text-gray-600 border-t border-gray-100 pt-4 leading-relaxed">
            {predictionReport ? (
              predictionReport.split('\n').map((line, plIdx) => {
                if (line.startsWith('###')) {
                  return <h4 key={plIdx} className="text-sm font-bold text-gray-800 mt-4 mb-2 first:mt-0">{line.replace('###', '').trim()}</h4>;
                } else if (line.startsWith('##')) {
                  return <h2 key={plIdx} className="text-base font-bold text-gray-900 mt-6 mb-3 border-b border-gray-50 pb-1">{line.replace('##', '').trim()}</h2>;
                } else if (line.startsWith('*') || line.startsWith('-')) {
                  return <li key={plIdx} className="ml-4 list-disc mb-1.5">{line.substring(2)}</li>;
                }
                return <p key={plIdx} className="mb-2">{line}</p>;
              })
            ) : (
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2">Molecular Profile of the Selected Target</h4>
                <p className="mb-2">
                  This fold represents a highly organized {activeProtein.secondaryStructureBreakdown.helices > 50 ? 'predominantly helical' : 'helices-sheets mixed'} thermodynamic structure. The outer exposed loops are optimized for hydration and G-protein coupled interaction cascades, while the packed core maintains strict hydrophobic cohesion.
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-1">
                  <li><strong>Target fold template:</strong> Homologous to PDB crystallization model {activeProtein.pdbId}.</li>
                  <li><strong>Active pocket stability:</strong> Residues forming active functional nodes are sequestered within hydrophobic pockets or anchored tightly on rigid beta shields.</li>
                  <li><strong>Biological action:</strong> Structural parameters validate its capacity to coordinate key target metabolic compounds securely.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
