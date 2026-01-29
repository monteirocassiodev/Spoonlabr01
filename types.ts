export interface KPI {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  functions: string;
  kpis: KPI[];
  children: OrgNode[];
  isUserPosition?: boolean;
}

export interface ProposedOrgNode {
  id: string;
  name: string;
  role: string;
  type: 'HUMAN' | 'AI_AGENT' | 'HYBRID';
  functions: string;
  innovationTip: string;
  crownGem: string;
  isUserPosition?: boolean;
  children: ProposedOrgNode[];
}

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  method: 'KIWIFY';
  status: 'COMPLETED';
}

export interface AnalysisReport {
  executiveSummary: string;
  crownGems: {
    title: string;
    description: string;
    impact: string;
  }[];
  userSpecificStrategy?: string;
  proposedOrgChart: ProposedOrgNode;
  fullDossier?: {
    financialAnalysis: { title: string; content: string; subtopics?: any[] };
    operationalRoadmap: { title: string; content: string; subtopics?: any[] };
    toolStack: { title: string; content: string; subtopics?: any[] };
    riskAssessment: { title: string; content: string; subtopics?: any[] };
  };
}

export enum AppState {
  LANDING = 'LANDING',
  EDITING = 'EDITING',
  ANALYZING = 'ANALYZING',
  PRICING = 'PRICING',
  ADMIN_PANEL = 'ADMIN_PANEL'
}