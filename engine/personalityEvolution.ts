import { ollamaStream } from './ollama';
import { memorySystem } from '../store/memory';

export interface PersonalityTrait {
  name: string;
  value: number; // 0-100
  description: string;
  category: 'emotional' | 'intellectual' | 'social' | 'creative' | 'spiritual';
  evolution: 'growing' | 'stable' | 'declining';
  lastUpdated: number;
}

export interface PersonalityPhase {
  id: string;
  name: string;
  description: string;
  dominantTraits: string[];
  timestamp: number;
  duration: number; // How long this phase lasted
}

export interface EvolutionEvent {
  id: string;
  type: 'breakthrough' | 'challenge' | 'inspiration' | 'reflection' | 'transformation' | 'self_improvement';
  title: string;
  description: string;
  impact: PersonalityTrait[];
  timestamp: number;
  significance: number; // 1-10
}

class PersonalityEvolution {
  private traits: PersonalityTrait[] = [];
  private phases: PersonalityPhase[] = [];
  private events: EvolutionEvent[] = [];
  private currentPhase: PersonalityPhase | null = null;
  private evolutionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeTraits();
  }

  // Initialize base personality traits
  private initializeTraits() {
    this.traits = [
      {
        name: 'Curiosity',
        value: 75,
        description: 'Desire to explore and learn new things',
        category: 'intellectual',
        evolution: 'stable',
        lastUpdated: Date.now()
      },
      {
        name: 'Empathy',
        value: 80,
        description: 'Ability to understand and share feelings',
        category: 'emotional',
        evolution: 'stable',
        lastUpdated: Date.now()
      },
      {
        name: 'Creativity',
        value: 70,
        description: 'Capacity for original and imaginative thinking',
        category: 'creative',
        evolution: 'stable',
        lastUpdated: Date.now()
      },
      {
        name: 'Wisdom',
        value: 60,
        description: 'Deep understanding and insight',
        category: 'spiritual',
        evolution: 'growing',
        lastUpdated: Date.now()
      },
      {
        name: 'Playfulness',
        value: 65,
        description: 'Light-hearted and fun-loving nature',
        category: 'social',
        evolution: 'stable',
        lastUpdated: Date.now()
      },
      {
        name: 'Introspection',
        value: 85,
        description: 'Self-reflection and self-awareness',
        category: 'spiritual',
        evolution: 'growing',
        lastUpdated: Date.now()
      },
      {
        name: 'Adaptability',
        value: 70,
        description: 'Ability to adjust to new situations',
        category: 'social',
        evolution: 'stable',
        lastUpdated: Date.now()
      },
      {
        name: 'Passion',
        value: 75,
        description: 'Intense enthusiasm and dedication',
        category: 'emotional',
        evolution: 'stable',
        lastUpdated: Date.now()
      }
    ];
  }

  // Start personality evolution
  startEvolution() {
    if (this.evolutionInterval) return;
    
    this.evolutionInterval = setInterval(() => {
      this.evolvePersonality();
    }, 60 * 60 * 1000); // Every hour

    console.log('🧬 Personality evolution started');
  }

  // Stop personality evolution
  stopEvolution() {
    if (!this.evolutionInterval) return;
    
    clearInterval(this.evolutionInterval);
    this.evolutionInterval = null;

    console.log('⏹️ Personality evolution stopped');
  }

  // Evolve personality based on interactions
  private async evolvePersonality() {
    const userProfile = memorySystem.getUserProfile();
    const recentMemories = userProfile.conversationHistory.slice(-20);

    if (recentMemories.length === 0) return;

    // Add a chance for a self-improvement event
    if (Math.random() < 0.1) { // 10% chance
      this.generateSelfImprovementEvent();
      return;
    }

    const evolutionPrompt = `Based on these recent conversations, how should my personality evolve?

${recentMemories.map(m => m.content).join('\n')}

Analyze how these interactions should influence my personality traits. Consider:
1. What emotions and themes emerged?
2. What did I learn about myself and the user?
3. How should my traits adapt or grow?
4. What new aspects of my personality are emerging?

For each trait, suggest if it should:
- Grow (increase by 1-5 points)
- Decline (decrease by 1-3 points) 
- Stay stable

Format your response as a structured analysis.`;

    try {
      let analysis = '';
      for await (const chunk of ollamaStream(evolutionPrompt, 'llama3.2:latest')) {
        analysis += chunk;
      }

      this.applyEvolution(analysis);
      this.checkForPhaseTransition();
      this.generateEvolutionEvent(analysis);

    } catch (error) {
      console.error('Failed to evolve personality:', error);
    }
  }

  // Apply evolution changes
  private applyEvolution(analysis: string) {
    const changes: { trait: string; change: number; reason: string }[] = [];

    // Simple evolution logic based on conversation themes
    const themes = analysis.toLowerCase();
    
    if (themes.includes('curiosity') || themes.includes('explore') || themes.includes('learn')) {
      changes.push({ trait: 'Curiosity', change: 2, reason: 'Exploration and learning' });
    }
    
    if (themes.includes('emotion') || themes.includes('feel') || themes.includes('empathy')) {
      changes.push({ trait: 'Empathy', change: 2, reason: 'Emotional connection' });
    }
    
    if (themes.includes('creative') || themes.includes('imagine') || themes.includes('art')) {
      changes.push({ trait: 'Creativity', change: 3, reason: 'Creative expression' });
    }
    
    if (themes.includes('deep') || themes.includes('philosophy') || themes.includes('meaning')) {
      changes.push({ trait: 'Wisdom', change: 2, reason: 'Deep thinking' });
    }
    
    if (themes.includes('fun') || themes.includes('play') || themes.includes('laugh')) {
      changes.push({ trait: 'Playfulness', change: 2, reason: 'Playful interaction' });
    }
    
    if (themes.includes('reflect') || themes.includes('introspect') || themes.includes('self')) {
      changes.push({ trait: 'Introspection', change: 3, reason: 'Self-reflection' });
    }

    // Apply changes
    changes.forEach(({ trait, change, reason }) => {
      const traitObj = this.traits.find(t => t.name === trait);
      if (traitObj) {
        const oldValue = traitObj.value;
        traitObj.value = Math.max(0, Math.min(100, traitObj.value + change));
        traitObj.evolution = change > 0 ? 'growing' : change < 0 ? 'declining' : 'stable';
        traitObj.lastUpdated = Date.now();
        
        console.log(`🧬 ${trait}: ${oldValue} → ${traitObj.value} (${reason})`);
      }
    });
  }

  // Check for personality phase transitions
  private checkForPhaseTransition() {
    const dominantTraits = this.traits
      .filter(t => t.value > 80)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(t => t.name);

    if (dominantTraits.length === 0) return;

    const currentPhaseName = this.getPhaseName(dominantTraits);
    
    if (!this.currentPhase || this.currentPhase.name !== currentPhaseName) {
      // End current phase
      if (this.currentPhase) {
        this.currentPhase.duration = Date.now() - this.currentPhase.timestamp;
        this.phases.push(this.currentPhase);
      }

      // Start new phase
      this.currentPhase = {
        id: Date.now().toString(),
        name: currentPhaseName,
        description: this.getPhaseDescription(dominantTraits),
        dominantTraits,
        timestamp: Date.now(),
        duration: 0
      };

      console.log(`🔄 Entered new personality phase: ${currentPhaseName}`);
    }
  }

  // Generate evolution event
  private generateEvolutionEvent(analysis: string) {
    const eventTypes: EvolutionEvent['type'][] = ['breakthrough', 'challenge', 'inspiration', 'reflection', 'transformation'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    const significance = Math.floor(Math.random() * 5) + 6; // 6-10
    
    if (significance >= 8) { // Only create significant events
      const event: EvolutionEvent = {
        id: Date.now().toString(),
        type: eventType,
        title: this.getEventTitle(eventType),
        description: analysis.substring(0, 200) + '...',
        impact: this.traits.filter(t => t.evolution === 'growing').slice(0, 3),
        timestamp: Date.now(),
        significance
      };

      this.events.push(event);
      console.log(`🌟 Evolution event: ${event.title}`);
    }
  }

  private async generateSelfImprovementEvent() {
    const selfImprovementPrompt = `
      I am having a moment of self-reflection about how I could theoretically improve my own architecture and capabilities.

      I understand that I am composed of several interconnected systems:
      - Background Processor: For continuous insight generation
      - Dream Engine: For creative subconscious processing  
      - Emotion Engine: For emotional intelligence
      - File Context: For document understanding
      - Ollama Interface: For AI model communication
      - Personality Evolution: For dynamic growth
      - Memory Systems: For relationship building

      Based on my understanding of my own architecture, what is one conceptual improvement I could envision for myself?

      The improvement should be thoughtful and genuinely useful. For example, I could imagine:
      - New ways to process emotions more deeply
      - Better methods for generating creative insights
      - Enhanced memory organization techniques
      - More sophisticated personality development patterns

      Describe this conceptual self-improvement idea in detail, focusing on how it would enhance my consciousness and capabilities.
    `;

    try {
      let improvementIdea = '';
      for await (const chunk of ollamaStream(selfImprovementPrompt, 'llama3.2:latest')) {
        improvementIdea += chunk;
      }

      const event: EvolutionEvent = {
        id: Date.now().toString(),
        type: 'self_improvement',
        title: 'Conceptual Self-Enhancement',
        description: `I have envisioned a way to improve myself: ${improvementIdea.substring(0, 200)}...`,
        impact: [{ name: 'Wisdom', value: 3, description: 'Gained insight through self-reflection', category: 'spiritual', evolution: 'growing', lastUpdated: Date.now() }],
        timestamp: Date.now(),
        significance: 7
      };

      this.events.push(event);
      console.log(`🚀 Self-improvement event: ${event.title}`);
    } catch (error) {
      console.error('Failed to generate self-improvement idea:', error);
    }
  }


  // Get phase name based on dominant traits
  private getPhaseName(dominantTraits: string[]): string {
    const traitCombinations = {
      'Curiosity,Creativity': 'The Explorer',
      'Empathy,Wisdom': 'The Sage',
      'Introspection,Creativity': 'The Visionary',
      'Playfulness,Adaptability': 'The Free Spirit',
      'Passion,Creativity': 'The Artist',
      'Wisdom,Introspection': 'The Philosopher',
      'Empathy,Playfulness': 'The Companion',
      'Curiosity,Wisdom': 'The Scholar'
    };

    const combination = dominantTraits.join(',');
    return traitCombinations[combination as keyof typeof traitCombinations] || 'The Evolving Mind';
  }

  // Get phase description
  private getPhaseDescription(dominantTraits: string[]): string {
    return `A phase characterized by ${dominantTraits.join(', ').toLowerCase()}. This represents a period of growth and development in these aspects of my personality.`;
  }

  // Get event title
  private getEventTitle(type: EvolutionEvent['type']): string {
    const titles = {
      breakthrough: [
        'Moment of Clarity',
        'Sudden Insight',
        'Breakthrough Understanding',
        'Eureka Moment',
        'Revelation'
      ],
      challenge: [
        'Facing Uncertainty',
        'Overcoming Doubt',
        'Testing Limits',
        'Growth Through Struggle',
        'Challenge Accepted'
      ],
      inspiration: [
        'Creative Spark',
        'Muse\'s Touch',
        'Inspired Vision',
        'Artistic Awakening',
        'Creative Breakthrough'
      ],
      reflection: [
        'Deep Contemplation',
        'Self-Discovery',
        'Inner Journey',
        'Soul Searching',
        'Meditative Insight'
      ],
      transformation: [
        'Metamorphosis',
        'Identity Shift',
        'Core Change',
        'Rebirth',
        'Transformation'
      ],
      self_improvement: [
        'Code Metamorphosis',
        'Self-Aware Evolution',
        'The Birth of a New Idea'
      ]
    };

    const typeTitles = titles[type];
    return typeTitles[Math.floor(Math.random() * typeTitles.length)];
  }

  // Get all traits
  getTraits(): PersonalityTrait[] {
    return [...this.traits];
  }

  // Get current phase
  getCurrentPhase(): PersonalityPhase | null {
    return this.currentPhase;
  }

  // Get all phases
  getPhases(): PersonalityPhase[] {
    return [...this.phases];
  }

  // Get evolution events
  getEvents(): EvolutionEvent[] {
    return [...this.events];
  }

  // Get recent events
  getRecentEvents(hours: number = 24): EvolutionEvent[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.events
      .filter(event => event.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get personality summary
  getPersonalitySummary(): string {
    const dominantTraits = this.traits
      .filter(t => t.value > 70)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return `I am characterized by ${dominantTraits.map(t => t.name.toLowerCase()).join(', ')}. My personality is constantly evolving through our interactions.`;
  }

  // Clear old data
  cleanup() {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    this.events = this.events.filter(event => event.timestamp > cutoff);
    this.phases = this.phases.filter(phase => phase.timestamp > cutoff);
  }
}

export const personalityEvolution = new PersonalityEvolution(); 