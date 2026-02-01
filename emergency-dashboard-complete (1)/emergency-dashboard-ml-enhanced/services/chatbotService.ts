import { DisasterType } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  actionRequired?: boolean;
}

class ChatbotService {
  private conversationHistory: ChatMessage[] = [];

  private knowledgeBase = {
    [DisasterType.FLOOD]: {
      immediate: [
        "Move to higher ground immediately",
        "Turn off electricity at the main switch if safe to do so",
        "Do NOT walk through moving water - 6 inches can knock you down",
        "Avoid driving through flooded areas",
        "Stay away from downed power lines"
      ],
      safety: [
        "Keep emergency kit ready with water, food, flashlight, first aid",
        "Save emergency contacts in your phone",
        "Know your evacuation routes",
        "Listen to local radio for updates",
        "Document property damage with photos"
      ],
      after: [
        "Wait for authorities before returning home",
        "Check for structural damage before entering",
        "Avoid floodwater - may be contaminated",
        "Disinfect everything that got wet",
        "Watch for displaced wildlife and insects"
      ]
    },
    [DisasterType.FIRE]: {
      immediate: [
        "Alert everyone nearby by shouting 'FIRE!'",
        "If clothes catch fire: STOP, DROP, and ROLL",
        "Stay low to avoid smoke - crawl if necessary",
        "Feel doors before opening - if hot, use another exit",
        "Close doors behind you to slow fire spread",
        "Never use elevators during a fire"
      ],
      safety: [
        "Know two ways out of every room",
        "Install smoke detectors and test monthly",
        "Keep fire extinguisher accessible",
        "Practice fire drills with family",
        "Keep flammable items away from heat sources"
      ],
      after: [
        "Do not enter damaged building",
        "Watch for hot spots that may reignite",
        "Check for gas leaks - smell and listen",
        "Document losses for insurance",
        "Contact local disaster relief services"
      ]
    },
    [DisasterType.EARTHQUAKE]: {
      immediate: [
        "DROP to hands and knees immediately",
        "Take COVER under sturdy furniture",
        "HOLD ON until shaking stops",
        "Stay away from windows, mirrors, and heavy objects",
        "If outdoors, move away from buildings and power lines",
        "If driving, pull over safely and stay in vehicle"
      ],
      safety: [
        "Secure heavy furniture and appliances to walls",
        "Store heavy items on lower shelves",
        "Keep shoes and flashlight near bed",
        "Know safe spots in each room",
        "Identify potential hazards at home/work"
      ],
      after: [
        "Expect aftershocks - they can be strong",
        "Check for injuries - provide first aid",
        "Inspect home for cracks and damage",
        "Turn off utilities if damaged",
        "Stay out of damaged buildings",
        "Text rather than call to reduce network load"
      ]
    },
    [DisasterType.MEDICAL_EMERGENCY]: {
      immediate: [
        "Call emergency services IMMEDIATELY (dial 108 or 102)",
        "Check if person is conscious and breathing",
        "If not breathing: Start CPR if trained",
        "Control bleeding with clean cloth and pressure",
        "Don't move person if spinal injury suspected",
        "Keep person warm and comfortable"
      ],
      safety: [
        "Learn basic first aid and CPR",
        "Keep first aid kit stocked",
        "Know location of nearest hospital",
        "Save ICE (In Case of Emergency) contacts",
        "Keep medical history and medications list ready"
      ],
      cpr: [
        "Push hard and fast in center of chest",
        "Rate: 100-120 compressions per minute",
        "Depth: At least 2 inches for adults",
        "Continue until help arrives or person breathes",
        "Use AED if available and you're trained"
      ]
    },
    [DisasterType.TRAFFIC_ACCIDENT]: {
      immediate: [
        "Ensure scene safety - turn on hazard lights",
        "Call emergency services (dial 108 or 112)",
        "Don't move injured unless in immediate danger",
        "Turn off vehicle engines if safe",
        "Set up warning triangles if available",
        "Take photos for insurance if minor accident"
      ],
      safety: [
        "Always wear seatbelt",
        "Don't use phone while driving",
        "Maintain safe following distance",
        "Keep emergency kit in vehicle",
        "Regular vehicle maintenance"
      ]
    }
  };

  private emergencyContacts = {
    india: [
      { service: "Police", number: "100" },
      { service: "Fire", number: "101" },
      { service: "Ambulance", number: "102 / 108" },
      { service: "Emergency", number: "112" },
      { service: "Disaster Management", number: "1078" },
      { service: "Women Helpline", number: "1091" },
      { service: "Child Helpline", number: "1098" }
    ]
  };

  getResponse(userMessage: string, disasterType?: DisasterType): ChatResponse {
    const message = userMessage.toLowerCase();
    
    // Emergency keywords
    if (this.isEmergencyQuery(message)) {
      return this.getEmergencyResponse(message, disasterType);
    }

    // First aid queries
    if (message.includes('first aid') || message.includes('cpr') || message.includes('bleeding')) {
      return this.getFirstAidResponse(message);
    }

    // Contact numbers
    if (message.includes('contact') || message.includes('number') || message.includes('helpline')) {
      return this.getContactsResponse();
    }

    // Safety tips
    if (message.includes('safe') || message.includes('prevent') || message.includes('prepare')) {
      return this.getSafetyTipsResponse(disasterType);
    }

    // Location/direction queries
    if (message.includes('where') || message.includes('nearest') || message.includes('hospital')) {
      return {
        message: "I can help you find the nearest emergency facility. Please ensure your location is enabled. Our system will automatically direct the nearest available responders to you.",
        suggestions: ["How to enable location?", "Show emergency contacts", "What to do while waiting?"]
      };
    }

    // Default helpful response
    return this.getDefaultResponse();
  }

  private isEmergencyQuery(message: string): boolean {
    const emergencyKeywords = ['help', 'emergency', 'urgent', 'what do', 'how to', 'flood', 'fire', 'earthquake', 'accident', 'injured'];
    return emergencyKeywords.some(keyword => message.includes(keyword));
  }

  private getEmergencyResponse(message: string, disasterType?: DisasterType): ChatResponse {
    // Detect disaster type from message if not provided
    let detectedType = disasterType;
    
    if (!detectedType) {
      if (message.includes('flood') || message.includes('water')) detectedType = DisasterType.FLOOD;
      else if (message.includes('fire') || message.includes('smoke') || message.includes('burn')) detectedType = DisasterType.FIRE;
      else if (message.includes('earthquake') || message.includes('tremor') || message.includes('shake')) detectedType = DisasterType.EARTHQUAKE;
      else if (message.includes('accident') || message.includes('crash') || message.includes('collision')) detectedType = DisasterType.TRAFFIC_ACCIDENT;
      else if (message.includes('injured') || message.includes('hurt') || message.includes('bleeding') || message.includes('unconscious')) detectedType = DisasterType.MEDICAL_EMERGENCY;
    }

    if (detectedType && this.knowledgeBase[detectedType]) {
      const knowledge = this.knowledgeBase[detectedType];
      const immediateSteps = knowledge.immediate.slice(0, 5).map((step, i) => `${i + 1}. ${step}`).join('\n');
      
      return {
        message: `🚨 IMMEDIATE ACTIONS FOR ${detectedType}:\n\n${immediateSteps}\n\n⚠️ If you're in immediate danger, call emergency services NOW: 112 or 108`,
        suggestions: ["What to do after?", "Safety tips", "Emergency contacts"],
        actionRequired: true
      };
    }

    return {
      message: "🚨 EMERGENCY PROTOCOL:\n\n1. Stay calm and assess the situation\n2. Ensure your immediate safety\n3. Call emergency services: 112 (India)\n4. If safe, help others nearby\n5. Follow official instructions\n\nPlease describe your emergency for specific guidance.",
      suggestions: ["Flood emergency", "Fire emergency", "Medical emergency", "Accident emergency"]
    };
  }

  private getFirstAidResponse(message: string): ChatResponse {
    if (message.includes('cpr') || message.includes('not breathing')) {
      const cprSteps = this.knowledgeBase[DisasterType.MEDICAL_EMERGENCY].cpr;
      return {
        message: `🫀 CPR INSTRUCTIONS:\n\n${cprSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n⚠️ CALL 108/112 FIRST before starting CPR!`,
        suggestions: ["Bleeding control", "Shock treatment", "Emergency contacts"],
        actionRequired: true
      };
    }

    if (message.includes('bleed')) {
      return {
        message: "🩸 BLEEDING CONTROL:\n\n1. Apply direct pressure with clean cloth\n2. Keep pressure for 10-15 minutes\n3. Don't remove cloth if soaked - add more on top\n4. Elevate wounded area above heart if possible\n5. Call 108 if bleeding doesn't stop\n\n⚠️ For severe bleeding, call emergency immediately!",
        suggestions: ["CPR instructions", "Shock treatment", "Emergency contacts"],
        actionRequired: true
      };
    }

    return {
      message: "🏥 FIRST AID BASICS:\n\n• Check for danger before helping\n• Call emergency services first\n• Check breathing and pulse\n• Control bleeding with pressure\n• Keep person warm and calm\n• Don't give food or water if unconscious\n\nWhat specific first aid do you need?",
      suggestions: ["CPR instructions", "Bleeding control", "Burn treatment"]
    };
  }

  private getContactsResponse(): ChatResponse {
    const contacts = this.emergencyContacts.india
      .map(c => `📞 ${c.service}: ${c.number}`)
      .join('\n');

    return {
      message: `🆘 EMERGENCY CONTACTS (INDIA):\n\n${contacts}\n\n💡 TIP: Dial 112 for any emergency - it's a universal number that connects to all services.`,
      suggestions: ["How to report emergency?", "What information to provide?"]
    };
  }

  private getSafetyTipsResponse(disasterType?: DisasterType): ChatResponse {
    if (disasterType && this.knowledgeBase[disasterType]) {
      const tips = this.knowledgeBase[disasterType].safety.slice(0, 5).map((tip, i) => `${i + 1}. ${tip}`).join('\n');
      
      return {
        message: `🛡️ SAFETY TIPS FOR ${disasterType}:\n\n${tips}\n\nStay prepared and stay safe!`,
        suggestions: ["What to do during emergency?", "After emergency care"]
      };
    }

    return {
      message: "🛡️ GENERAL SAFETY TIPS:\n\n1. Keep emergency kit ready (water, food, first aid, flashlight)\n2. Know emergency contacts and evacuation routes\n3. Practice emergency drills with family\n4. Stay informed through official channels\n5. Help elderly and children during emergencies\n\nWhich specific disaster safety tips do you need?",
      suggestions: ["Flood safety", "Fire safety", "Earthquake safety"]
    };
  }

  private getDefaultResponse(): ChatResponse {
    return {
      message: "👋 I'm your Emergency Response Assistant. I can help with:\n\n• Emergency guidance for disasters\n• First aid instructions\n• Emergency contact numbers\n• Safety tips and preparedness\n• Location-based help\n\nHow can I assist you today?",
      suggestions: ["Emergency contacts", "First aid guide", "Safety tips", "Report emergency"]
    };
  }

  addMessage(role: 'user' | 'assistant', content: string): ChatMessage {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date()
    };
    this.conversationHistory.push(message);
    return message;
  }

  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const chatbotService = new ChatbotService();
