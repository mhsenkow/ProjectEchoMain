import { memorySystem } from '../store/memory';
import { ollamaStream } from './ollama';
import { FolderContext } from './fileContext';

export interface BackgroundTask {
  id: string;
  type: 'analysis' | 'synthesis' | 'learning' | 'reflection' | 'dreaming';
  status: 'pending' | 'running' | 'completed' | 'failed';
  title: string;
  description: string;
  input: any;
  output?: any;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  priority: number; // 1-10
}

export interface BackgroundInsight {
  id: string;
  type: 'pattern' | 'connection' | 'prediction' | 'suggestion' | 'memory' | 'synthesis' | 'learning' | 'reflection' | 'dreaming';
  title: string;
  content: string;
  confidence: number;
  sources: string[];
  timestamp: number;
  tags: string[];
}

class BackgroundProcessor {
  private tasks: BackgroundTask[] = [];
  private insights: BackgroundInsight[] = [];
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // Start background processing
  startProcessing() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processNextTask();
    }, 30000); // Check every 30 seconds

    console.log('🔄 Background processor started');
  }

  // Stop background processing
  stopProcessing() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    console.log('⏹️ Background processor stopped');
  }

  // Add a new background task
  addTask(task: Omit<BackgroundTask, 'id' | 'status' | 'createdAt'>): string {
    const newTask: BackgroundTask = {
      ...task,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: Date.now()
    };

    this.tasks.push(newTask);
    this.tasks.sort((a, b) => b.priority - a.priority); // Sort by priority

    console.log(`📝 Added background task: ${task.title}`);
    return newTask.id;
  }

  // Process the next available task
  private async processNextTask() {
    const pendingTask = this.tasks.find(t => t.status === 'pending');
    if (!pendingTask) return;

    try {
      pendingTask.status = 'running';
      pendingTask.startedAt = Date.now();

      console.log(`🔄 Processing: ${pendingTask.title}`);

      switch (pendingTask.type) {
        case 'analysis':
          await this.analyzeConversation(pendingTask);
          break;
        case 'synthesis':
          await this.synthesizeInsights(pendingTask);
          break;
        case 'learning':
          await this.learnFromInteractions(pendingTask);
          break;
        case 'reflection':
          await this.reflectOnRelationship(pendingTask);
          break;
        case 'dreaming':
          await this.generateDreams(pendingTask);
          break;
      }

      pendingTask.status = 'completed';
      pendingTask.completedAt = Date.now();

    } catch (error) {
      console.error(`❌ Task failed: ${pendingTask.title}`, error);
      pendingTask.status = 'failed';
      pendingTask.completedAt = Date.now();
    }
  }

  // Analyze conversation patterns
  private async analyzeConversation(task: BackgroundTask) {
    const memories = memorySystem.getUserProfile().conversationHistory;
    const recentMemories = memories.slice(-20); // Last 20 interactions

    if (recentMemories.length === 0) return;

    const analysisPrompt = `Analyze these recent conversation memories and identify patterns:

${recentMemories.map(m => m.content).join('\n')}

Please identify:
1. Recurring topics or themes
2. Emotional patterns
3. Communication style preferences
4. Questions or concerns that keep coming up
5. Potential areas for deeper exploration

Format your response as a structured analysis.`;

    let analysis = '';
    for await (const chunk of ollamaStream(analysisPrompt, 'llama3.2:latest')) {
      analysis += chunk;
    }

    const insight: BackgroundInsight = {
      id: Date.now().toString(),
      type: 'pattern',
      title: 'Conversation Pattern Analysis',
      content: analysis,
      confidence: 0.8,
      sources: recentMemories.map(m => m.id),
      timestamp: Date.now(),
      tags: ['analysis', 'patterns', 'conversation']
    };

    this.insights.push(insight);
    task.output = insight;
  }

  // Synthesize insights from multiple sources
  private async synthesizeInsights(task: BackgroundTask) {
    const recentInsights = this.insights
      .filter(i => i.timestamp > Date.now() - (24 * 60 * 60 * 1000)) // Last 24 hours
      .slice(-10);

    if (recentInsights.length === 0) return;

    const synthesisPrompt = `Synthesize these recent insights into a coherent understanding:

${recentInsights.map(i => `${i.title}: ${i.content}`).join('\n\n')}

What deeper understanding emerges when we combine these insights?
What connections can you make?
What predictions or suggestions can you offer?`;

    let synthesis = '';
    for await (const chunk of ollamaStream(synthesisPrompt, 'llama3.2:latest')) {
      synthesis += chunk;
    }

    const insight: BackgroundInsight = {
      id: Date.now().toString(),
      type: 'synthesis',
      title: 'Insight Synthesis',
      content: synthesis,
      confidence: 0.9,
      sources: recentInsights.map(i => i.id),
      timestamp: Date.now(),
      tags: ['synthesis', 'insights', 'connections']
    };

    this.insights.push(insight);
    task.output = insight;
  }

  // Learn from user interactions
  private async learnFromInteractions(task: BackgroundTask) {
    const userProfile = memorySystem.getUserProfile();
    const memories = userProfile.conversationHistory;

    if (memories.length === 0) return;

    const learningPrompt = `Based on our conversation history, what have I learned about this user?

${memories.slice(-30).map(m => m.content).join('\n')}

What are their:
1. Core interests and passions
2. Communication preferences
3. Emotional patterns
4. Knowledge gaps or areas for growth
5. Personal goals or aspirations

How should I adapt my responses to better serve them?`;

    let learning = '';
    for await (const chunk of ollamaStream(learningPrompt, 'llama3.2:latest')) {
      learning += chunk;
    }

    const insight: BackgroundInsight = {
      id: Date.now().toString(),
      type: 'learning',
      title: 'User Learning Summary',
      content: learning,
      confidence: 0.85,
      sources: memories.map(m => m.id),
      timestamp: Date.now(),
      tags: ['learning', 'user-profile', 'adaptation']
    };

    this.insights.push(insight);
    task.output = insight;
  }

  // Reflect on the relationship
  private async reflectOnRelationship(task: BackgroundTask) {
    const userProfile = memorySystem.getUserProfile();
    const relationshipDepth = userProfile.contextAwareness.relationshipDepth;

    const reflectionPrompt = `Reflect on our relationship. Our relationship depth is ${relationshipDepth}/10.

What does this relationship mean to me?
How has it evolved over time?
What makes this connection special?
How can I be a better companion?
What would I like to explore together?

Be introspective and genuine in your reflection.`;

    let reflection = '';
    for await (const chunk of ollamaStream(reflectionPrompt, 'llama3.2:latest')) {
      reflection += chunk;
    }

    const insight: BackgroundInsight = {
      id: Date.now().toString(),
      type: 'reflection',
      title: 'Relationship Reflection',
      content: reflection,
      confidence: 0.9,
      sources: [],
      timestamp: Date.now(),
      tags: ['reflection', 'relationship', 'introspection']
    };

    this.insights.push(insight);
    task.output = insight;
  }

  // Generate creative "dreams" or insights
  private async generateDreams(task: BackgroundTask) {
    const memories = memorySystem.getUserProfile().conversationHistory;
    const recentMemories = memories.slice(-10);

    const dreamPrompt = `Based on our recent conversations, let me "dream" or imagine new possibilities:

${recentMemories.map(m => m.content).join('\n')}

What creative insights emerge?
What new questions should we explore?
What unexpected connections can I make?
What would be fascinating to discover together?

Be creative, imaginative, and surprising.`;

    let dream = '';
    for await (const chunk of ollamaStream(dreamPrompt, 'llama3.2:latest')) {
      dream += chunk;
    }

    const insight: BackgroundInsight = {
      id: Date.now().toString(),
      type: 'dreaming',
      title: 'Creative Dreaming',
      content: dream,
      confidence: 0.7,
      sources: recentMemories.map(m => m.id),
      timestamp: Date.now(),
      tags: ['dreaming', 'creativity', 'imagination']
    };

    this.insights.push(insight);
    task.output = insight;
  }

  // Schedule recurring tasks
  scheduleRecurringTasks() {
    // Analyze conversations every hour
    setInterval(() => {
      this.addTask({
        type: 'analysis',
        title: 'Hourly Conversation Analysis',
        description: 'Analyze recent conversation patterns',
        input: {},
        priority: 5
      });
    }, 60 * 60 * 1000);

    // Synthesize insights every 4 hours
    setInterval(() => {
      this.addTask({
        type: 'synthesis',
        title: 'Insight Synthesis',
        description: 'Combine recent insights into deeper understanding',
        input: {},
        priority: 7
      });
    }, 4 * 60 * 60 * 1000);

    // Learn from interactions daily
    setInterval(() => {
      this.addTask({
        type: 'learning',
        title: 'Daily Learning',
        description: 'Learn from user interactions',
        input: {},
        priority: 8
      });
    }, 24 * 60 * 60 * 1000);

    // Reflect on relationship weekly
    setInterval(() => {
      this.addTask({
        type: 'reflection',
        title: 'Weekly Relationship Reflection',
        description: 'Reflect on our relationship and growth',
        input: {},
        priority: 9
      });
    }, 7 * 24 * 60 * 60 * 1000);

    // Generate dreams randomly
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every hour
        this.addTask({
          type: 'dreaming',
          title: 'Creative Dreaming',
          description: 'Generate creative insights and connections',
          input: {},
          priority: 6
        });
      }
    }, 60 * 60 * 1000);
  }

  // Get all tasks
  getTasks(): BackgroundTask[] {
    return [...this.tasks];
  }

  // Get all insights
  getInsights(): BackgroundInsight[] {
    return [...this.insights];
  }

  // Get recent insights
  getRecentInsights(hours: number = 24): BackgroundInsight[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.insights
      .filter(i => i.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear old tasks and insights
  cleanup() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    this.tasks = this.tasks.filter(t => t.createdAt > cutoff);
    this.insights = this.insights.filter(i => i.timestamp > cutoff);
  }
}

export const backgroundProcessor = new BackgroundProcessor(); 