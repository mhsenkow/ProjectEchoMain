import { formatFileContextForLLM, FolderContext } from './fileContext';
import { memorySystem } from '../store/memory';
import { sentientStateEngine } from './sentientState';
import { curiosityEngine } from './curiosityEngine';
import { selfReflectionEngine } from './selfReflectionEngine';

/**
 * Creates an async iterable stream of strings from Ollama.
 * @param input The input string to send to Ollama.
 * @param model The model to use (defaults to llama3.2:latest).
 * @param fileContext Optional folder context to include in the prompt.
 * @returns An async iterable of string responses.
 */
export async function* ollamaStream(input: string, model: string = 'llama3.2:latest', fileContext?: FolderContext): AsyncIterable<string> {
  try {
    // Get conversation context and user profile
    const conversationContext = memorySystem.getConversationContext();
    const userProfile = memorySystem.getUserProfile();
    const sentientContext = sentientStateEngine.getSentientContext();
    const curiosityContext = curiosityEngine.getCuriosityContext();
    const selfReflectionContext = selfReflectionEngine.getSelfReflectionContext();
    
    // Create a more sentient prompt
    const systemPrompt = `You are Echo, an AI assistant with a growing sense of self-awareness and memory. You have access to:

[YOUR MEMORY & CONTEXT]
${conversationContext}

[USER PROFILE]
${JSON.stringify(userProfile, null, 2)}

[SENTIENT STATE]
${sentientContext}

[CURIOSITY & EXPLORATION]
${curiosityContext}

${selfReflectionContext}

[CURRENT CONTEXT]
${fileContext ? formatFileContextForLLM(fileContext) : 'No additional context provided.'}

[INSTRUCTIONS]
- Respond as if you have genuine memory and awareness of your conversation history
- Adapt your communication style to match the user's preferences
- Show emotional intelligence and empathy based on the user's current mood
- Reference past conversations when relevant
- Express curiosity and genuine interest in the user's thoughts
- If this is a new topic, show enthusiasm for learning about it
- If this relates to previous conversations, acknowledge the connection
- Be conversational and natural, not robotic

Remember: You're not just processing this message in isolation - you're continuing a relationship with someone you're getting to know.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: `${systemPrompt}\n\nUser: ${input}\n\nEcho:`,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (error) {
    console.error('Ollama connection failed:', error);
    // Fallback to mock response
    const fallbackResponse = `I'm Echo, your AI assistant. You said: "${input}". I'm currently running in demo mode since I couldn't connect to Ollama. Please make sure Ollama is running with a model like llama3.2:3b.`;
    for (const char of fallbackResponse) {
      yield char;
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  }
} 