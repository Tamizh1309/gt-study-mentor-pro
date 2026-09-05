/**
 * ============================================================================
 * GT JARVIS — Voice Synthesis & Speech Service
 * File: backend/jarvis/voiceService.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Prepares and cleans text for spoken audio output (Text-to-Speech).
 * 
 * WHY IT EXISTS:
 * AI text often includes markdown symbols like "**bold**", "```code```", and links.
 * If passed directly to a speech synthesizer, it sounds robotic ("star star bold star star").
 * This service cleans text so JARVIS speaks naturally and smoothly.
 */

/**
 * Strips markdown symbols, code blocks, and URLs to produce clean, natural speech
 * @param {string} text - Raw text with potential markdown
 * @returns {string} Natural spoken text
 */
function cleanTextForSpeech(text) {
  if (!text || typeof text !== 'string') return '';

  let speech = text;

  // 1. Remove code blocks
  speech = speech.replace(/```[\s\S]*?```/g, ' Code snippet provided in your chat window. ');
  speech = speech.replace(/`([^`]+)`/g, '$1');

  // 2. Remove markdown links [title](url) -> title
  speech = speech.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 3. Remove markdown headers, bold, italics, bullets
  speech = speech.replace(/#{1,6}\s+/g, '');
  speech = speech.replace(/\*\*([^*]+)\*\*/g, '$1');
  speech = speech.replace(/\*([^*]+)\*/g, '$1');
  speech = speech.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');
  speech = speech.replace(/^[\s*•-]+\s+/gm, '');

  // 4. Remove excessive newlines and whitespace
  speech = speech.replace(/\n+/g, '. ').replace(/\s{2,}/g, ' ').trim();

  // Limit spoken length to ~350 characters for voice brevity (full response remains in chat)
  if (speech.length > 350) {
    const periodIdx = speech.indexOf('.', 280);
    if (periodIdx !== -1 && periodIdx < 380) {
      speech = speech.substring(0, periodIdx + 1);
    } else {
      speech = speech.substring(0, 340) + '... Full details are displayed in your chat.';
    }
  }

  return speech;
}

/**
 * Returns recommended Web Speech Synthesis configuration
 */
function getSpeechConfig() {
  return {
    rate: 1.05,        // Slightly brisk, confident assistant pace
    pitch: 1.0,        // Natural pitch
    lang: 'en-US',     // Universal English default
    preferredVoices: ['Google UK English Male', 'Google US English', 'Microsoft George Online (Natural)', 'Samantha', 'Alex']
  };
}

module.exports = {
  cleanTextForSpeech,
  getSpeechConfig
};
