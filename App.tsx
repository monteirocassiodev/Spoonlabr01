import React, { useState, useRef, useEffect } from 'react';
import { OrgNode, AppState, AnalysisReport, DossierRequest } from './types.ts';
import { NodeEditor } from './components/NodeEditor.tsx';
import { AnalysisView } from './components/AnalysisView.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { PricingPage } from './components/PricingPage.tsx';
import { FastBuildInput } from './components/FastBuildInput.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ProcessingView } from './components/ProcessingView.tsx';
import { analyzeOrgChartStream } from './services/geminiService.ts';
import { Sparkles, Layers, RefreshCw, ChevronDown, Settings, LayoutGrid, CheckCircle, Lock } from 'lucide-react';

const INITIAL_NODE: OrgNode = {
  id: 'root-ceo',
  name: 'Liderança',
  role: 'DIRETOR GERAL',
  functions: 'Direcionamento estratégico e visão de futuro.',
  kpis: [{ name: 'Crescimento', currentValue: 0, targetValue: 100, unit: '%' }],
  children: [],
  isUserPosition: false
};

const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/Cntap1b";
const KIWIFY_SECRET_TOKEN = "SPOON_SUCCESS_2025";

export default function App() {
  const [rootNode, setRootNode] = useState<OrgNode>(INITIAL_NODE);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [report, setReport] = useState<Partial<AnalysisReport> | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem('spoonlab_admin_mode') === 'true');
  const [isAutoUnlocked, setIsAutoUnlocked] = useState(() => localStorage.getItem('spoonlab_premium_unlocked') === 'true');
  
  const reportRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const token = params.get('token');

    if (status === 'success' && token === KIWIFY_SECRET_TOKEN) {
      setIsAutoUnlocked(true);
      localStorage.setItem('spoonlab_premium_unlocked', 'true');
      const savedNode = localStorage.getItem('spoonlab_pending_node');
      if (savedNode) {
        try {
          const parsed = JSON.parse(savedNode);
          setRootNode(parsed);
          setAppState(AppState.EDITING);
        } catch (e) {}
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => localStorage.setItem('spoonlab_admin_mode', isAdminMode.toString()), [isAdminMode]);

  const handleSetUserPosition = (targetId: string) => {
    const updateNode = (node: OrgNode): OrgNode => ({
      ...node,
      isUserPosition: node.id === targetId,
      children: (node.children || []).map(child => updateNode(child))
    });
    setRootNode(updateNode(rootNode));
  };

  const handleAddParent = () => {
    setRootNode({
      id: Math.random().toString(36).substr(2, 9),
      name: 'Superior',
      role: 'CONSELHO',
      functions: 'Governança macro.',
      kpis: [],
      children: [rootNode],
      isUserPosition: false
    });
  };

  const startAnalysis = async () => {
    localStorage.setItem('spoonlab_pending_node', JSON.stringify(rootNode));
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    setReport({});
    
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);

    try {
      const stream = analyzeOrgChartStream(rootNode, abortControllerRef.current.signal);
      for await (const partial of stream) {
        setReport(prev => ({ ...prev, ...partial }));
      }
    } catch (err) {
      console.error("Erro na análise:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCreateRequest = (userName: string, userEmail: string, companyName: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
    const newRequest: DossierRequest = {
      id, accessCode, timestamp: Date.now(), userName, userEmail, companyName, report: report || {}, status: 'PENDING_PAYMENT'
    };
    const requests = JSON.parse(localStorage.getItem('orgai_requests') || '[]');
    localStorage.setItem('orgai_requests', JSON.stringify([...requests, newRequest]));
    return { id, accessCode };
  };

  if (appState === AppState.LANDING) return <LandingPage onStart={() => setAppState(AppState.EDITING)} />;
  if (appState === AppState.PRICING) return <PricingPage onBack={() => setAppState(AppState.EDITING)} kiwifyUrl={KIWIFY_CHECKOUT_URL} onSelectPlan={() => window.open(KIWIFY_CHECKOUT_URL, '_blank')} onScheduleMeeting={() => {}} />;
  if (appState === AppState.ADMIN_PANEL) return <AdminDashboard onBack={() => setAppState(AppState.EDITING)} onViewReport={(rep) => { setReport(rep); setAppState(AppState.EDITING); }} />;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-gray-100 bg-white/80 backdrop-blur-xl z-50 flex items-center justify-between px-12">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppState(AppState.LANDING)}>
          <Layers size={20} className="text-blue-600" />
          <span className="text-xl font-black tracking-tighter uppercase">Spoonlab</span>
        </div>
        <div className="flex items-center gap-4">
          {isAutoUnlocked && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
              <CheckCircle size={14} className="fill-emerald-500 text-white"/> Premium
            </div>
          )}
          <button onClick={() => setIsAdminMode(!isAdminMode)} className="p-2 text-gray-400 hover:text-gray-900 transition-all"><Settings size={18} /></button>
          {isAdminMode && <button onClick={() => setAppState(AppState.ADMIN_PANEL)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"><LayoutGrid size={14} /></button>}
          <button onClick={() => setAppState(AppState.PRICING)} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Preços</button>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-8">
        <div className="max-w-[1400px] mx-auto">
          <section className="mb-12 flex items-end justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Arquitetura Organizacional</h1>
              <p className="text-gray-500 text-base font-light">Mapeie sua estrutura. A IA encontrará as <b>chaves de crescimento</b>.</p>
            </div>
            {!report && !isStreaming && <button onClick={() => { setRootNode(INITIAL_NODE); localStorage.removeItem('spoonlab_pending_node'); }} className="text-[9px] font-black text-gray-300 hover:text-red-500 uppercase flex items-center gap-2"><RefreshCw size={12} /> Resetar</button>}
          </section>

          <FastBuildInput onGenerated={setRootNode} />

          <div className="relative">
             {report && !isStreaming && !isAutoUnlocked && (
               <div className="absolute inset-0 z-[40] bg-white/60 backdrop-blur-[4px] rounded-[3rem] flex items-center justify-center flex-col">
                 <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <Lock size={28} />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2">Relatório Bloqueado</h4>
                    <p className="text-xs text-gray-500 mb-8 font-medium">Sua estrutura foi analisada. O Dossiê exige a licença Blueprint Master.</p>
                    <div className="flex flex-col w-full gap-3">
                      <button onClick={() => window.open(KIWIFY_CHECKOUT_URL, '_blank')} className="bg-blue-600 text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all">Desbloquear Agora</button>
                      <button onClick={() => { setReport(null); setIsStreaming(false); }} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 py-2">Voltar e Editar</button>
                    </div>
                 </div>
               </div>
             )}
             
             <div id="canvas-section" className="org-canvas bg-white border border-gray-100 rounded-[2.5rem] min-h-[600px] shadow-sm mb-20 overflow-auto flex justify-center p-20">
                <NodeEditor node={rootNode} onUpdate={setRootNode} isRoot={true} onAddParent={handleAddParent} onSetUserPosition={handleSetUserPosition} />
             </div>
          </div>

          {!report && !isStreaming && (
            <div className="flex justify-center mt-8">
              <button onClick={startAnalysis} className="group flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95">
                <Sparkles size={24} /> Gerar Blueprint Estratégico <ChevronDown size={24} />
              </button>
            </div>
          )}

          {isStreaming && !report?.executiveSummary && (
            <div className="py-20">
              <ProcessingView onCancel={() => { abortControllerRef.current?.abort(); setIsStreaming(false); setReport(null); }} />
            </div>
          )}

          {report && (report.executiveSummary || isStreaming) && (
            <div ref={reportRef} className="pt-20">
              <AnalysisView 
                report={report as AnalysisReport} 
                isStreaming={isStreaming} 
                isAdmin={isAdminMode} 
                onRefine={() => { setReport(null); setIsStreaming(false); }} 
                onCreateRequest={handleCreateRequest} 
                kiwifyUrl={KIWIFY_CHECKOUT_URL}
                isAutoUnlocked={isAutoUnlocked}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}