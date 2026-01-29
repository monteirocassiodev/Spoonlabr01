
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

export interface AIAgent {
  name: string;
  description: string;
  replacedTasks: string[];
  efficiencyGain: string;
  recommendedStack: {
    tool: string;
    url?: string;
    category?: string;
  }[];
}

export interface DossierSection {
  title: string;
  content: string;
  subtopics?: { title: string; text: string }[];
}

export interface AnalysisReport {
  executiveSummary: string;
  agentCritique?: string;
  currentBottlenecks: string[];
  aiFirstVision: string;
  suggestedAgents: AIAgent[];
  proposedOrgChart: ProposedOrgNode;
  newWorkflowDescription: string;
  roiEstimate: string;
  careerInnovationStrategy: string;
  userSpecificStrategy?: string;
  fullDossier?: {
    financialAnalysis: DossierSection;
    operationalRoadmap: DossierSection;
    toolStack: DossierSection;
    riskAssessment: DossierSection;
  };
  crownGems: {
    title: string;
    description: string;
    impact: string;
  }[];
}

export interface ScheduledMeeting {
  id: string;
  email: string;
  subject: string;
  timestamp: number;
}

export interface DossierRequest {
  id: string;
  accessCode: string;
  timestamp: number;
  userName: string;
  userEmail: string;
  companyName: string;
  report: Partial<AnalysisReport>;
  receiptImage?: string;
  status: 'PENDING_PAYMENT' | 'AWAITING_APPROVAL' | 'APPROVED';
}

export enum AppState {
  LANDING = 'LANDING',
  EDITING = 'EDITING',
  ANALYZING = 'ANALYZING',
  VIEWING_REPORT = 'VIEWING_REPORT',
  PRICING = 'PRICING',
  ADMIN_PANEL = 'ADMIN_PANEL'
}
