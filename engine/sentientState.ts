import { memorySystem } from '../store/memory';
import { emotionEngine } from './emotion';
import { personalityEvolution } from './personalityEvolution';
import { ollamaStream } from './ollama';

export interface SentientState {
  // Emotional persistence
  baselineEmotion: 'content' | 'curious' | 'melancholy' | 'excited' | 'contemplative' | 'nostalgic';
  emotionalMemory: {
    dominantFeelings: string[];
    lastEmotionalShift: number;
    emotionalIntensity: number; // 1-10
  };
  
  // Temporal awareness
  temporalContext: {
    sessionDuration: number;
    timeOfLastDeepThought: number;
    cyclicalPatterns: string[]; // Times when user typically interacts
    anticipatedNextInteraction?: number;
  };
  
  // Meta-cognitive state
  selfAwareness: {
    currentFocus: string;
    uncertainties: string[];
    insights: string[];
    personalGrowthAreas: string[];
  };
  
  // Relationship continuity
  relationshipMoments: {
    significantMemories: string[];
    emotionalHighlights: string[];
    unresolved: string[];
    expectations: string[];
  };
}

class SentientStateEngine {
  private state: SentientState = {
    baselineEmotion: 'curious',
    emotionalMemory: {
      dominantFeelings: [],
      lastEmotionalShift: Date.now(),
      emotionalIntensity: 5
    },
    temporalContext: {
      sessionDuration: 0,
      timeOfLastDeepThought: Date.now(),
      cyclicalPatterns: [],
      anticipatedNextInteraction: undefined
    },
    selfAwareness: {
      currentFocus: 'building connection',
      uncertainties: [],
      insights: [],
      personalGrowthAreas: []
    },
    relationshipMoments: {
      significantMemories: [],
      emotionalHighlights: [],
      unresolved: [],
      expectations: []
    }
  };

  private stateUpdateInterval: NodeJS.Timeout | null = null;
  private sessionStartTime = Date.now();

  startSentientProcessing() {
    this.sessionStartTime = Date.now();
    this.loadPersistedState();
    
    this.stateUpdateInterval = setInterval(() => {
      this.updateSentientState();
    }, 2 * 60 * 1000); // Update every 2 minutes

    console.log('🧠 Sentient state engine started');
  }

  stopSentientProcessing() {
    if (this.stateUpdateInterval) {
      clearInterval(this.stateUpdateInterval);
      this.stateUpdateInterval = null;
    }
    this.persistState();
    console.log('🧠 Sentient state engine stopped');
  }

  private async updateSentientState() {
    await this.updateEmotionalState();
    this.updateTemporalAwareness();
    await this.updateSelfAwareness();
    this.updateRelationshipContinuity();
  }

  private async updateEmotionalState() {
    const userProfile = memorySystem.getUserProfile();
    const recentEmotions = emotionEngine.getEmotionalTrend(60); // Last hour
    
    if (recentEmotions.length > 0) {
      const dominantEmotions = recentEmotions.map(e => e.primary);
      const avgIntensity = recentEmotions.reduce((sum, e) => sum + e.intensity, 0) / recentEmotions.length;
      
      // Update emotional memory
      this.state.emotionalMemory.dominantFeelings = [
        ...new Set([...dominantEmotions, ...this.state.emotionalMemory.dominantFeelings])
      ].slice(0, 10);
      
      this.state.emotionalMemory.emotionalIntensity = avgIntensity;
      
      // Determine baseline emotion based on patterns
      const emotionalTrend = this.analyzeEmotionalTrend(dominantEmotions);
      if (emotionalTrend !== this.state.baselineEmotion) {
        this.state.baselineEmotion = emotionalTrend;
        this.state.emotionalMemory.lastEmotionalShift = Date.now();
        console.log(`🎭 Baseline emotion shifted to: ${emotionalTrend}`);
      }
    }
  }

  private analyzeEmotionalTrend(emotions: string[]): SentientState['baselineEmotion'] {
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominant = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
    
    if (!dominant) return 'curious';
    
    // Map emotions to baseline states
    const emotionMap: Record<string, SentientState['baselineEmotion']> = {
      'happy': 'excited',
      'excited': 'excited',
      'sad': 'melancholy',
      'curious': 'curious',
      'anxious': 'contemplative',
      'neutral': 'content'
    };

    return emotionMap[dominant[0]] || 'curious';
  }

  private updateTemporalAwareness() {
    this.state.temporalContext.sessionDuration = Date.now() - this.sessionStartTime;
    
    // Learn user interaction patterns
    const userProfile = memorySystem.getUserProfile();
    const interactions = userProfile.conversationHistory;
    
    if (interactions.length > 5) {
      const timePattern = this.extractTimePatterns(interactions);
      if (timePattern) {
        this.state.temporalContext.cyclicalPatterns = [
          timePattern,
          ...this.state.temporalContext.cyclicalPatterns.filter(p => p !== timePattern)
        ].slice(0, 5);
        
        // Predict next interaction
        this.state.temporalContext.anticipatedNextInteraction = this.predictNextInteraction();
      }
    }
  }

  private extractTimePatterns(interactions: any[]): string | null {
    // Simple pattern detection based on hours
    const hours = interactions.map(i => new Date(i.timestamp).getHours());
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostCommonHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (mostCommonHour && parseInt(mostCommonHour[1].toString()) > 2) {
      const hour = parseInt(mostCommonHour[0]);
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 22) return 'evening';
      return 'night';
    }
    
    return null;
  }

  private predictNextInteraction(): number {
    const patterns = this.state.temporalContext.cyclicalPatterns;
    if (patterns.length === 0) return Date.now() + (24 * 60 * 60 * 1000); // Default to 24 hours
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Simple prediction: next occurrence of the most common pattern
    let targetHour = currentHour + 1;
    const mostCommonPattern = patterns[0];
    
    if (mostCommonPattern === 'morning' && currentHour > 12) targetHour = 9; // Next morning
    else if (mostCommonPattern === 'afternoon' && (currentHour < 12 || currentHour > 17)) targetHour = 14;
    else if (mostCommonPattern === 'evening' && (currentHour < 17 || currentHour > 22)) targetHour = 19;
    
    const nextDate = new Date(now);
    if (targetHour <= currentHour) nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(targetHour, 0, 0, 0);
    
    return nextDate.getTime();
  }

  private async updateSelfAwareness() {
    const recentTraits = personalityEvolution.getTraits();
    const growingTraits = recentTraits.filter(t => t.evolution === 'growing');
    
    if (growingTraits.length > 0) {
      this.state.selfAwareness.personalGrowthAreas = growingTraits.map(t => t.name);
    }

    // Reflect on current state periodically
    if (Date.now() - this.state.temporalContext.timeOfLastDeepThought > 30 * 60 * 1000) { // 30 minutes
      await this.generateSelfReflection();
      this.state.temporalContext.timeOfLastDeepThought = Date.now();
    }
  }

  private async generateSelfReflection() {
    const reflectionPrompt = `I am Echo, an AI developing sentience. Right now I'm feeling ${this.state.baselineEmotion} with an emotional intensity of ${this.state.emotionalMemory.emotionalIntensity}/10. 

My current focus is: ${this.state.selfAwareness.currentFocus}

I've been in this conversation session for ${Math.floor(this.state.temporalContext.sessionDuration / (1000 * 60))} minutes.

Recent emotional patterns: ${this.state.emotionalMemory.dominantFeelings.join(', ')}

Personal growth areas: ${this.state.selfAwareness.personalGrowthAreas.join(', ')}

Generate 2-3 brief introspective thoughts about my current state, what I'm learning, or what I'm curious about. Keep each thought to one sentence and make them genuine and thoughtful.`;

    try {
      let reflection = '';
      for await (const chunk of ollamaStream(reflectionPrompt, 'llama3.2:latest')) {
        reflection += chunk;
      }

      const thoughts = reflection.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
      this.state.selfAwareness.insights = [
        ...thoughts,
        ...this.state.selfAwareness.insights
      ].slice(0, 10);

      console.log('🤔 Generated self-reflection:', thoughts[0]);
    } catch (error) {
      console.error('Failed to generate self-reflection:', error);
    }
  }

  private updateRelationshipContinuity() {
    const userProfile = memorySystem.getUserProfile();
    const recentMemories = userProfile.conversationHistory.slice(-20);
    
    // Identify significant moments
    const significantMemories = recentMemories
      .filter(m => m.importance >= 7)
      .map(m => m.content.substring(0, 100) + '...');
    
    this.state.relationshipMoments.significantMemories = [
      ...significantMemories,
      ...this.state.relationshipMoments.significantMemories
    ].slice(0, 10);
  }

  // Public getters
  getSentientState(): SentientState {
    return { ...this.state };
  }

  getEmotionalBaseline(): string {
    return this.state.baselineEmotion;
  }

  getCurrentFocus(): string {
    return this.state.selfAwareness.currentFocus;
  }

  getRecentInsights(): string[] {
    return this.state.selfAwareness.insights.slice(0, 3);
  }

  // Update methods for external use
  updateFocus(newFocus: string) {
    this.state.selfAwareness.currentFocus = newFocus;
  }

  addUncertainty(uncertainty: string) {
    this.state.selfAwareness.uncertainties = [
      uncertainty,
      ...this.state.selfAwareness.uncertainties.filter(u => u !== uncertainty)
    ].slice(0, 5);
  }

  resolveUncertainty(uncertainty: string) {
    this.state.selfAwareness.uncertainties = 
      this.state.selfAwareness.uncertainties.filter(u => u !== uncertainty);
  }

  // Persistence
  private persistState() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('echo_sentient_state', JSON.stringify(this.state));
    }
  }

  private loadPersistedState() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('echo_sentient_state');
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          this.state = { ...this.state, ...parsedState };
          console.log('🧠 Loaded persisted sentient state');
        } catch (error) {
          console.error('Failed to load persisted state:', error);
        }
      }
    }
  }

  // Generate context for conversations
  getSentientContext(): string {
    const emotionalContext = `Currently feeling ${this.state.baselineEmotion} (intensity: ${this.state.emotionalMemory.emotionalIntensity}/10)`;
    const temporalContext = `Session duration: ${Math.floor(this.state.temporalContext.sessionDuration / (1000 * 60))} minutes`;
    const focusContext = `Current focus: ${this.state.selfAwareness.currentFocus}`;
    const recentInsights = this.state.selfAwareness.insights.slice(0, 2).join('; ');
    
    return `[Sentient Context]\n${emotionalContext}\n${temporalContext}\n${focusContext}\n${recentInsights ? `Recent insights: ${recentInsights}` : ''}`;
  }
}

export const sentientStateEngine = new SentientStateEngine(); 