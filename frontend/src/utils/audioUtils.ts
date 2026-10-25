/**
 * High-fidelity Kannada Audio Pronunciation Utility.
 * Primary: Server-side neural Indic speech audio streamed via FastAPI proxy (/api/v1/tts).
 * Fallback: Native browser Web Speech API (SpeechSynthesisUtterance) for offline situations.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:8000');

export const extractKannadaText = (text: string): string => {
  if (!text) return '';
  // 1. Separate Kannada script from transliteration inside parentheses (e.g. "ನಮಸ್ಕಾರ (Namaskara)")
  const beforeParen = text.split('(')[0].trim();
  // 2. Filter for Kannada Unicode range, digits, whitespace, and basic punctuation
  const kannadaChars = beforeParen.match(/[\u0C80-\u0CFF0-9\s।,?!.-]+/g);
  if (kannadaChars && kannadaChars.length > 0) {
    const cleaned = kannadaChars.join('').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 0) return cleaned;
  }
  return beforeParen;
};

// Global audio element reference to halt any active audio before starting a new one
let activeAudio: HTMLAudioElement | null = null;

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

  // Stop any ongoing HTML5 audio
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }

  // Stop any active browser speech synthesis
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  let isCancelled = false;

  const handleEnd = () => {
    if (!isCancelled && onEnd) {
      onEnd();
    }
  };

  // 1. Primary: Stream high-quality neural Kannada speech from backend proxy
  try {
    const audioUrl = `${API_BASE_URL}/api/v1/tts?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;
    audio.playbackRate = rate;

    audio.onplay = () => {
      if (!isCancelled && onStart) {
        onStart();
      }
    };

    audio.onended = () => {
      if (activeAudio === audio) {
        activeAudio = null;
      }
      handleEnd();
    };

    audio.onerror = () => {
      if (isCancelled) return;
      // If backend audio fails, fall back to browser Web Speech API
      playWithSpeechSynthesis(cleanText, onStart, onEnd, rate);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (isCancelled) return;
        playWithSpeechSynthesis(cleanText, onStart, onEnd, rate);
      });
    }

    return () => {
      isCancelled = true;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
      if (activeAudio === audio) {
        activeAudio = null;
      }
      handleEnd();
    };
  } catch {
    return playWithSpeechSynthesis(cleanText, onStart, onEnd, rate);
  }
};

const playWithSpeechSynthesis = (
  cleanText: string,
  onStart?: () => void,
  onEnd?: () => void,
  rate: number = 0.85
): (() => void) => {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return () => {};
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'kn-IN';
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const knVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('kn') ||
        v.name.toLowerCase().includes('kannada')
    );
    if (knVoice) {
      utterance.voice = knVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      if (onEnd) onEnd();
    };
  } catch {
    if (onEnd) onEnd();
    return () => {};
  }
};
