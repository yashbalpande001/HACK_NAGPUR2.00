import { Severity, DisasterType } from '../types';

interface SeverityRule {
    keywords: string[];
    baseSeverity: Severity;
    score: number;
}

const SEVERITY_RULES: SeverityRule[] = [
    {
        keywords: ['death', 'dead', 'dying', 'killed', 'fatality', 'casualties', 'unconscious', 'cardiac arrest', 'stroke', 'bleeding', 'gunshot', 'trapped'],
        baseSeverity: Severity.CRITICAL,
        score: 10
    },
    {
        keywords: ['fire', 'explosion', 'collapsed', 'flood', 'drowning', 'attack', 'robbery', 'violent', 'hostage'],
        baseSeverity: Severity.HIGH,
        score: 7
    },
    {
        keywords: ['injury', 'injured', 'broken', 'pain', 'accident', 'crash', 'collision', 'smoke', 'leaking'],
        baseSeverity: Severity.MEDIUM,
        score: 5
    },
    {
        keywords: ['lost', 'stuck', 'minor', 'traffic', 'jam', 'theft', 'stolen'],
        baseSeverity: Severity.LOW,
        score: 2
    }
];

export const calculateRuleBasedSeverity = (text: string, disasterType: DisasterType): { severity: Severity; score: number } => {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let severity = Severity.LOW;

    // Base score from Disaster Type
    if (disasterType === DisasterType.EARTHQUAKE || disasterType === DisasterType.CHEMICAL_SPILL) {
        maxScore = 3;
        severity = Severity.MEDIUM;
    }

    // Check keywords
    SEVERITY_RULES.forEach(rule => {
        const match = rule.keywords.some(keyword => lowerText.includes(keyword));
        if (match) {
            if (rule.score > maxScore) {
                maxScore = rule.score;
                severity = rule.baseSeverity;
            }
        }
    });

    return { severity, score: maxScore };
};

export const extractDisasterType = (text: string): DisasterType => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('fire') || lowerText.includes('flame') || lowerText.includes('smoke')) return DisasterType.FIRE;
    if (lowerText.includes('water') || lowerText.includes('flood') || lowerText.includes('drowning')) return DisasterType.FLOOD;
    if (lowerText.includes('shake') || lowerText.includes('earthquake')) return DisasterType.EARTHQUAKE;
    if (lowerText.includes('sick') || lowerText.includes('pain') || lowerText.includes('heart') || lowerText.includes('attack') || lowerText.includes('bleed')) return DisasterType.MEDICAL_EMERGENCY;
    if (lowerText.includes('accident') || lowerText.includes('crash') || lowerText.includes('collision')) return DisasterType.TRAFFIC_ACCIDENT;
    if (lowerText.includes('theft') || lowerText.includes('stolen') || lowerText.includes('rob')) return DisasterType.THEFT;

    return DisasterType.OTHER;
};
