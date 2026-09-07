import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";
import { decisionTreeData } from "@/data/decisionTreeData";
import {
  Pathway,
  Region,
  ToolInfo,
  Choice,
  Step,
  CriterionResponse,
  HistoryEntry,
  EvaluationExport,
} from "@/types/evaluation";
import {
  buildCriterionResponse,
  buildHistoryEntry,
  buildEvaluationExport,
  downloadJSON,
} from "@/lib/scoring";
import RegionSelector from "./RegionSelector";
import PathwaySelector from "./PathwaySelector";
import ToolInfoForm from "./ToolInfoForm";
import StepCard from "./StepCard";
import ResultSummary from "./ResultSummary";

const DecisionTree: React.FC = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [pathway, setPathway] = useState<Pathway | null>(null);
  const [toolInfo, setToolInfo] = useState<ToolInfo>({ name: "", url: "", editor: "" });
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [criteriaByDimension, setCriteriaByDimension] = useState<Record<string, CriterionResponse[]>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [choiceByStep, setChoiceByStep] = useState<Record<string, Choice>>({});
  const [evaluation, setEvaluation] = useState<EvaluationExport | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isFrance = region === "france";

  const getStep = (id: string): Step | undefined => {
    return decisionTreeData.find((s) => s.id === id);
  };

  const scrollToStep = (stepId: string) => {
    setTimeout(() => {
      const el = document.getElementById(`step-${stepId}`);
      if (el) {
        const offset = el.getBoundingClientRect().top;
        window.parent.postMessage({ type: 'iframeScrollTo', offset }, '*');
      }
    }, 100);
  };

  const resolveNextStep = (step: Step, choice: Choice): string => {
    const next = choice.nextStep;

    // Compliance routing: replace step 3 (GDPR self-assessment) with the
    // path adapted to context and region. Non-EU/EEA users skip the whole
    // GDPR / AI Act / hosting-sovereignty chain entirely.
    if (next === "3") {
      if (region === "non-europe") {
        return "4.1-gen";
      }

      const isEN = pathway === "students" ||
        (pathway === "professional" && choiceByStep["0.1"] &&
         !choiceByStep["0.1"].text.includes("Other professional context"));
      const isTest = choiceByStep["0.2"]?.text?.includes("testing or exploring");

      if (isEN) {
        if (isTest) {
          const base = pathway === "students" ? "3.eleves-test" : "3.test-en";
          return isFrance ? base : `${base}-gen`;
        }
        return isFrance ? "3.registre" : "3.registre-gen";
      }
    }

    // GDPR non-compliant + students: eliminating, straight to reject
    if (next === "3.1" && pathway === "students") {
      return "reject";
    }

    // Accessibility: France (RGAA+WCAG) vs generalized (WCAG only)
    if (next === "4.1" && !isFrance) {
      return "4.1-gen";
    }

    // Pedagogical branch entry point: France vs generalized
    if (next === "13" && !isFrance) {
      return "13-gen";
    }

    // Pedagogical validation step: France vs generalized
    if (next === "15" && !isFrance) {
      return "15-gen";
    }

    // Personal pathway: ends after biases (no professional-values branch)
    if (pathway === "personal" && next === "11") {
      return "success";
    }

    // Professional pathway: ends after collaborative values (no pedagogical branch)
    if (pathway === "professional" && next === "13") {
      return "success";
    }

    return next;
  };

  const startRegion = (selected: Region) => {
    setRegion(selected);
  };

  const startPathway = (selected: Pathway) => {
    setPathway(selected);
    let firstStep: string;
    switch (selected) {
      case "professional":
        firstStep = "0.1";
        break;
      case "students":
        firstStep = "0.2";
        break;
      default:
        firstStep = "1";
    }
    setCurrentPath([firstStep]);
    setExpandedSteps(new Set([firstStep]));
    scrollToStep(firstStep);
  };

  const handleChoice = (step: Step, choice: Choice) => {
    const historyEntry = buildHistoryEntry(step, choice);
    setHistory((prev) => [...prev, historyEntry]);

    setChoiceByStep((prev) => ({ ...prev, [step.id]: choice }));

    const criterion = buildCriterionResponse(step, choice);
    if (criterion) {
      setCriteriaByDimension((prev) => {
        const dim = step.dimension;
        const existing = prev[dim] || [];
        const filtered = existing.filter((c) => c.id !== criterion.id);
        return { ...prev, [dim]: [...filtered, criterion] };
      });
    }

    const nextStep = resolveNextStep(step, choice);

    if (nextStep === "export") {
      const passed = currentPath.includes("success");
      const evalExport = buildEvaluationExport(
        toolInfo,
        pathway!,
        region!,
        criteriaByDimension,
        history,
        passed
      );
      setEvaluation(evalExport);
      downloadJSON(evalExport);
      return;
    }

    if (nextStep === "0") {
      resetTree();
      return;
    }

    if (["success", "reject", "final-reject", "reconsider"].includes(nextStep)) {
      const stepData = getStep(nextStep);
      if (stepData) {
        const newPath = [...currentPath, nextStep];
        setCurrentPath(newPath);
        setExpandedSteps(new Set([nextStep]));

        if (["success", "reject", "final-reject"].includes(nextStep)) {
          const passed = nextStep === "success";
          const evalExport = buildEvaluationExport(
            toolInfo,
            pathway!,
            region!,
            criteriaByDimension,
            [...history, historyEntry],
            passed
          );
          setEvaluation(evalExport);
        }

        scrollToStep(nextStep);
        return;
      }
    }

    const nextStepData = getStep(nextStep);
    if (!nextStepData) return;

    const newPath = [...currentPath, nextStep];
    setCurrentPath(newPath);
    setExpandedSteps(new Set([nextStep]));
    scrollToStep(nextStep);
  };

  const jumpToStep = (index: number) => {
    if (index >= currentPath.length - 1) return;
    const targetStepId = currentPath[index];
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    setExpandedSteps(new Set([targetStepId]));
    setEvaluation(null);

    const removedSteps = currentPath.slice(index + 1);
    setHistory((prev) =>
      prev.filter((h) => !removedSteps.includes(h.stepId))
    );

    const newChoices = { ...choiceByStep };
    removedSteps.forEach((id) => delete newChoices[id]);
    setChoiceByStep(newChoices);

    const newCriteria = { ...criteriaByDimension };
    Object.keys(newCriteria).forEach((dim) => {
      newCriteria[dim] = newCriteria[dim].filter(
        (c) => !removedSteps.includes(c.id)
      );
    });
    setCriteriaByDimension(newCriteria);

    scrollToStep(targetStepId);
  };

  const resetTree = () => {
    // Note: region is deliberately NOT reset here — restarting to evaluate
    // another tool doesn't change where the user is based.
    setPathway(null);
    setCurrentPath([]);
    setExpandedSteps(new Set());
    setCriteriaByDimension({});
    setHistory([]);
    setChoiceByStep({});
    setEvaluation(null);
    setToolInfo({ name: "", url: "", editor: "" });

    toast({
      title: "Assessment reset",
      description: "You can start over with a new tool",
    });
  };

  const isConclusion = (stepId: string) =>
    ["success", "reject", "final-reject"].includes(stepId);

  return (
        <div className="max-w-4xl mx-auto py-12 px-4 bg-white font-marianne" ref={treeRef}>
        <div className="flex flex-col items-center justify-center mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#005E6E] leading-tight mb-4">
          Choosing an application
          <br />
          using generative AI
        </h1>
        <div className="w-20 h-1 bg-[#005E6E] rounded-full mb-4" />
        <p className="text-sm text-gray-500 mb-6 max-w-lg">
          Methodically assess an AI tool across 4 dimensions: compliance,
          utility, usability, and acceptability.
        </p>
        {pathway && (
          <button
            onClick={resetTree}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EEF1FF] hover:bg-[#E2E7FF] text-[#005E6E] transition-colors shadow-sm"
          >
            <RotateCcw size={18} />
            <span className="text-sm font-medium">Start over</span>
          </button>
        )}
      </div>

      {!region ? (
        <RegionSelector onSelect={startRegion} />
      ) : !pathway ? (
        <PathwaySelector onSelect={startPathway} />
      ) : (
        <>
          <ToolInfoForm toolInfo={toolInfo} onChange={setToolInfo} />

          <div className="space-y-6">
            {currentPath.map((stepId, index) => {
              const step = getStep(stepId);
              if (!step) return null;

              const isLast = index === currentPath.length - 1;
              const isExpanded = expandedSteps.has(stepId);
              const selectedChoice = choiceByStep[stepId];
              const outcomeLevel = selectedChoice?.complianceLevel;

              return (
                <StepCard
                  key={`${stepId}-${index}`}
                  step={step}
                  isExpanded={isExpanded}
                  isLastStep={isLast}
                  isConclusion={isConclusion(stepId)}
                  outcomeLevel={outcomeLevel}
                  onChoice={(choice) => handleChoice(step, choice)}
                  onJumpBack={() => jumpToStep(index)}
                />
              );
            })}
          </div>

          {evaluation && <ResultSummary evaluation={evaluation} />}
        </>
      )}

      <footer className="mt-16 py-6 border-t border-[#E5E7EB] text-center">
        <p className="mb-2 text-sm text-[#6B7280]">
          Version 2 — extended, and partly inspired by the assessment model of{" "}
          <a
            href="https://edutice.hal.science/edutice-00000154"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#005E6E] hover:underline"
          >
            Tricot et al. (2003)
          </a>{" "}
          — Utility, Usability, Acceptability.
        </p>
        <p className="mb-2 text-sm text-[#6B7280]">
          <a
            href="https://github.com/uneIAparjour/choix-outil-ia/tree/main"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#005E6E] hover:underline"
          >
            Version 1
          </a>
          {" "}available on GitHub.
        </p>
        <p className="mb-2 text-sm text-[#6B7280]">
          Made by{" "}
          <a
            href="https://www.uneiaparjour.fr/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#005E6E] hover:underline"
          >
            uneIAparjour.fr
          </a>
          . Released under a{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#005E6E] hover:underline"
          >
            CC BY license
          </a>
          .
        </p>
        <p className="text-sm text-[#6B7280]">
          <a
            href="https://github.com/uneIAparjour/choix-outil-ia-en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#005E6E] hover:underline"
          >
            Source code
          </a>
          {" "}— Last updated: September 2026
        </p>
      </footer>
    </div>
  );
};

export default DecisionTree;
