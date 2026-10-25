/**
 * Native Web Speech API & Indic Audio Synthesis for Kannada Phrases.
 * Allows non-Kannadiga travelers to hear authentic spoken Kannada with zero API keys.
 */

export const extractKannadaText = (text: string): string => {
  // Extract Kannada unicode characters (\u0C80-\u0CFF), numbers, and basic punctuation
  const match = text.match(/[\u0C80-\u0CFF\s\?]+/g);
  if (match && match.length > 0) {
    const cleaned = match.join(' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 1) return cleaned;
  }
  // Fallback: strip parentheses if transliteration is combined
  return text.split('(')[0].trim();
};

export const playKannadaSpeech = (
  rawText: string,
  onStart?: () => void,
  onEnd?: () => void,
  rate: number = 0.85
): (() => void) => {
  const cleanText = extractKannadaText(rawText);
  if (!cleanText) {
    if (onEnd) onEnd();
    return () => {};
  }

  // 1. Try Native Web Speech API (High-fidelity on Chrome, Edge, Android, iOS)
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop any overlapping audio

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'kn-IN';
      utterance.rate = rate; // 0.85x speed for clear pronunciation learning

      // Check for an installed Kannada voice
      const voices = window.speechSynthesis.getVoices();
      const knVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('kn') ||
          v.name.toLowerCase().includes('kannada')
      );
      if (knVoice) {
        utterance.voice = knVoice;
      }

      let started = false;

      utterance.onstart = () => {
        started = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        fallbackToAudioStream(cleanText, onStart, onEnd);
      };

      window.speechSynthesis.speak(utterance);

      // Timeout fallback: if browser claims to support SpeechSynthesis but has no Indic voice installed
      const timer = setTimeout(() => {
        if (!started && !window.speechSynthesis.speaking) {
          fallbackToAudioStream(cleanText, onStart, onEnd);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        try {
          window.speechSynthesis.cancel();
        } catch {}
        if (onEnd) onEnd();
      };
    } catch {
      return fallbackToAudioStream(cleanText, onStart, onEnd);
    }
  }

  return fallbackToAudioStream(cleanText, onStart, onEnd);
};

const fallbackToAudioStream = (
  cleanText: string,
  onStart?: () => void,
  onEnd?: () => void
): (() => void) => {
  try {
    const encoded = encodeURIComponent(cleanText);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=kn&q=${encoded}`;
    const audio = new Audio(audioUrl);

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      if (onEnd) onEnd();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (onEnd) onEnd();
      });
    }

    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      if (onEnd) onEnd();
    };
  } catch {
    if (onEnd) onEnd();
    return () => {};
  }
};
