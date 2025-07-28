import { Conversation } from './types';

/**
 * Parses a JSON string and returns a Conversation object.
 * @param json The JSON string to parse.
 * @returns The parsed Conversation object.
 */
export function loadConversation(json: string): Conversation {
  // TODO: Implement proper validation and error handling.
  return JSON.parse(json);
} 