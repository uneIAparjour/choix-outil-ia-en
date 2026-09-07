import React from "react";
import {
  EvaluationExport,
  ComplianceLevel,
  CriterionResponse,
} from "@/types/evaluation";
import { downloadJSON } from "@/lib/scoring";
import {
  Download,
  Check,
  AlertTriangle,
  X,
  Shield,
  Target,
  MousePointer,
  CheckCircle,
} from "lucide-react";

interface ResultSummaryProps {
  evaluation: EvaluationExport;
}

function getLevelIcon(level: ComplianceLevel) {
  switch (level) {
    case "compliant":
      return <Check className="w-4 h-4 text-green-500" />;
    case "partial":
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "non-compliant":
      return <X className="w-4 h-4 text-red-500" />;
  }
}

function getLevelLabel(level: ComplianceLevel): string {
  switch (level) {
    case "compliant":
      return "Compliant";
    case "partial":
      return "Partial";
    case "non-compliant":
      return "Non-compliant";
  }
}

const DIMENSION_CONFIG = {
  compliance: {
    icon: Shield,
    label: "Compliance",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    barColor: "bg-blue-500",
  },
  utility: {
    icon: Target,
    label: "Utility",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    barColor: "bg-emerald-500",
  },
  usability: {
    icon: MousePointer,
    label: "Usability",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    barColor: "bg-orange-500",
  },
  acceptability: {
    icon: CheckCircle,
    label: "Acceptability",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    barColor: "bg-purple-500",
  },
};

const PATHWAY_LABELS: Record<string, string> = {
  personal: "Personal use",
  professional: "Professional use",
  students: "Use with students",
};

const ResultSummary: React.FC<ResultSummaryProps> = ({ evaluation }) => {
  const { dimensions, summary, tool, pathway } = evaluation;
  const percentage = summary.maxScore > 0
    ? Math.round((summary.totalScore / summary.maxScore) * 100)
    : 0;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#005E6E] text-white p-5">
          <h2 className="text-lg font-bold">Assessment summary</h2>
          <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-90">
            <span>Tool: <strong>{tool.name || "Not provided"}</strong></span>
            {tool.editor && <span>Publisher: <strong>{tool.editor}</strong></span>}
            <span>Path: <strong>{PATHWAY_LABELS[pathway] || pathway}</strong></span>
          </div>
        </div>

        {/* Total score */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-[#2D3648]">Overall score</span>
            <span className="text-2xl font-bold text-[#005E6E]">
              {summary.totalScore} / {summary.maxScore}
              <span className="text-sm font-normal text-gray-500 ml-2">({percentage}%)</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Scores per dimension */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(DIMENSION_CONFIG) as Array<keyof typeof DIMENSION_CONFIG>).map((key) => {
              const config = DIMENSION_CONFIG[key];
              const dim = dimensions[key];
              const Icon = config.icon;
              const dimPct = dim.maxScore > 0
                ? Math.round((dim.score / dim.maxScore) * 100)
                : 0;

              return (
                <div
                  key={key}
                  className={`rounded-lg p-4 border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className={config.color} />
                    <span className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {dim.score} / {dim.maxScore}
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${config.barColor} transition-all duration-500`}
                      style={{ width: `${dimPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Criteria detail */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-[#2D3648] mb-4">Detail by criterion</h3>
          <div className="space-y-6">
            {(Object.keys(DIMENSION_CONFIG) as Array<keyof typeof DIMENSION_CONFIG>).map((key) => {
              const config = DIMENSION_CONFIG[key];
              const dim = dimensions[key];
              if (dim.criteria.length === 0) return null;

              return (
                <div key={key}>
                  <h4 className={`text-sm font-semibold ${config.color} mb-2`}>
                    {config.label}
                  </h4>
                  <div className="space-y-2">
                    {dim.criteria.map((criterion: CriterionResponse) => (
                      <div
                        key={criterion.id}
                        className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {getLevelIcon(criterion.response)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{criterion.question}</p>
                          <p className="text-xs text-[#005E6E] font-medium mt-0.5">
                            → {criterion.responseText}
                          </p>
                          {criterion.warning && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              ⚠ {criterion.warning}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {getLevelLabel(criterion.response)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings */}
        {summary.warnings.length > 0 && (
          <div className="p-5 border-b border-[#E5E7EB] bg-amber-50">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} />
              Points of caution ({summary.warnings.length})
            </h3>
            <ul className="space-y-1">
              {summary.warnings.map((w, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-amber-400 rounded-full flex-shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Eliminating criteria */}
        {summary.eliminatingCriteria.length > 0 && (
          <div className="p-5 border-b border-[#E5E7EB] bg-red-50">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <X size={16} />
              Eliminating criteria ({summary.eliminatingCriteria.length})
            </h3>
            <ul className="space-y-1">
              {summary.eliminatingCriteria.map((c, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export button */}
        <div className="p-5 text-center">
          <button
            onClick={() => downloadJSON(evaluation)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#005E6E] hover:bg-[#005E6E]/80 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Download size={18} />
            Export the assessment (.json)
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Keep this file to compare with other tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultSummary;
