import React, { useState, useEffect } from 'react';
import { DisasterType, Severity, ResourceType, EmergencyRequest } from '../types';
import { Send, MapPin, AlertTriangle, Info, Shield, Radio, Wand2 } from 'lucide-react';
import { VoiceReportButton } from './VoiceReportButton';
import { calculateRuleBasedSeverity, extractDisasterType } from '../services/severityClassifier';
import { analyzeTextWithML } from '../services/mlSeverityBoost';

interface ReportViewProps {
  onSubmit: (data: Partial<EmergencyRequest>) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>(DisasterType.OTHER);
  const [severity, setSeverity] = useState<Severity>(Severity.LOW);
  const [resourceNeeded, setResourceNeeded] = useState<ResourceType>(ResourceType.AMBULANCE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlScore, setMlScore] = useState<number | null>(null);

  // Auto-classify when description changes (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (description.length > 5) {
        setIsProcessing(true);

        // 1. Rule-based classification (Instant)
        const ruleResult = calculateRuleBasedSeverity(description, disasterType);

        // 2. ML Classification (Async)
        const mlResult = await analyzeTextWithML(description);
        setMlScore(mlResult.toxicityScore);

        // Combined Logic
        let finalSeverity = ruleResult.severity; // Start with rule-based
        if (mlResult.adjustedSeverity) {
          // Upgrade severity if ML detects high threat/toxicity
          // Only upgrade, never downgrade based on toxicity alone for safety
          const severityLevels = [Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL];
          const currentIdx = severityLevels.indexOf(finalSeverity);
          const mlIdx = severityLevels.indexOf(mlResult.adjustedSeverity);

          if (mlIdx > currentIdx) {
            finalSeverity = mlResult.adjustedSeverity;
          }
        }

        setSeverity(finalSeverity);

        // Auto-detect disaster type if still compatible
        const detectedType = extractDisasterType(description);
        if (detectedType !== DisasterType.OTHER) {
          setDisasterType(detectedType);
        }

        setIsProcessing(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [description]);

  const handleVoiceTranscript = (text: string) => {
    setDescription(prev => prev + (prev ? ' ' : '') + text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description,
      disasterType,
      severity,
      resourceNeeded,
      priorityScore: 0 // Will be calculated by system
    });
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.LOW: return 'bg-blue-500';
      case Severity.MEDIUM: return 'bg-yellow-500';
      case Severity.HIGH: return 'bg-orange-500';
      case Severity.CRITICAL: return 'bg-red-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              Emergency Report
            </h2>
            <p className="text-slate-400 text-sm mt-1">Submit a new incident report for immediate assistance.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Situation Description</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all pr-16"
                placeholder="Describe the emergency... (e.g., 'Fire at the central market, many people trapped')"
                required
              />
              <div className="absolute right-4 bottom-4">
                <VoiceReportButton onTranscript={handleVoiceTranscript} />
              </div>
            </div>
            {isProcessing && (
              <div className="text-xs text-blue-500 flex items-center gap-1 mt-2">
                <Wand2 className="w-3 h-3 animate-spin" />
                AI Analyzing severity...
              </div>
            )}
            {mlScore !== null && mlScore > 0.01 && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Threat Detection Score: {(mlScore * 100).toFixed(0)}%
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Disaster Type</label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(DisasterType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Resource Needed</label>
              <select
                value={resourceNeeded}
                onChange={(e) => setResourceNeeded(e.target.value as ResourceType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(ResourceType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Estimated Severity</label>
              <div className="relative group">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Severity is auto-calculated based on keywords (e.g. "fire", "death") and AI threat detection.
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {[Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${severity === s
                      ? getSeverityColor(s) + ' text-white shadow-lg scale-105'
                      : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              Submit Emergency Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};