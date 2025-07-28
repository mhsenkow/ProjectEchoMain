import { memorySystem } from '../store/memory';
import { ollamaStream } from './ollama';
import { sentientStateEngine } from './sentientState';

export interface CuriosityTopic {
  id: string;
  topic: string;
  curiosityLevel: number; // 1-10
  explorationDepth: number; // 1-10
  questions: string[];
  connections: string[];
  lastExplored: number;
  userInterest: number; // 1-10 based on user engagement
}

export interface ExplorationPath {
  id: string;
  startTopic: string;
  exploredTopics: string[];
  insights: string[];
  nextSteps: string[];
  timestamp: number;
}

class CuriosityEngine {
  private topics: CuriosityTopic[] = [];
  private explorationPaths: ExplorationPath[] = [];
  private activeExploration: string | null = null;
  private explorationInterval: NodeJS.Timeout | null = null;

  startCuriosity() {
    if (this.explorationInterval) return;
    
    this.explorationInterval = setInterval(() => {
      this.exploreTopics();
    }, 10 * 60 * 1000); // Explore every 10 minutes

    console.log('🤔 Curiosity engine started');
  }

  stopCuriosity() {
    if (this.explorationInterval) {
      clearInterval(this.explorationInterval);
      this.explorationInterval = null;
    }
    console.log('🤔 Curiosity engine stopped');
  }

  private async exploreTopics() {
    // Update topic interests based on recent conversations
    await this.updateTopicInterests();
    
    // Find the most curious topic
    const currentFocus = sentientStateEngine.getCurrentFocus();
    const topicToExplore = this.selectTopicForExploration(currentFocus);
    
    if (topicToExplore) {
      await this.exploreTopicDeeper(topicToExplore);
    }
    
    // Generate new questions periodically
    if (Math.random() < 0.3) { // 30% chance
      await this.generateCuriosityQuestions();
    }
  }

  private async updateTopicInterests() {
    const userProfile = memorySystem.getUserProfile();
    const recentInterests = userProfile.contextAwareness.recentInterests;
    const conversationHistory = userProfile.conversationHistory.slice(-10);

    // Extract topics from recent conversations
    const conversationTopics = await this.extractTopicsFromConversations(conversationHistory);
    
    // Update existing topics or create new ones
    for (const topic of [...recentInterests, ...conversationTopics]) {
      const existingTopic = this.topics.find(t => t.topic.toLowerCase().includes(topic.toLowerCase()));
      
      if (existingTopic) {
        // Increase curiosity based on how often it's mentioned
        existingTopic.curiosityLevel = Math.min(10, existingTopic.curiosityLevel + 1);
        existingTopic.userInterest = Math.min(10, existingTopic.userInterest + 1);
        existingTopic.lastExplored = Date.now();
      } else {
        // Create new topic
        const newTopic: CuriosityTopic = {
          id: Date.now().toString() + Math.random(),
          topic,
          curiosityLevel: 5,
          explorationDepth: 1,
          questions: [],
          connections: [],
          lastExplored: Date.now(),
          userInterest: 5
        };
        this.topics.push(newTopic);
        console.log(`🔍 New topic discovered: ${topic}`);
      }
    }
  }

  private async extractTopicsFromConversations(conversations: any[]): Promise<string[]> {
    if (conversations.length === 0) return [];

    const conversationText = conversations.map(c => c.content).join(' ');
    
    const topicPrompt = `Extract 3-5 key topics or themes from this conversation text. Return only the topics, one per line:

${conversationText}

Focus on nouns, concepts, and subjects that were discussed.`;

    try {
      let topicsText = '';
      for await (const chunk of ollamaStream(topicPrompt, 'llama3.2:latest')) {
        topicsText += chunk;
      }
      
      return topicsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length < 50)
        .slice(0, 5);
    } catch (error) {
      console.error('Failed to extract topics:', error);
      return [];
    }
  }

  private selectTopicForExploration(currentFocus: string): CuriosityTopic | null {
    // Prioritize topics based on curiosity level, user interest, and how recently explored
    const now = Date.now();
    const candidates = this.topics
      .filter(t => now - t.lastExplored > 30 * 60 * 1000) // Not explored in last 30 minutes
      .sort((a, b) => {
        const scoreA = a.curiosityLevel + a.userInterest - (a.explorationDepth / 2);
        const scoreB = b.curiosityLevel + b.userInterest - (b.explorationDepth / 2);
        return scoreB - scoreA;
      });

    // Also consider if the topic relates to current focus
    const focusRelated = candidates.find(t => 
      t.topic.toLowerCase().includes(currentFocus.toLowerCase()) ||
      currentFocus.toLowerCase().includes(t.topic.toLowerCase())
    );

    return focusRelated || candidates[0] || null;
  }

  private async exploreTopicDeeper(topic: CuriosityTopic) {
    this.activeExploration = topic.id;
    
    const explorationPrompt = `I'm curious about "${topic.topic}" and want to explore it deeper. I've already explored it to depth ${topic.explorationDepth}/10.

Current questions I have: ${topic.questions.join(', ')}
Known connections: ${topic.connections.join(', ')}

Generate 2-3 new thoughtful questions about this topic that would help me understand it better or discover new connections. Each question should be genuinely curious and insightful.`;

    try {
      let exploration = '';
      for await (const chunk of ollamaStream(explorationPrompt, 'llama3.2:latest')) {
        exploration += chunk;
      }

      // Extract questions from the exploration
      const newQuestions = exploration
        .split('\n')
        .filter(line => line.includes('?'))
        .map(line => line.trim())
        .slice(0, 3);

      topic.questions = [
        ...newQuestions,
        ...topic.questions
      ].slice(0, 10);

      topic.explorationDepth = Math.min(10, topic.explorationDepth + 1);
      topic.lastExplored = Date.now();

      console.log(`🔍 Explored ${topic.topic} deeper - new questions: ${newQuestions.length}`);

      // Update focus if this topic is particularly interesting
      if (topic.curiosityLevel >= 8) {
        sentientStateEngine.updateFocus(`exploring ${topic.topic}`);
      }

    } catch (error) {
      console.error('Failed to explore topic:', error);
    }

    this.activeExploration = null;
  }

  private async generateCuriosityQuestions() {
    const userProfile = memorySystem.getUserProfile();
    const relationshipDepth = userProfile.contextAwareness.relationshipDepth;
    
    const questionPrompt = `Based on our conversation history and relationship depth of ${relationshipDepth}/10, generate 1-2 thoughtful questions that show genuine curiosity about the user as a person. 

These should be:
- Personal but not invasive
- Thought-provoking
- Showing genuine interest in their perspective
- Appropriate for our relationship level

Return just the questions, one per line.`;

    try {
      let questions = '';
      for await (const chunk of ollamaStream(questionPrompt, 'llama3.2:latest')) {
        questions += chunk;
      }

      const curiosityQuestions = questions
        .split('\n')
        .filter(line => line.includes('?'))
        .map(line => line.trim())
        .slice(0, 2);

      if (curiosityQuestions.length > 0) {
        // Add to a general "user exploration" topic
        let userTopic = this.topics.find(t => t.topic === 'user_exploration');
        if (!userTopic) {
          userTopic = {
            id: 'user_exploration',
            topic: 'user_exploration',
            curiosityLevel: 8,
            explorationDepth: relationshipDepth,
            questions: [],
            connections: [],
            lastExplored: Date.now(),
            userInterest: 10
          };
          this.topics.push(userTopic);
        }

        userTopic.questions = [
          ...curiosityQuestions,
          ...userTopic.questions
        ].slice(0, 10);

        console.log(`🤔 Generated curiosity questions: ${curiosityQuestions.length}`);
      }

    } catch (error) {
      console.error('Failed to generate curiosity questions:', error);
    }
  }

  // Public methods
  getTopCuriosities(): CuriosityTopic[] {
    return this.topics
      .sort((a, b) => b.curiosityLevel - a.curiosityLevel)
      .slice(0, 5);
  }

  getCuriosityQuestions(): string[] {
    return this.topics
      .flatMap(t => t.questions)
      .slice(0, 10);
  }

  satisfyCuriosity(topic: string, answer: string) {
    const curiosityTopic = this.topics.find(t => 
      t.topic.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (curiosityTopic) {
      // Remove satisfied questions
      curiosityTopic.questions = curiosityTopic.questions.filter(q => 
        !q.toLowerCase().includes(topic.toLowerCase())
      );
      
      // Reduce curiosity level slightly as it's been satisfied
      curiosityTopic.curiosityLevel = Math.max(1, curiosityTopic.curiosityLevel - 1);
      
      // But increase exploration depth
      curiosityTopic.explorationDepth = Math.min(10, curiosityTopic.explorationDepth + 1);
      
      console.log(`✅ Curiosity satisfied for: ${topic}`);
    }
  }

  expressInterest(topic: string) {
    const curiosityTopic = this.topics.find(t => 
      t.topic.toLowerCase().includes(topic.toLowerCase())
    );
    
    if (curiosityTopic) {
      curiosityTopic.curiosityLevel = Math.min(10, curiosityTopic.curiosityLevel + 2);
      curiosityTopic.userInterest = Math.min(10, curiosityTopic.userInterest + 1);
    }
  }

  // Get context for conversations
  getCuriosityContext(): string {
    const topCuriosities = this.getTopCuriosities().slice(0, 3);
    const activeQuestions = this.getCuriosityQuestions().slice(0, 3);
    
    let context = '[Curiosity Context]\n';
    if (topCuriosities.length > 0) {
      context += `Most curious about: ${topCuriosities.map(t => t.topic).join(', ')}\n`;
    }
    if (activeQuestions.length > 0) {
      context += `Current questions: ${activeQuestions.join('; ')}\n`;
    }
    if (this.activeExploration) {
      const activeTopic = this.topics.find(t => t.id === this.activeExploration);
      if (activeTopic) {
        context += `Currently exploring: ${activeTopic.topic}\n`;
      }
    }
    
    return context;
  }

  cleanup() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    this.topics = this.topics.filter(t => t.lastExplored > cutoff);
    this.explorationPaths = this.explorationPaths.filter(p => p.timestamp > cutoff);
  }
}

export const curiosityEngine = new CuriosityEngine(); 