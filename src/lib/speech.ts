/**
 * Speech Synthesis (Voice Output) and Speech Recognition (Voice Input)
 * Optimized for Language Exam Preparation (JLPT Japanese, DELE Spanish, DALF French).
 */

export type SupportedLanguage = "ja-JP" | "es-ES" | "fr-FR" | "en-US";

export interface SpeechLangConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  samplePhrase: string;
}

export const SUPPORTED_LANGS: Record<string, SpeechLangConfig> = {
  "ja-JP": {
    code: "ja-JP",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    samplePhrase: "こんにちは",
  },
  "es-ES": {
    code: "es-ES",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    samplePhrase: "¡Hola! ¿Cómo estás?",
  },
  "fr-FR": {
    code: "fr-FR",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    samplePhrase: "Bonjour, comment ça va ?",
  },
  "en-US": {
    code: "en-US",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    samplePhrase: "Hello! How can I help you?",
  },
};

// Japanese character range: Hiragana, Katakana, Kanji, Halfwidth Katakana
const JAPANESE_CHAR_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff66-\uff9f]/;
// Spanish distinctive characters: inverted question/exclamation, accented vowels, ñ
const SPANISH_CHAR_REGEX = /[¿¡áéíóúüñ]/i;
// French distinctive characters: accented vowels, ç, ligature
const FRENCH_CHAR_REGEX = /[àâçéèêëîïôûùüÿœæ]/i;

/**
 * Automatically determine the best language code from exam code, exam name, or raw text content.
 */
export function resolveLanguageCode(examCodeOrName?: string, textSnippet?: string): SupportedLanguage {
  const normExam = (examCodeOrName ?? "").toLowerCase();

  if (normExam.includes("jlpt") || normExam.includes("japan") || normExam.includes("日本語")) {
    return "ja-JP";
  }
  if (normExam.includes("dele") || normExam.includes("spanish") || normExam.includes("español")) {
    return "es-ES";
  }
  if (normExam.includes("dalf") || normExam.includes("delf") || normExam.includes("french") || normExam.includes("français")) {
    return "fr-FR";
  }

  // Fallback to text inspection if exam code wasn't specified or was generic
  if (textSnippet) {
    if (JAPANESE_CHAR_REGEX.test(textSnippet)) {
      return "ja-JP";
    }
    if (SPANISH_CHAR_REGEX.test(textSnippet)) {
      return "es-ES";
    }
    if (FRENCH_CHAR_REGEX.test(textSnippet)) {
      return "fr-FR";
    }
  }

  return "en-US";
}

// Module-level reference to protect utterance from garbage collection in Chromium
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeStopCallback: (() => void) | null = null;

/**
 * Check if the current browser environment supports SpeechSynthesis (TTS).
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/**
 * Select the most authentic native voice for a target language.
 */
function selectBestVoice(voices: SpeechSynthesisVoice[], targetLang: SupportedLanguage): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const langPrefix = targetLang.split("-")[0].toLowerCase();

  // 1. Exact match (e.g. ja-JP, es-ES)
  const exactMatches = voices.filter((v) => v.lang.replace("_", "-").toLowerCase() === targetLang.toLowerCase());
  if (exactMatches.length) {
    // Prefer natural/local voices or known high quality voice names
    const preferred = exactMatches.find(
      (v) =>
        v.localService ||
        v.name.includes("Natural") ||
        v.name.includes("Google") ||
        v.name.includes("Premium") ||
        v.name.includes("Enhanced") ||
        v.name.includes("Kyoko") ||
        v.name.includes("Monica") ||
        v.name.includes("Thomas"),
    );
    return preferred || exactMatches[0];
  }

  // 2. Prefix match (e.g. ja, es, fr)
  const prefixMatches = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(langPrefix));
  if (prefixMatches.length) {
    return prefixMatches[0];
  }

  return null;
}

export interface SpeakOptions {
  lang?: SupportedLanguage | string;
  rate?: number; // Default 0.90 for learner-friendly clarity
  pitch?: number; // Default 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Read text aloud in authentic native pronunciation.
 * Returns a cancel function to stop playback.
 */
export function speakText(text: string, options: SpeakOptions = {}): () => void {
  if (!isSpeechSynthesisSupported()) {
    options.onError?.(new Error("Speech synthesis is not supported in this browser."));
    return () => {};
  }

  const cleanText = text.trim();
  if (!cleanText) {
    options.onEnd?.();
    return () => {};
  }

  // Cancel any prior speech
  stopSpeaking();

  const lang = (options.lang as SupportedLanguage) || resolveLanguageCode(undefined, cleanText);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  activeUtterance = utterance;

  utterance.lang = lang;
  utterance.rate = options.rate ?? 0.90; // Slightly paced for language learners
  utterance.pitch = options.pitch ?? 1.0;

  // Attempt voice selection
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = selectBestVoice(voices, lang);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  let finished = false;
  const finish = (callback?: () => void) => {
    if (finished) return;
    finished = true;
    if (activeUtterance === utterance) {
      activeUtterance = null;
      activeStopCallback = null;
    }
    callback?.();
  };

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    finish(options.onEnd);
  };

  utterance.onerror = (event) => {
    // If canceled manually, don't trigger error
    if (event.error === "canceled" || event.error === "interrupted") {
      finish(options.onEnd);
    } else {
      finish(() => options.onError?.(event));
    }
  };

  const cancel = () => {
    finish(options.onEnd);
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  };

  activeStopCallback = cancel;

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    finish(() => options.onError?.(err));
  }

  return cancel;
}

/**
 * Immediately stop any current speech synthesis audio.
 */
export function stopSpeaking(): void {
  if (activeStopCallback) {
    const cb = activeStopCallback;
    activeStopCallback = null;
    cb();
  }
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
  activeUtterance = null;
}

/**
 * Check if speech recognition (Speech-to-Text / Mic) is supported.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  );
}

export interface SpeechRecognitionHandlers {
  lang?: SupportedLanguage | string;
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  onEnd?: () => void;
}

export interface ActiveRecognition {
  stop: () => void;
  abort: () => void;
}

/**
 * Start speech recognition to listen to the student speaking Japanese, Spanish, French, or English.
 */
export function startSpeechRecognition(handlers: SpeechRecognitionHandlers): ActiveRecognition | null {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError?.("Voice input (Speech Recognition) is not supported in this browser. Please try Chrome, Edge, or Safari.");
    return null;
  }

  const SpeechRecConstructor =
    (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

  if (!SpeechRecConstructor) return null;

  try {
    const recognition = new SpeechRecConstructor();
    recognition.lang = handlers.lang || "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let hasEnded = false;

    recognition.onstart = () => {
      handlers.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        handlers.onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        handlers.onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      const err = event.error;
      let friendly = "Voice input could not capture audio.";
      if (err === "not-allowed" || err === "permission-denied") {
        friendly = "Microphone access was denied. Please allow microphone permissions in your browser settings to use voice input.";
      } else if (err === "no-speech") {
        friendly = "No speech was detected. Please try speaking closer to your microphone.";
      } else if (err === "audio-capture") {
        friendly = "No microphone was found. Please ensure a microphone is connected.";
      } else if (err === "network") {
        friendly = "Network error during speech recognition.";
      }
      handlers.onError?.(friendly);
    };

    recognition.onend = () => {
      if (!hasEnded) {
        hasEnded = true;
        handlers.onEnd?.();
      }
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      },
      abort: () => {
        try {
          recognition.abort();
        } catch {
          // Ignore
        }
      },
    };
  } catch (err) {
    handlers.onError?.(err instanceof Error ? err.message : "Could not initialize voice input.");
    return null;
  }
}
