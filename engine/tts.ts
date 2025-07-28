export interface VoiceModulation {
  pitch: number; // -2 to +2
  speed: number; // 0.8 to 1.2
  volume: number; // 0.8 to 1.2
}

/**
 * Speaks the given text using a specified voice with optional emotional modulation.
 * @param text The text to speak.
 * @param voice The voice to use for speaking.
 * @param modulation Optional voice modulation for emotional expression.
 */
export async function speak(text: string, voice: string, modulation?: VoiceModulation): Promise<void> {
  try {
    // Use the Web Speech API for TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes('Alex')) || null;
      
      // Apply emotional modulation if provided
      if (modulation) {
        utterance.rate = Math.max(0.8, Math.min(1.2, modulation.speed));
        utterance.pitch = Math.max(0.5, Math.min(2.0, 1 + modulation.pitch * 0.25));
        utterance.volume = Math.max(0.8, Math.min(1.2, modulation.volume));
      } else {
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
      }
      
      return new Promise((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        speechSynthesis.speak(utterance);
      });
    } else {
      console.log(`Speaking: "${text}" in voice "${voice}"`);
      // Fallback to console log if speech synthesis is not available
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('TTS error:', error);
    // Fallback
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
} 