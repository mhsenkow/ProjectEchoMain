export interface MemoryEntry {
  id: string;
  type: 'conversation' | 'preference' | 'context' | 'emotion';
  content: string;
  timestamp: number;
  importance: number; // 1-10 scale
  tags: string[];
  metadata?: Record<string, any>;
}

export interface UserProfile {
  name?: string;
  lastInteraction?: number;
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'technical' | 'creative';
    topics: string[];
    aversions: string[];
    emotionalState: 'happy' | 'sad' | 'stressed' | 'excited' | 'neutral';
  };
  conversationHistory: MemoryEntry[];
  contextAwareness: {
    currentTopic: string;
    mood: string;
    recentInterests: string[];
    relationshipDepth: number; // 1-10 scale
  };
}

class MemorySystem {
  private memories: MemoryEntry[] = [];
  private userProfile: UserProfile = {
    preferences: {
      communicationStyle: 'casual',
      topics: [],
      aversions: [],
      emotionalState: 'neutral'
    },
    conversationHistory: [],
    contextAwareness: {
      currentTopic: '',
      mood: 'neutral',
      recentInterests: [],
      relationshipDepth: 1
    }
  };

  // Add a new memory
  addMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp'>) {
    const memory: MemoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    this.memories.push(memory);
    this.updateUserProfile(memory);
    this.updateLastInteraction();
    return memory;
  }

  // Get relevant memories for context
  getRelevantMemories(query: string, limit: number = 5): MemoryEntry[] {
    return this.memories
      .filter(memory => 
        memory.content.toLowerCase().includes(query.toLowerCase()) ||
        memory.tags.some(tag => query.toLowerCase().includes(tag.toLowerCase()))
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  // Get conversation context for LLM
  getConversationContext(): string {
    const recentMemories = this.memories
      .filter(m => m.type === 'conversation')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    const context = recentMemories.map(m => m.content).join('\n');
    const userProfile = this.getUserProfileSummary();
    
    return `[Conversation Context]\n${context}\n\n[User Profile]\n${userProfile}`;
  }

  // Update user profile based on new interactions
  private updateUserProfile(memory: MemoryEntry) {
    if (memory.type === 'conversation') {
      this.userProfile.conversationHistory.push(memory);
      
      // Analyze emotional content
      const emotionalWords = this.analyzeEmotion(memory.content);
      if (emotionalWords.length > 0) {
        this.userProfile.contextAwareness.mood = emotionalWords[0];
      }
      
      // Extract topics of interest
      const topics = this.extractTopics(memory.content);
      this.userProfile.contextAwareness.recentInterests = [
        ...topics,
        ...this.userProfile.contextAwareness.recentInterests
      ].slice(0, 5);
    }
  }

  private analyzeEmotion(text: string): string[] {
    const emotions = {
      happy: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'enjoy'],
      sad: ['sad', 'depressed', 'unhappy', 'disappointed', 'sorry', 'regret'],
      stressed: ['stressed', 'worried', 'anxious', 'concerned', 'frustrated'],
      excited: ['excited', 'thrilled', 'eager', 'enthusiastic', 'pumped']
    };

    const found = [];
    for (const [emotion, words] of Object.entries(emotions)) {
      if (words.some(word => text.toLowerCase().includes(word))) {
        found.push(emotion);
      }
    }
    return found;
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction - could be enhanced with NLP
    const topics = text.match(/\b\w+(?:\s+\w+){0,2}\b/g) || [];
    return topics.filter(topic => topic.length > 3).slice(0, 3);
  }

  private getUserProfileSummary(): string {
    const { preferences, contextAwareness } = this.userProfile;
    return `Communication Style: ${preferences.communicationStyle}
Current Mood: ${contextAwareness.mood}
Recent Interests: ${contextAwareness.recentInterests.join(', ')}
Relationship Depth: ${contextAwareness.relationshipDepth}/10`;
  }

  // Get current user profile
  getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  // Update relationship depth based on interaction quality
  updateRelationshipDepth(interactionQuality: number) {
    this.userProfile.contextAwareness.relationshipDepth = Math.min(10, 
      this.userProfile.contextAwareness.relationshipDepth + interactionQuality
    );
  }

  // Update last interaction timestamp
  updateLastInteraction() {
    this.userProfile.lastInteraction = Date.now();
  }
}

export const memorySystem = new MemorySystem(); 