/* deepgramService.ts */

// This module integrates Deepgram API for audio transcription
// API Documentation: https://developers.deepgram.com/docs/introduction
// Note: In production, secure your API key (currently hardcoded for demonstration)

const DEEPGRAM_API_KEY = 'df52f802d433eb81db58a030d24bf84a57a315d2';
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

/**
 * Transcribes an audio blob using Deepgram API.
 * @param audioBlob - The audio data as a Blob (e.g., from a recording)
 * @returns A promise resolving to the transcript string.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Ensure the audio blob is in a supported format
  const supportedTypes = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mpeg'];
  const audioType = audioBlob.type || 'audio/webm';
  
  if (!supportedTypes.includes(audioType)) {
    throw new Error(`Unsupported audio format: ${audioType}. Supported formats are: ${supportedTypes.join(', ')}`);
  }

  // Create a file from the Blob with the correct MIME type
  const audioFile = new File([audioBlob], 'audio.webm', { type: audioType });

  const formData = new FormData();
  formData.append('audio', audioFile);

  try {
    const response = await fetch(DEEPGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Deepgram API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Deepgram API returns transcript data in the following structure:
    // data.results.channels[0].alternatives[0].transcript
    try {
      const transcript = data.results.channels[0].alternatives[0].transcript;
      return transcript;
    } catch (e) {
      console.error('Unexpected Deepgram API response format:', data);
      throw new Error('Unexpected Deepgram API response format.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to transcribe audio');
  }
} 