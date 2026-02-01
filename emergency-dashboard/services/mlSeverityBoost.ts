import * as toxicity from '@tensorflow-models/toxicity';
import { Severity } from '../types';

let model: toxicity.ToxicityClassifier | null = null;
let isModelLoading = false;

export const loadModel = async () => {
    if (model || isModelLoading) return;
    try {
        isModelLoading = true;
        console.log('Loading Toxicity Model...');
        // Threshold of 0.7 for confidence
        model = await toxicity.load(0.6, ['threat', 'severe_toxicity', 'toxicity']);
        console.log('Toxicity Model Loaded');
    } catch (err) {
        console.error('Failed to load TFJS model', err);
    } finally {
        isModelLoading = false;
    }
};

export interface MLAnalysisResult {
    toxicityScore: number;
    isThreat: boolean;
    isSevere: boolean;
    adjustedSeverity: Severity | null;
}

export const analyzeTextWithML = async (text: string): Promise<MLAnalysisResult> => {
    if (!model) {
        await loadModel();
        if (!model) {
            return {
                toxicityScore: 0,
                isThreat: false,
                isSevere: false,
                adjustedSeverity: null
            };
        }
    }

    try {
        const predictions = await model.classify([text]);

        let isThreat = false;
        let isSevere = false;
        let toxicityScore = 0;

        predictions.forEach(prediction => {
            const match = prediction.results[0].match;
            if (match) {
                if (prediction.label === 'threat') isThreat = true;
                if (prediction.label === 'severe_toxicity') isSevere = true;
                // Use probability as score
                if (prediction.results[0].probabilities[1] > toxicityScore) {
                    toxicityScore = prediction.results[0].probabilities[1];
                }
            }
        });

        let adjustedSeverity: Severity | null = null;
        if (isThreat || isSevere) { // Threatening language in emergency context usually implies high urgency (e.g. "Kill him", "Dying")
            adjustedSeverity = isSevere ? Severity.CRITICAL : Severity.HIGH;
        }

        return {
            toxicityScore,
            isThreat,
            isSevere,
            adjustedSeverity
        };

    } catch (err) {
        console.error('ML Analysis failed', err);
        return {
            toxicityScore: 0,
            isThreat: false,
            isSevere: false,
            adjustedSeverity: null
        };
    }
};
