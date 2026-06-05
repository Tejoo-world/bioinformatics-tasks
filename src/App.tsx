/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import MsaEditor from './components/MsaEditor';
import StructureViewer from './components/StructureViewer';
import ReportBuilder from './components/ReportBuilder';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  BookOpen, 
  Database, 
  ChevronRight, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'msa' | 'structure' | 'thesis'>('overview');
  const [apiStatus, setApiStatus] = useState<{ status: string; apiConfigured: boolean } | null>(null);

  // Check server configuration health
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data))
      .catch(() => setApiStatus({ status: "offline", apiConfigured: false }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* GLOBAL TOP NAVIGATION */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 select-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.01)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-650 text-white p-2.5 rounded-2xl shadow-indigo-100 shadow-md">
              <Dna className="animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                BioInformatics Assignment Suite <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono">v1.4</span>
              </h1>
              <p className="text-xs text-gray-500">
                Interactive Companion for Sequence Alignment, 3D Folding, and Database Studies.
              </p>
            </div>
          </div>

          {/* Quick API status capsule */}
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-gray-150 py-1.5 px-3 rounded-full">
            <span className={`w-2 h-2 rounded-full ${apiStatus?.apiConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
            <span className="font-medium text-slate-600 font-mono">
              {apiStatus?.apiConfigured ? 'Gemini AI: Connected' : 'Gemini AI: Fallback Active'}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-450 italic">Full-stack Secure Container</span>
          </div>
        </div>
      </header>

      {/* TABS SELECTOR STRIP */}
      <nav className="bg-white border-b border-gray-150 py-2.5 px-6 select-none shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          <button
            id="tab-btn-overview"
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-slate-600 border border-gray-200'
            }`}
          >
            <HelpCircle size={14} />
            Overview & Guidelines
          </button>
          
          <button
            id="tab-btn-msa"
            onClick={() => setActiveTab('msa')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'msa'
                ? 'bg-violet-650 text-white shadow-md shadow-violet-100'
                : 'bg-gray-50 hover:bg-gray-100 text-slate-600 border border-gray-200'
            }`}
          >
            <Dna size={14} />
            Multiple Sequence Alignment (Task 2)
          </button>

          <button
            id="tab-btn-structure"
            onClick={() => setActiveTab('structure')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'bg-emerald-650 text-white shadow-md shadow-emerald-100'
                : 'bg-gray-50 hover:bg-gray-100 text-slate-600 border border-gray-200'
            }`}
          >
            <Layers size={14} />
            3D Molecular Folding (Task 3)
          </button>

          <button
            id="tab-btn-thesis"
            onClick={() => setActiveTab('thesis')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'thesis'
                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-100'
                : 'bg-gray-50 hover:bg-gray-100 text-slate-600 border border-gray-200'
            }`}
          >
            <BookOpen size={14} />
            Thesis Report Builder (Task 4)
          </button>
        </div>
      </nav>

      {/* MAIN VIEW AREA CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 focus:outline-none">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="overview-view">
            
            {/* Left intro panel */}
            <div className="lg:col-span-12 flex flex-col gap-6">
              <div className="bg-gradient-to-r from-indigo-700 to-violet-850 p-8 md:p-12 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="flex flex-col gap-3 max-w-[620px] relative z-10">
                  <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full w-max">
                    Curriculum Companion Package
                  </span>
                  <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight leading-none font-sans">
                    B.Tech Bioinformatics Companion
                  </h2>
                  <p className="text-xs md:text-sm text-indigo-100 leading-relaxed font-sans font-light">
                    An interactive laboratory workspace made specifically for B.Tech Biotechnology students. Easily align protein sequences (Task 2), explore 3D molecule structural folding (Task 3), and build clean research report assignments (Task 4) with real bibliography citations.
                  </p>
                </div>
                
                {/* Floating ambient graphic icon background blur */}
                <div className="absolute right-[-10px] top-[-30px] opacity-10 select-none pointer-events-none">
                  <Dna size={250} />
                </div>
              </div>
            </div>

            {/* Middle Grid of the three tasks guidelines */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-650" />
                  Your Active Course Assignments Syllabus
                </h3>

                <div className="flex flex-col gap-4">
                  {/* TASK 2 */}
                  <div className="p-4 bg-violet-50/35 border border-violet-100/50 rounded-xl relative hover:bg-violet-50/50 transition duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100/50 border border-violet-200 flex items-center justify-center text-violet-750 font-bold text-xs select-none">
                          T2
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">Multiple Sequence Alignment (MSA)</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Choose between 5 sequences of Globin, Insulin, Cytochrome C, or Covid RBD families. Align positions progressively and inspect mutational indices.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-bold font-mono">COMPLETED</span>
                    </div>
                    <div className="mt-3.5 flex gap-2">
                      <button 
                        onClick={() => setActiveTab('msa')}
                        className="text-xs font-bold text-violet-700 hover:text-violet-900 flex items-center gap-0.5"
                      >
                        Launch Alignment Viewer <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* TASK 3 */}
                  <div className="p-4 bg-emerald-50/35 border border-emerald-100/50 rounded-xl relative hover:bg-emerald-50/50 transition duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/50 border border-emerald-200 flex items-center justify-center text-emerald-750 font-bold text-xs select-none">
                          T3
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">3D Fold & Secondary Structure Prediction</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Fetch 3D crystallographic structures of Hemoglobin or GFP beta-barrel, or input a custom sequence to predict secondary structures with structural reports.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold font-mono">COMPLETED</span>
                    </div>
                    <div className="mt-3.5 flex gap-2">
                      <button 
                        onClick={() => setActiveTab('structure')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
                      >
                        Launch 3D Molecular Canvas <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* TASK 4 */}
                  <div className="p-4 bg-indigo-50/35 border border-indigo-100/50 rounded-xl relative hover:bg-indigo-50/50 transition duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100/50 border border-indigo-200 flex items-center justify-center text-indigo-750 font-bold text-xs select-none">
                          T4
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">Mini-Project Report & Thesis Builder</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Create a detailed 5-page report with fully cited works on Database Comparisons, Drug Screenings, or Machine Learning in Proteomics.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">READY</span>
                    </div>
                    <div className="mt-3.5 flex gap-2">
                      <button 
                        onClick={() => setActiveTab('thesis')}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5"
                      >
                        Compile Thesis & Print <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right sidebar links and metadata */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck size={16} className="text-indigo-650" />
                  Ecosystem Specifications
                </h4>

                <div className="flex flex-col gap-3 mt-4 text-xs text-gray-650">
                  <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-medium">Alignment Engine</span>
                    <span className="font-mono bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Progressive NW</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-medium">3D Graphics Core</span>
                    <span className="font-mono bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">2D Vector Projection</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-medium">Manuscript compiler</span>
                    <span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Gemini-3.5 Markdown</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-medium">Format Compliance</span>
                    <span className="font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">APA / Harvard Cited</span>
                  </div>
                </div>
              </div>

              {/* standard reference resources mapping to Task 4 database study (NCBI, UniProt, PDB) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2.5">
                <h4 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
                  <Database size={15} />
                  Official Bio repositories
                </h4>
                <ul className="flex flex-col gap-2.5 text-xs">
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-650 hover:text-indigo-600 flex items-center justify-between font-medium group transition"
                    >
                      <div className="flex flex-col">
                        <span>NCBI GenBank</span>
                        <p className="text-[10px] text-gray-400 group-hover:text-indigo-400 font-normal">Nucleotide sequence archives</p>
                      </div>
                      <ExternalLink size={12} className="text-gray-300 group-hover:text-indigo-500 transition" />
                    </a>
                  </li>
                  <li className="border-t border-gray-100 pt-2">
                    <a 
                      href="https://www.uniprot.org/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-650 hover:text-indigo-600 flex items-center justify-between font-medium group transition"
                    >
                      <div className="flex flex-col">
                        <span>UniProt Database</span>
                        <p className="text-[10px] text-gray-400 group-hover:text-indigo-400 font-normal">Highly reviewed standard proteomic database</p>
                      </div>
                      <ExternalLink size={12} className="text-gray-300 group-hover:text-indigo-500 transition" />
                    </a>
                  </li>
                  <li className="border-t border-gray-100 pt-2">
                    <a 
                      href="https://www.rcsb.org/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-650 hover:text-indigo-600 flex items-center justify-between font-medium group transition"
                    >
                      <div className="flex flex-col">
                        <span>RCSB Protein Data Bank</span>
                        <p className="text-[10px] text-gray-400 group-hover:text-indigo-400 font-normal">3D biological coordinate sets</p>
                      </div>
                      <ExternalLink size={12} className="text-gray-300 group-hover:text-indigo-500 transition" />
                    </a>
                  </li>
                </ul>
              </div>

            </div>
            
          </div>
        )}

        <div className="focus:outline-none">
          {activeTab === 'msa' && <MsaEditor />}
          {activeTab === 'structure' && <StructureViewer />}
          {activeTab === 'thesis' && <ReportBuilder />}
        </div>

      </main>

      {/* GLOBAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-950 py-8 px-6 select-none mt-12 print:hidden text-center text-xs flex flex-col gap-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center w-full gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">OMNIBIO WORKSPACE</span>
            <span className="text-slate-600">|</span>
            <span>Interactive Molecular Assignment Suite</span>
          </div>
          <p className="opacity-75">
            Designed to comply with academic assessment standards. All alignments and molecular projections are calculated in real-time.
          </p>
        </div>
      </footer>

    </div>
  );
}
