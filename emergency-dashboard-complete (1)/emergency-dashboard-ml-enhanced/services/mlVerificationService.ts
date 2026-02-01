// ML Verification Service - Disaster Authentication & Spam Detection
import { EmergencyRequest, DisasterType, Severity } from '../types';

export interface VerificationResult {
  isAuthentic: boolean;
  confidence: number;
  spamScore: number;
  trustScore: number;
  similarReports: string[];
  recommendation: 'approve' | 'review' | 'reject';
  reasons: string[];
}

export interface ImageAnalysis {
  hasDisaster: boolean;
  disasterType: DisasterType | null;
  severity: Severity;
  confidence: number;
  features: string[];
}

export interface LocationCluster {
  center: { lat: number; lng: number };
  reports: string[];
  count: number;
  averageSeverity: Severity;
  timeWindow: number;
}

export interface UserTrustProfile {
  userId: string;
  totalReports: number;
  verifiedReports: number;
  spamReports: number;
  trustScore: number;
  lastReportTime: number;
}

class MLVerificationService {
  private readonly SPAM_THRESHOLD = 0.7;
  private readonly SIMILARITY_RADIUS = 0.005; // ~500 meters
  private readonly TIME_WINDOW = 30 * 60 * 1000; // 30 minutes
  private readonly MIN_TRUST_SCORE = 30;
  private readonly SPAM_INJECTION_RATE = 0.2; // 20% spam as per Mutation A

  async analyzeImage(imageData: string): Promise<ImageAnalysis> {
    await this.delay(200);
    const features = this.extractImageFeatures(imageData);
    const detectedDisaster = this.detectDisasterType(features);
    const severity = this.estimateSeverity(features);

    return {
      hasDisaster: features.length >= 3,
      disasterType: detectedDisaster,
      severity: severity,
      confidence: Math.min(0.95, 0.6 + (features.length * 0.08)),
      features: features
    };
  }

  async verifyReport(
    report: Partial<EmergencyRequest>,
    imageData: string | null,
    userProfile: UserTrustProfile,
    existingReports: EmergencyRequest[]
  ): Promise<VerificationResult> {
    const reasons: string[] = [];
    let spamScore = 0;
    let authenticityScore = 0;

    const isSimulatedSpam = Math.random() < this.SPAM_INJECTION_RATE;
    if (isSimulatedSpam) {
      spamScore += 0.5;
      reasons.push('⚠️ Flagged by spam detection');
    }

    const trustScore = this.calculateTrustScore(userProfile);
    if (trustScore < this.MIN_TRUST_SCORE) {
      spamScore += 0.3;
      reasons.push(`⚠️ Low trust: ${trustScore}/100`);
    } else {
      authenticityScore += 0.3 * (trustScore / 100);
      reasons.push(`✓ Trust verified: ${trustScore}/100`);
    }

    let imageAnalysis: ImageAnalysis | null = null;
    if (imageData) {
      imageAnalysis = await this.analyzeImage(imageData);
      if (imageAnalysis.hasDisaster && imageAnalysis.confidence > 0.6) {
        authenticityScore += 0.4 * imageAnalysis.confidence;
        reasons.push(`✓ Image verified: ${imageAnalysis.disasterType} (${Math.round(imageAnalysis.confidence * 100)}%)`);
      } else {
        spamScore += 0.4;
        reasons.push('❌ Image lacks disaster evidence');
      }
    } else {
      spamScore += 0.5;
      reasons.push('❌ No image (mandatory)');
    }

    const clusters = this.findLocationClusters(report, existingReports);
    if (clusters.length > 0) {
      const mainCluster = clusters[0];
      if (mainCluster.count >= 3 && mainCluster.count <= 20) {
        authenticityScore += 0.3;
        reasons.push(`✓ Verified by ${mainCluster.count} reports`);
      } else if (mainCluster.count > 20) {
        spamScore += 0.35;
        reasons.push(`⚠️ Spam attack: ${mainCluster.count} reports`);
      } else {
        authenticityScore += 0.15;
      }
    }

    const finalSpamScore = Math.min(1, spamScore);
    const isAuthentic = authenticityScore > 0.5 && finalSpamScore < this.SPAM_THRESHOLD;
    
    let recommendation: 'approve' | 'review' | 'reject';
    if (finalSpamScore > 0.8 || !imageData) recommendation = 'reject';
    else if (finalSpamScore > 0.5 || authenticityScore < 0.4) recommendation = 'review';
    else recommendation = 'approve';

    return {
      isAuthentic,
      confidence: authenticityScore,
      spamScore: finalSpamScore,
      trustScore,
      similarReports: clusters.length > 0 ? clusters[0].reports : [],
      recommendation,
      reasons
    };
  }

  async verifyCompletion(
    completionImage: string,
    requestId: string,
    responderId: string
  ): Promise<{ verified: boolean; confidence: number; reason: string }> {
    await this.delay(200);
    const features = this.extractImageFeatures(completionImage);
    
    const hasRescueTeam = features.includes('people_uniform') || features.includes('rescue_vehicle');
    const hasVictims = features.includes('people_group') || features.includes('person');
    const hasEquipment = features.includes('medical_equipment') || features.includes('rescue_gear');

    const confidence = (hasRescueTeam ? 0.4 : 0) + (hasVictims ? 0.3 : 0) + (hasEquipment ? 0.3 : 0);
    const verified = confidence >= 0.6;

    return {
      verified,
      confidence,
      reason: verified ? `✓ Completion verified` : `⚠️ Insufficient evidence`
    };
  }

  calculateTrustScore(profile: UserTrustProfile): number {
    if (profile.totalReports === 0) return 50;
    const verificationRate = profile.verifiedReports / profile.totalReports;
    const spamRate = profile.spamReports / profile.totalReports;

    let score = 50;
    score += verificationRate * 40;
    score -= spamRate * 60;
    score += Math.min(profile.totalReports * 2, 20);

    const timeSinceLastReport = Date.now() - profile.lastReportTime;
    if (timeSinceLastReport < 5 * 60 * 1000) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  private findLocationClusters(
    newReport: Partial<EmergencyRequest>,
    existingReports: EmergencyRequest[]
  ): LocationCluster[] {
    if (!newReport.location) return [];

    const nearbyReports = existingReports.filter(r => {
      if (!r.location) return false;
      const distance = this.calculateDistance(newReport.location!, r.location);
      const timeDiff = Math.abs(Date.now() - new Date(r.timestamp).getTime());
      return distance < this.SIMILARITY_RADIUS && timeDiff < this.TIME_WINDOW;
    });

    if (nearbyReports.length === 0) return [];

    return [{
      center: newReport.location,
      reports: nearbyReports.map(r => r.id),
      count: nearbyReports.length,
      averageSeverity: this.calculateAverageSeverity(nearbyReports),
      timeWindow: this.TIME_WINDOW
    }];
  }

  private extractImageFeatures(imageData: string): string[] {
    const features: string[] = [];
    const hash = this.simpleHash(imageData);
    
    if (hash % 10 < 7) features.push('smoke_pattern');
    if (hash % 13 < 6) features.push('debris');
    if (hash % 17 < 5) features.push('water_flooding');
    if (hash % 19 < 4) features.push('fire_flames');
    if (hash % 23 < 6) features.push('collapsed_structure');
    if (hash % 29 < 3) features.push('emergency_vehicle');
    if (hash % 31 < 5) features.push('people_group');
    if (hash % 37 < 4) features.push('medical_equipment');
    if (hash % 41 < 3) features.push('rescue_vehicle');
    if (hash % 43 < 4) features.push('people_uniform');
    if (hash % 47 < 3) features.push('rescue_gear');
    if (hash % 53 < 2) features.push('person');
    
    return features;
  }

  private detectDisasterType(features: string[]): DisasterType | null {
    if (features.includes('fire_flames') || features.includes('smoke_pattern')) return DisasterType.FIRE;
    if (features.includes('water_flooding')) return DisasterType.FLOOD;
    if (features.includes('collapsed_structure') && features.includes('debris')) return DisasterType.EARTHQUAKE;
    if (features.includes('medical_equipment')) return DisasterType.MEDICAL_EMERGENCY;
    return null;
  }

  private estimateSeverity(features: string[]): Severity {
    if (features.length >= 6) return Severity.CRITICAL;
    if (features.length >= 4) return Severity.HIGH;
    if (features.length >= 2) return Severity.MEDIUM;
    return Severity.LOW;
  }

  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateAverageSeverity(reports: EmergencyRequest[]): Severity {
    const severityValues = { [Severity.LOW]: 1, [Severity.MEDIUM]: 2, [Severity.HIGH]: 3, [Severity.CRITICAL]: 4 };
    const avg = reports.reduce((sum, r) => sum + severityValues[r.severity], 0) / reports.length;
    if (avg >= 3.5) return Severity.CRITICAL;
    if (avg >= 2.5) return Severity.HIGH;
    if (avg >= 1.5) return Severity.MEDIUM;
    return Severity.LOW;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mlVerificationService = new MLVerificationService();
