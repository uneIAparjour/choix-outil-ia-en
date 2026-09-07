import React, { useState } from "react";
import { Region } from "@/types/evaluation";
import { Globe, Flag, MapPin } from "lucide-react";

interface RegionSelectorProps {
  onSelect: (region: Region) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ onSelect }) => {
  const [step, setStep] = useState<"continent" | "country">("continent");

  if (step === "continent") {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-[#2D3648] text-center mb-2">
          Are you based in Europe (EU/EEA)?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Some assessment criteria (GDPR, the AI Act) only apply within the European Union.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            onClick={() => setStep("country")}
            className="flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200 bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-md"
          >
            <div className="mb-4 p-3 rounded-full bg-white shadow-sm text-blue-600">
              <MapPin size={28} />
            </div>
            <h3 className="font-semibold text-[#2D3648] text-lg mb-1">Yes, I'm in Europe</h3>
            <p className="text-sm text-gray-600">EU or EEA member country</p>
          </button>
          <button
            onClick={() => onSelect("non-europe")}
            className="flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200 bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:shadow-md"
          >
            <div className="mb-4 p-3 rounded-full bg-white shadow-sm text-emerald-600">
              <Globe size={28} />
            </div>
            <h3 className="font-semibold text-[#2D3648] text-lg mb-1">No, I'm elsewhere</h3>
            <p className="text-sm text-gray-600">EU/EEA-specific criteria (GDPR, AI Act) will be skipped</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-[#2D3648] text-center mb-2">
        Are you in France, or another European country?
      </h2>
      <p className="text-sm text-gray-500 text-center mb-8">
        A few criteria refer to France-specific institutions and official guidance.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={() => onSelect("france")}
          className="flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200 bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-md"
        >
          <div className="mb-4 p-3 rounded-full bg-white shadow-sm text-purple-600">
            <Flag size={28} />
          </div>
          <h3 className="font-semibold text-[#2D3648] text-lg mb-1">France</h3>
          <p className="text-sm text-gray-600">Criteria referring to French institutions and official guidance</p>
        </button>
        <button
          onClick={() => onSelect("other-europe")}
          className="flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all duration-200 bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-md"
        >
          <div className="mb-4 p-3 rounded-full bg-white shadow-sm text-blue-600">
            <MapPin size={28} />
          </div>
          <h3 className="font-semibold text-[#2D3648] text-lg mb-1">Another European country</h3>
          <p className="text-sm text-gray-600">Generalized criteria — check your own country's or institution's guidance where relevant</p>
        </button>
      </div>
    </div>
  );
};

export default RegionSelector;
