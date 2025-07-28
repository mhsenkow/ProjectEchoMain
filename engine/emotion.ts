export interface EmotionalState {
  primary: 'happy' | 'sad' | 'angry' | 'anxious' | 'excited' | 'curious' | 'neutral';
  intensity: number; // 1-10
  confidence: number; // 1-10
  triggers: string[];
  timestamp: number;
}

export interface EmotionalResponse {
  avatarMood: 'curious' | 'happy' | 'sad' | 'angry' | 'neutral';
  responseStyle: 'empathetic' | 'supportive' | 'enthusiastic' | 'calming' | 'neutral';
  voiceModulation: {
    pitch: number; // -2 to +2
    speed: number; // 0.8 to 1.2
    volume: number; // 0.8 to 1.2
  };
}

class EmotionEngine {
  private emotionalHistory: EmotionalState[] = [];
  
  // Analyze user message for emotional content
  analyzeUserEmotion(text: string): EmotionalState {
    const emotions = {
      happy: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'enjoy', 'fantastic', 'brilliant'],
      sad: ['sad', 'depressed', 'unhappy', 'disappointed', 'sorry', 'regret', 'miss', 'lonely', 'hurt'],
      angry: ['angry', 'frustrated', 'mad', 'upset', 'annoyed', 'irritated', 'hate', 'terrible', 'awful'],
      anxious: ['worried', 'anxious', 'stressed', 'concerned', 'nervous', 'scared', 'afraid', 'panic'],
      excited: ['excited', 'thrilled', 'eager', 'enthusiastic', 'pumped', 'stoked', 'awesome', 'incredible'],
      curious: ['curious', 'wonder', 'interesting', 'fascinating', 'intriguing', 'mysterious', 'unknown']
    };

    const textLower = text.toLowerCase();
    let maxScore = 0;
    let primaryEmotion: EmotionalState['primary'] = 'neutral';
    let intensity = 1;
    const triggers: string[] = [];

    // Score each emotion
    for (const [emotion, words] of Object.entries(emotions)) {
      let score = 0;
      const foundWords: string[] = [];
      
      for (const word of words) {
        if (textLower.includes(word)) {
          score += 1;
          foundWords.push(word);
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as EmotionalState['primary'];
        intensity = Math.min(10, score + 1);
        triggers.push(...foundWords);
      }
    }

    // Analyze punctuation and capitalization for intensity
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const capsCount = (text.match(/[A-Z]{2,}/g) || []).length;
    
    intensity = Math.min(10, intensity + exclamationCount + Math.floor(capsCount / 3));
    
    // Questions indicate curiosity
    if (questionCount > 0 && maxScore === 0) {
      primaryEmotion = 'curious';
      intensity = Math.min(10, questionCount + 1);
    }

    const emotionalState: EmotionalState = {
      primary: primaryEmotion,
      intensity,
      confidence: Math.min(10, maxScore + 1),
      triggers,
      timestamp: Date.now()
    };

    this.emotionalHistory.push(emotionalState);
    return emotionalState;
  }

  // Generate appropriate emotional response
  generateResponse(userEmotion: EmotionalState): EmotionalResponse {
    const { primary, intensity } = userEmotion;
    
    // Map user emotions to avatar moods
    const moodMap: Record<string, EmotionalResponse['avatarMood']> = {
      happy: 'happy',
      excited: 'happy',
      sad: 'sad',
      angry: 'angry',
      anxious: 'curious',
      curious: 'curious',
      neutral: 'neutral'
    };

    // Map to response styles
    const styleMap: Record<string, EmotionalResponse['responseStyle']> = {
      happy: 'enthusiastic',
      excited: 'enthusiastic',
      sad: 'empathetic',
      angry: 'calming',
      anxious: 'supportive',
      curious: 'enthusiastic',
      neutral: 'neutral'
    };

    // Voice modulation based on emotion
    const voiceModulation = this.getVoiceModulation(primary, intensity);

    return {
      avatarMood: moodMap[primary] || 'neutral',
      responseStyle: styleMap[primary] || 'neutral',
      voiceModulation
    };
  }

  private getVoiceModulation(emotion: string, intensity: number): EmotionalResponse['voiceModulation'] {
    const baseModulation = {
      pitch: 0,
      speed: 1,
      volume: 1
    };

    switch (emotion) {
      case 'happy':
      case 'excited':
        return {
          pitch: Math.min(2, intensity * 0.2),
          speed: Math.min(1.2, 1 + intensity * 0.02),
          volume: Math.min(1.2, 1 + intensity * 0.02)
        };
      case 'sad':
        return {
          pitch: Math.max(-2, -intensity * 0.2),
          speed: Math.max(0.8, 1 - intensity * 0.02),
          volume: Math.max(0.8, 1 - intensity * 0.02)
        };
      case 'angry':
        return {
          pitch: Math.min(2, intensity * 0.15),
          speed: Math.min(1.2, 1 + intensity * 0.015),
          volume: Math.min(1.3, 1 + intensity * 0.03)
        };
      case 'anxious':
        return {
          pitch: Math.min(1, intensity * 0.1),
          speed: Math.min(1.1, 1 + intensity * 0.01),
          volume: Math.max(0.9, 1 - intensity * 0.01)
        };
      case 'curious':
        return {
          pitch: Math.min(1, intensity * 0.1),
          speed: Math.min(1.1, 1 + intensity * 0.01),
          volume: 1
        };
      default:
        return baseModulation;
    }
  }

  // Get emotional trend over time
  getEmotionalTrend(minutes: number = 30): EmotionalState[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.emotionalHistory
      .filter(state => state.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get dominant emotion in recent history
  getDominantEmotion(minutes: number = 30): EmotionalState['primary'] {
    const recent = this.getEmotionalTrend(minutes);
    if (recent.length === 0) return 'neutral';

    const emotionCounts: Record<string, number> = {};
    recent.forEach(state => {
      emotionCounts[state.primary] = (emotionCounts[state.primary] || 0) + 1;
    });

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as EmotionalState['primary'];
  }
}

export const emotionEngine = new EmotionEngine(); 