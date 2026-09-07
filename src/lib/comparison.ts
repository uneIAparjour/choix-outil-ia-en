import { EvaluationExport, ComplianceLevel } from "@/types/evaluation";

export interface CriterionComparison {
  id: string;
  question: string;
  toolA: {
    response: ComplianceLevel;
    responseText: string;
    warning?: string;
  };
  toolB: {
    response: ComplianceLevel;
    responseText: string;
    warning?: string;
  };
  isDifferent: boolean;
}

export interface DimensionComparison {
  label: string;
  scoreA: number;
  scoreB: number;
  maxScoreA: number;
  maxScoreB: number;
  criteria: CriterionComparison[];
}

export interface ComparisonResult {
  toolA: string;
  toolB: string;
  pathwayA: string;
  pathwayB: string;
  samePathway: boolean;
  exportedAtA: string;
  exportedAtB: string;
  dimensions: {
    compliance: DimensionComparison;
    utility: DimensionComparison;
    usability: DimensionComparison;
    acceptability: DimensionComparison;
  };
  totalScoreA: number;
  totalScoreB: number;
  maxScoreA: number;
  maxScoreB: number;
  passedA: boolean;
  passedB: boolean;
  strengthsA: string[];
  strengthsB: string[];
  warningsA: string[];
  warningsB: string[];
}

const PATHWAY_LABELS: Record<string, string> = {
  personal: "Personal use",
  professional: "Professional use",
  students: "Use with students",
};

function compareDimension(
  key: string,
  evalA: EvaluationExport,
  evalB: EvaluationExport
): DimensionComparison {
  const dimA = evalA.dimensions[key as keyof typeof evalA.dimensions];
  const dimB = evalB.dimensions[key as keyof typeof evalB.dimensions];

  const allIds = new Set([
    ...dimA.criteria.map((c) => c.id),
    ...dimB.criteria.map((c) => c.id),
  ]);

  const criteria: CriterionComparison[] = [];

  allIds.forEach((id) => {
    const criterionA = dimA.criteria.find((c) => c.id === id);
    const criterionB = dimB.criteria.find((c) => c.id === id);

    const defaultResponse = {
      response: "non-compliant" as ComplianceLevel,
      responseText: "Not assessed",
    };

    criteria.push({
      id,
      question: criterionA?.question || criterionB?.question || id,
      toolA: criterionA
        ? {
            response: criterionA.response,
            responseText: criterionA.responseText,
            warning: criterionA.warning,
          }
        : defaultResponse,
      toolB: criterionB
        ? {
            response: criterionB.response,
            responseText: criterionB.responseText,
            warning: criterionB.warning,
          }
        : defaultResponse,
      isDifferent: criterionA?.response !== criterionB?.response,
    });
  });

  return {
    label: dimA.label || dimB.label,
    scoreA: dimA.score,
    scoreB: dimB.score,
    maxScoreA: dimA.maxScore,
    maxScoreB: dimB.maxScore,
    criteria,
  };
}

function findStrengths(
  eval_: EvaluationExport,
  other: EvaluationExport,
  samePathway: boolean
): string[] {
  const strengths: string[] = [];
  const dims = ["compliance", "utility", "usability", "acceptability"] as const;

  dims.forEach((key) => {
    const dim = eval_.dimensions[key];
    const otherDim = other.dimensions[key];

    if (samePathway) {
      if (dim.score > otherDim.score) {
        strengths.push(`${dim.label} (${dim.score}/${dim.maxScore} vs ${otherDim.score}/${otherDim.maxScore})`);
      }
    } else {
      const pct = dim.maxScore > 0 ? dim.score / dim.maxScore : 0;
      const otherPct = otherDim.maxScore > 0 ? otherDim.score / otherDim.maxScore : 0;
      if (pct > otherPct) {
        strengths.push(`${dim.label} (${Math.round(pct * 100)}% vs ${Math.round(otherPct * 100)}%)`);
      }
    }
  });

  return strengths;
}

export function compareEvaluations(
  evalA: EvaluationExport,
  evalB: EvaluationExport
): ComparisonResult {
  const dims = ["compliance", "utility", "usability", "acceptability"] as const;
  const samePathway = evalA.pathway === evalB.pathway;

  const dimensions = {} as ComparisonResult["dimensions"];
  dims.forEach((key) => {
    dimensions[key] = compareDimension(key, evalA, evalB);
  });

  return {
    toolA: evalA.tool.name || "Tool A",
    toolB: evalB.tool.name || "Tool B",
    pathwayA: PATHWAY_LABELS[evalA.pathway] || evalA.pathway,
    pathwayB: PATHWAY_LABELS[evalB.pathway] || evalB.pathway,
    samePathway,
    exportedAtA: evalA.exportedAt,
    exportedAtB: evalB.exportedAt,
    dimensions,
    totalScoreA: evalA.summary.totalScore,
    totalScoreB: evalB.summary.totalScore,
    maxScoreA: evalA.summary.maxScore,
    maxScoreB: evalB.summary.maxScore,
    passedA: evalA.summary.passed,
    passedB: evalB.summary.passed,
    strengthsA: findStrengths(evalA, evalB, samePathway),
    strengthsB: findStrengths(evalB, evalA, samePathway),
    warningsA: evalA.summary.warnings,
    warningsB: evalB.summary.warnings,
  };
}

export function getComplianceIcon(level: ComplianceLevel): string {
  switch (level) {
    case "compliant":
      return "✅";
    case "partial":
      return "⚠️";
    case "non-compliant":
      return "❌";
  }
}

export function getComplianceLabel(level: ComplianceLevel): string {
  switch (level) {
    case "compliant":
      return "Compliant";
    case "partial":
      return "Partial";
    case "non-compliant":
      return "Non-compliant";
  }
}
