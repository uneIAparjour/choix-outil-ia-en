import {
  Pathway,
  Region,
  ComplianceLevel,
  ToolInfo,
  CriterionResponse,
  DimensionResult,
  HistoryEntry,
  EvaluationSummary,
  EvaluationExport,
  Step,
  Choice,
} from "@/types/evaluation";

const DIMENSION_LABELS: Record<string, string> = {
  compliance: "Compliance",
  utility: "Utility",
  usability: "Usability",
  acceptability: "Acceptability",
};

// Max score per dimension and per pathway (number of criteria on the optimal
// path × 2).
// Personal: 2, 3, 3.3, 4, 4.1 | 5, 6, 6.1 | 7, 8 | 9, 10, 10.1
// Professional: same + 11, 12
// Students: same + 13, 14, 14.1, 15
// Outside the EU/EEA, the GDPR/AI Act/hosting-sovereignty criteria (3, 3.3, 4)
// never get asked — only 2 and 4.1 remain in "compliance" — so the max score
// for that dimension is lower there, regardless of pathway.
const PATHWAY_MAX_SCORES: Record<Pathway, Record<string, number>> = {
  personal: {
    compliance: 10, // 5 criteria × 2
    utility: 6,     // 3 criteria × 2
    usability: 4,   // 2 criteria × 2
    acceptability: 6, // 3 criteria × 2
  },
  professional: {
    compliance: 10,
    utility: 6,
    usability: 4,
    acceptability: 10, // 5 criteria × 2 (+ 11, 12)
  },
  students: {
    compliance: 10,
    utility: 10,    // 5 criteria × 2 (+ 14, 14.1)
    usability: 4,
    acceptability: 14, // 7 criteria × 2 (+ 11, 12, 13, 15)
  },
};

const NON_EU_COMPLIANCE_MAX_SCORE = 4; // 2 criteria × 2 (only 2 and 4.1-gen)

function scoreFromLevel(level: ComplianceLevel): number {
  switch (level) {
    case "compliant":
      return 2;
    case "partial":
      return 1;
    case "non-compliant":
      return 0;
  }
}

export function computeDimension(
  criteria: CriterionResponse[],
  dimensionKey: string,
  pathwayMaxScore: number
): DimensionResult {
  const score = criteria.reduce(
    (sum, c) => sum + scoreFromLevel(c.response),
    0
  );
  return {
    label: DIMENSION_LABELS[dimensionKey] || dimensionKey,
    score,
    maxScore: pathwayMaxScore,
    criteria,
  };
}

export function buildCriterionResponse(
  step: Step,
  choice: Choice
): CriterionResponse | null {
  if (!choice.complianceLevel) return null;
  if (step.isAction) return null;
  if ([
    "0", "0.1", "0.2", "1",
    "3.test-en", "3.test-en-gen", "3.eleves-test", "3.eleves-test-gen",
    "3.registre.info", "3.registre.info-gen",
    "success", "reject", "reconsider", "final-reject",
  ].includes(step.id))
    return null;

  return {
    id: step.id,
    question: step.question,
    response: choice.complianceLevel,
    responseText: choice.text,
    isEliminating: choice.isEliminating || false,
    warning: choice.warning,
  };
}

export function buildHistoryEntry(
  step: Step,
  choice: Choice
): HistoryEntry {
  return {
    stepId: step.id,
    question: step.question,
    choiceText: choice.text,
    timestamp: new Date().toISOString(),
  };
}

export function buildEvaluationExport(
  tool: ToolInfo,
  pathway: Pathway,
  region: Region,
  criteriaByDimension: Record<string, CriterionResponse[]>,
  history: HistoryEntry[],
  passed: boolean
): EvaluationExport {
  const maxScores = PATHWAY_MAX_SCORES[pathway];
  const complianceMax = region === "non-europe" ? NON_EU_COMPLIANCE_MAX_SCORE : maxScores.compliance;

  const dimensions = {
    compliance: computeDimension(
      criteriaByDimension["compliance"] || [],
      "compliance",
      complianceMax
    ),
    utility: computeDimension(
      criteriaByDimension["utility"] || [],
      "utility",
      maxScores.utility
    ),
    usability: computeDimension(
      criteriaByDimension["usability"] || [],
      "usability",
      maxScores.usability
    ),
    acceptability: computeDimension(
      criteriaByDimension["acceptability"] || [],
      "acceptability",
      maxScores.acceptability
    ),
  };

  const allCriteria = Object.values(dimensions).flatMap((d) => d.criteria);
  const totalScore = Object.values(dimensions).reduce(
    (sum, d) => sum + d.score,
    0
  );
  const maxScore = Object.values(dimensions).reduce(
    (sum, d) => sum + d.maxScore,
    0
  );
  const warnings = allCriteria
    .filter((c) => c.warning)
    .map((c) => c.warning!);
  const eliminatingCriteria = allCriteria
    .filter((c) => c.isEliminating && c.response === "non-compliant")
    .map((c) => c.question);

  const summary: EvaluationSummary = {
    totalScore,
    maxScore,
    passed,
    warnings,
    eliminatingCriteria,
  };

  return {
    version: "2.0",
    exportedAt: new Date().toISOString(),
    tool,
    pathway,
    region,
    dimensions,
    summary,
    history,
  };
}

export function downloadJSON(evaluation: EvaluationExport): void {
  const filename = evaluation.tool.name
    ? `evaluation_${evaluation.tool.name.replace(/\s+/g, "_")}.json`
    : "evaluation_ai_tool.json";

  const blob = new Blob([JSON.stringify(evaluation, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function loadJSON(file: File): Promise<EvaluationExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version || !data.dimensions || !data.summary) {
          reject(new Error("Invalid file format"));
          return;
        }
        resolve(data as EvaluationExport);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Error reading the file"));
    reader.readAsText(file);
  });
}
