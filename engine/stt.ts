/**
 * Transcribes audio from the microphone.
 * @returns A promise that resolves with the transcribed text.
 */
export async function transcribeFromMic(): Promise<string> {
  // TODO: Implement microphone input and transcription using macOS Speech or Whisper.cpp.
  console.log('Listening for microphone input...');
  return new Promise(resolve => setTimeout(() => resolve('This is a transcribed message.'), 3000));
} 