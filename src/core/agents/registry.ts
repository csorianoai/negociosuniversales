/**
 * Agent registry (UI-only). Does NOT execute agents.
 * Static metadata for AI Studio and case detail.
 */

export type AgentCategory = 'pipeline' | 'evaluator' | 'operational';
export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'coming_soon';
export type AgentModel = 'claude-haiku' | 'claude-sonnet' | 'logic-only';
export type Vertical =
  | 'real_estate'
  | 'vehicles'
  | 'equipment'
  | 'hotel_equipment'
  | 'other';

export interface EvaluatorMetadata {
  methodology: string;
  methodologyDetail: string;
  minInputs: string[];
  docChecklist: string[];
  priceDop: number;
}

export interface AgentMetadata {
  id: string;
  name: string;
  nameShort: string;
  description: string;
  category: AgentCategory;
  vertical: Vertical | null;
  model: AgentModel;
  status: AgentStatus;
  hasImplementation: boolean;
  estimatedCostPerRun: number;
  estimatedDurationSeconds: number;
  pipelineOrder: number | null;
  inputs: string[];
  outputs: string[];
  promptFile: string | null;
  iconName: string;
  color: string;
  evaluator: EvaluatorMetadata | null;
}

const intakeAgent: AgentMetadata = {
  id: 'intake',
  name: 'Intake Agent',
  nameShort: 'Intake',
  description: 'Extrae datos de documentos y normaliza información inicial',
  category: 'pipeline',
  vertical: null,
  model: 'claude-haiku',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.008,
  estimatedDurationSeconds: 15,
  pipelineOrder: 1,
  inputs: ['documentos', 'formulario'],
  outputs: ['property_data', 'case_type'],
  promptFile: 'intake.md',
  iconName: 'FileInput',
  color: '#C9A84C',
  evaluator: null,
};

const evidenceClassifierAgent: AgentMetadata = {
  id: 'evidence_classifier',
  name: 'Evidence Classifier',
  nameShort: 'Classifier',
  description: 'Clasifica y valida documentos de evidencia',
  category: 'pipeline',
  vertical: null,
  model: 'claude-haiku',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.006,
  estimatedDurationSeconds: 8,
  pipelineOrder: 2,
  inputs: ['evidence_files'],
  outputs: ['classified_evidence', 'validation_result'],
  promptFile: 'evidence.md',
  iconName: 'FileSearch',
  color: '#60A5FA',
  evaluator: null,
};

const researchAgent: AgentMetadata = {
  id: 'research',
  name: 'Research Agent',
  nameShort: 'Research',
  description: 'Investiga mercado y contexto de la propiedad',
  category: 'pipeline',
  vertical: null,
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.045,
  estimatedDurationSeconds: 45,
  pipelineOrder: 3,
  inputs: ['property_data', 'location'],
  outputs: ['market_context', 'research_notes'],
  promptFile: 'research.md',
  iconName: 'Search',
  color: '#60A5FA',
  evaluator: null,
};

const comparableAgent: AgentMetadata = {
  id: 'comparable',
  name: 'Comparable Agent',
  nameShort: 'Comparable',
  description: 'Encuentra y valida comparables',
  category: 'pipeline',
  vertical: null,
  model: 'claude-haiku',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.012,
  estimatedDurationSeconds: 25,
  pipelineOrder: 4,
  inputs: ['property_data', 'market_context'],
  outputs: ['comparables', 'similarity_scores'],
  promptFile: 'comparable.md',
  iconName: 'GitCompare',
  color: '#A78BFA',
  evaluator: null,
};

const reportWriterAgent: AgentMetadata = {
  id: 'report_writer',
  name: 'Report Writer',
  nameShort: 'Report',
  description: 'Genera informe de tasación estructurado',
  category: 'pipeline',
  vertical: null,
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.078,
  estimatedDurationSeconds: 60,
  pipelineOrder: 5,
  inputs: ['property_data', 'comparables', 'market_context'],
  outputs: ['report_markdown', 'estimated_value'],
  promptFile: 'report.md',
  iconName: 'FileText',
  color: '#34D399',
  evaluator: null,
};

const qaAgent: AgentMetadata = {
  id: 'qa',
  name: 'QA Agent',
  nameShort: 'QA',
  description: 'Control de calidad del informe',
  category: 'pipeline',
  vertical: null,
  model: 'claude-haiku',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.009,
  estimatedDurationSeconds: 12,
  pipelineOrder: 6,
  inputs: ['report_markdown', 'property_data'],
  outputs: ['qa_result', 'qa_notes'],
  promptFile: 'qa.md',
  iconName: 'ShieldCheck',
  color: '#F87171',
  evaluator: null,
};

const complianceAgent: AgentMetadata = {
  id: 'compliance',
  name: 'Compliance Agent',
  nameShort: 'Compliance',
  description: 'Verificación de cumplimiento normativo',
  category: 'pipeline',
  vertical: null,
  model: 'claude-haiku',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.008,
  estimatedDurationSeconds: 10,
  pipelineOrder: 7,
  inputs: ['report_markdown', 'evidence'],
  outputs: ['compliance_result', 'checklist'],
  promptFile: 'compliance.md',
  iconName: 'Shield',
  color: '#FBBF24',
  evaluator: null,
};

const deliveryAgent: AgentMetadata = {
  id: 'delivery',
  name: 'Delivery Agent',
  nameShort: 'Delivery',
  description: 'Finaliza entrega y genera PDF',
  category: 'pipeline',
  vertical: null,
  model: 'logic-only',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0,
  estimatedDurationSeconds: 5,
  pipelineOrder: 8,
  inputs: ['report_markdown', 'case_data'],
  outputs: ['pdf_path', 'delivery_status'],
  promptFile: null,
  iconName: 'Send',
  color: '#34D399',
  evaluator: null,
};

const humanReviewAgent: AgentMetadata = {
  id: 'human_review',
  name: 'Human Review',
  nameShort: 'Review',
  description: 'Revisión humana cuando AI no es concluyente',
  category: 'pipeline',
  vertical: null,
  model: 'logic-only',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0,
  estimatedDurationSeconds: 0,
  pipelineOrder: null,
  inputs: ['report', 'qa_notes'],
  outputs: ['approval', 'adjustments'],
  promptFile: null,
  iconName: 'User',
  color: '#94A3B8',
  evaluator: null,
};

const realEstateEvaluator: AgentMetadata = {
  id: 'evaluator_real_estate',
  name: 'Evaluador Inmobiliario',
  nameShort: 'Eval Inmob.',
  description: 'Evaluación de inmuebles residenciales y comerciales',
  category: 'evaluator',
  vertical: 'real_estate',
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.035,
  estimatedDurationSeconds: 30,
  pipelineOrder: null,
  inputs: ['property_data', 'comparables', 'report'],
  outputs: ['vrs_score', 'adjustments'],
  promptFile: 'eval_real_estate.md',
  iconName: 'Building2',
  color: '#C9A84C',
  evaluator: {
    methodology: 'Método comparativo directo',
    methodologyDetail: 'Comparación con ventas recientes ajustadas',
    minInputs: ['address', 'sqm', 'type'],
    docChecklist: ['Escritura', 'Plano', 'Fotos'],
    priceDop: 6500,
  },
};

const vehiclesEvaluator: AgentMetadata = {
  id: 'evaluator_vehicles',
  name: 'Evaluador Vehículos',
  nameShort: 'Eval Veh.',
  description: 'Evaluación de vehículos y motocicletas',
  category: 'evaluator',
  vertical: 'vehicles',
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.028,
  estimatedDurationSeconds: 25,
  pipelineOrder: null,
  inputs: ['vehicle_data', 'market_data'],
  outputs: ['vrs_score', 'estimated_value'],
  promptFile: 'eval_vehicles.md',
  iconName: 'Car',
  color: '#60A5FA',
  evaluator: {
    methodology: 'Método de valor en libros y mercado',
    methodologyDetail: 'Depreciación + comparables de mercado',
    minInputs: ['brand', 'model', 'year', 'km'],
    docChecklist: ['Matrícula', 'Fotos', 'Estado'],
    priceDop: 3500,
  },
};

const equipmentEvaluator: AgentMetadata = {
  id: 'evaluator_equipment',
  name: 'Evaluador Equipos',
  nameShort: 'Eval Equip.',
  description: 'Evaluación de maquinaria y equipos',
  category: 'evaluator',
  vertical: 'equipment',
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.032,
  estimatedDurationSeconds: 28,
  pipelineOrder: null,
  inputs: ['equipment_data', 'depreciation'],
  outputs: ['vrs_score', 'liquidation_value'],
  promptFile: 'eval_equipment.md',
  iconName: 'Wrench',
  color: '#A78BFA',
  evaluator: {
    methodology: 'Valor de reposición menos depreciación',
    methodologyDetail: 'Costo nuevo menos depreciación física y funcional',
    minInputs: ['type', 'model', 'year', 'condition'],
    docChecklist: ['Ficha técnica', 'Fotos'],
    priceDop: 5500,
  },
};

const hotelEquipmentEvaluator: AgentMetadata = {
  id: 'evaluator_hotel_equipment',
  name: 'Evaluador Equip. Hotel',
  nameShort: 'Eval Hotel',
  description: 'Evaluación de equipos de hotelería',
  category: 'evaluator',
  vertical: 'hotel_equipment',
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.03,
  estimatedDurationSeconds: 26,
  pipelineOrder: null,
  inputs: ['equipment_list', 'condition'],
  outputs: ['vrs_score', 'fair_value'],
  promptFile: 'eval_hotel.md',
  iconName: 'Hotel',
  color: '#34D399',
  evaluator: {
    methodology: 'Valor de mercado para equipos hoteleros',
    methodologyDetail: 'Comparación con equipos similares en operación',
    minInputs: ['equipment_type', 'quantity', 'condition'],
    docChecklist: ['Inventario', 'Fotos'],
    priceDop: 5000,
  },
};

const otherEvaluator: AgentMetadata = {
  id: 'evaluator_other',
  name: 'Evaluador Otros',
  nameShort: 'Eval Otros',
  description: 'Evaluación de activos diversos',
  category: 'evaluator',
  vertical: 'other',
  model: 'claude-sonnet',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0.03,
  estimatedDurationSeconds: 25,
  pipelineOrder: null,
  inputs: ['asset_data', 'market_data'],
  outputs: ['vrs_score', 'estimated_value'],
  promptFile: 'eval_other.md',
  iconName: 'Package',
  color: '#FBBF24',
  evaluator: {
    methodology: 'Método adecuado al tipo de activo',
    methodologyDetail: 'Según normas de tasación aplicables',
    minInputs: ['asset_type', 'description'],
    docChecklist: ['Documentación disponible'],
    priceDop: 6000,
  },
};

const exportAgent: AgentMetadata = {
  id: 'export',
  name: 'Export Agent',
  nameShort: 'Export',
  description: 'Exportación de datos a CSV/PDF',
  category: 'operational',
  vertical: null,
  model: 'logic-only',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0,
  estimatedDurationSeconds: 2,
  pipelineOrder: null,
  inputs: ['cases', 'format'],
  outputs: ['file_url'],
  promptFile: null,
  iconName: 'Download',
  color: '#94A3B8',
  evaluator: null,
};

const billingAgent: AgentMetadata = {
  id: 'billing',
  name: 'Billing Agent',
  nameShort: 'Billing',
  description: 'Cálculo de facturación por vertical',
  category: 'operational',
  vertical: null,
  model: 'logic-only',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0,
  estimatedDurationSeconds: 1,
  pipelineOrder: null,
  inputs: ['cases', 'pricing'],
  outputs: ['billable_summary'],
  promptFile: null,
  iconName: 'Receipt',
  color: '#C9A84C',
  evaluator: null,
};

const auditAgent: AgentMetadata = {
  id: 'audit',
  name: 'Audit Agent',
  nameShort: 'Audit',
  description: 'Registro y verificación de auditoría',
  category: 'operational',
  vertical: null,
  model: 'logic-only',
  status: 'active',
  hasImplementation: true,
  estimatedCostPerRun: 0,
  estimatedDurationSeconds: 1,
  pipelineOrder: null,
  inputs: ['events', 'case_data'],
  outputs: ['audit_log', 'hash_chain'],
  promptFile: null,
  iconName: 'FileCheck',
  color: '#34D399',
  evaluator: null,
};

const supportAgent: AgentMetadata = {
  id: 'support',
  name: 'Support Agent',
  nameShort: 'Support',
  description: 'Soporte y ayuda contextual',
  category: 'operational',
  vertical: null,
  model: 'claude-haiku',
  status: 'coming_soon',
  hasImplementation: false,
  estimatedCostPerRun: 0.005,
  estimatedDurationSeconds: 5,
  pipelineOrder: null,
  inputs: ['question', 'context'],
  outputs: ['answer'],
  promptFile: null,
  iconName: 'HelpCircle',
  color: '#94A3B8',
  evaluator: null,
};

export const AGENT_REGISTRY = [
  intakeAgent,
  evidenceClassifierAgent,
  researchAgent,
  comparableAgent,
  reportWriterAgent,
  qaAgent,
  complianceAgent,
  deliveryAgent,
  humanReviewAgent,
  realEstateEvaluator,
  vehiclesEvaluator,
  equipmentEvaluator,
  hotelEquipmentEvaluator,
  otherEvaluator,
  exportAgent,
  billingAgent,
  auditAgent,
  supportAgent,
] as const;

export const TOTAL_AGENT_COUNT = 18 as const;

export function getAgentsByCategory(cat: AgentCategory): AgentMetadata[] {
  return AGENT_REGISTRY.filter((a) => a.category === cat);
}

export function getAgentById(id: string): AgentMetadata | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export function getPipelineAgents(): AgentMetadata[] {
  return AGENT_REGISTRY.filter(
    (a) => a.category === 'pipeline' && a.pipelineOrder != null
  ).sort((a, b) => (a.pipelineOrder ?? 0) - (b.pipelineOrder ?? 0));
}

export function getEvaluatorByVertical(
  v: Vertical
): AgentMetadata | undefined {
  return AGENT_REGISTRY.find(
    (a) => a.category === 'evaluator' && a.vertical === v
  );
}

export function getActiveAgents(): AgentMetadata[] {
  return AGENT_REGISTRY.filter((a) => a.status === 'active');
}

const pipelineCostSum = AGENT_REGISTRY.filter(
  (a) => a.category === 'pipeline' && a.estimatedCostPerRun > 0
).reduce((s, a) => s + a.estimatedCostPerRun, 0);

export const PIPELINE_COST_ESTIMATE: number = pipelineCostSum;

const pipelineDurationSum = AGENT_REGISTRY.filter(
  (a) => a.category === 'pipeline'
).reduce((s, a) => s + a.estimatedDurationSeconds, 0);

export const PIPELINE_DURATION_ESTIMATE: number = pipelineDurationSum;
