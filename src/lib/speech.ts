/**
 * Speech Synthesis (Voice Output) and Speech Recognition (Voice Input)
 * Optimized for Language Exam Preparation (JLPT Japanese, DELE Spanish, DALF French).
 *
 * Configured with soft, warm, neural voice selection and pitched-down acoustic profiles
 * so audio pronunciation is pleasant, soothing, and comfortable for extended study.
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

export type VoiceProfileKey = "soft" | "warm" | "natural";

export interface VoiceProfile {
  key: VoiceProfileKey;
  name: string;
  description: string;
  pitch: number;
  rate: number;
  volume: number;
}

/**
 * Acoustic presets designed to eliminate ear-piercing treble and robotic buzz.
 * "soft" is the default: pitched down slightly (0.92) for a gentle, calming tone.
 */
export const VOICE_PROFILES: Record<VoiceProfileKey, VoiceProfile> = {
  soft: {
    key: "soft",
    name: "Soft & Calming",
    description: "Pitched down for a gentle, soothing tone that is comfortable on the ears",
    pitch: 0.92,
    rate: 0.88,
    volume: 0.90,
  },
  warm: {
    key: "warm",
    name: "Warm & Deep",
    description: "Lower pitch with relaxed pacing and warm resonance",
    pitch: 0.85,
    rate: 0.86,
    volume: 0.90,
  },
  natural: {
    key: "natural",
    name: "Natural Studio",
    description: "Standard balanced native articulation",
    pitch: 0.96,
    rate: 0.90,
    volume: 0.94,
  },
};

const STORAGE_KEY_VOICE_PROFILE = "linguacamp_voice_profile";

export function getSavedVoiceProfile(): VoiceProfileKey {
  if (typeof window === "undefined") return "soft";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VOICE_PROFILE);
    if (saved && (saved === "soft" || saved === "warm" || saved === "natural")) {
      return saved as VoiceProfileKey;
    }
  } catch {
    // Ignore storage errors
  }
  return "soft";
}

export function saveVoiceProfile(profile: VoiceProfileKey): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_VOICE_PROFILE, profile);
  } catch {
    // Ignore storage errors
  }
}

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

// Voice pre-warming cache to prevent empty getVoices() on first client interaction
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    cachedVoices = voices;
  }
  return cachedVoices.length ? cachedVoices : voices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Check if the current browser environment supports SpeechSynthesis (TTS).
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/**
 * Scores a voice based on softness, acoustic warmth, and modern neural quality.
 * Prevents harsh, metallic Windows SAPI5 Desktop voices from hurting the user's ears.
 */
function scoreVoice(voice: SpeechSynthesisVoice, targetLang: SupportedLanguage): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.replace("_", "-").toLowerCase();
  const target = targetLang.toLowerCase();
  const targetPrefix = targetLang.split("-")[0].toLowerCase();

  let score = 0;

  // Language match weight
  if (lang === target) {
    score += 60;
  } else if (lang.startsWith(targetPrefix)) {
    score += 35;
  } else {
    return -1000; // Incompatible language
  }

  // --- HARSH VOICE FILTERS & PENALTIES ---
  // Legacy Windows SAPI5 desktop voices are notoriously harsh, tinny, and robotic
  if (name.includes("desktop")) score -= 300;
  if (name.includes("espeak")) score -= 350;
  if (name.includes("sapi")) score -= 250;
  if (name.includes("david")) score -= 80;
  if (name.includes("zira")) score -= 80;
  if (name.includes("mark")) score -= 80;
  if (name.includes("george")) score -= 60;
  if (name.includes("hazel")) score -= 60;

  // --- SOFT & NATURAL NEURAL VOICES (HIGHEST PRIORITY) ---
  // Microsoft Azure / Edge Online Natural voices are studio quality and very soft
  if (name.includes("online (natural)") || name.includes("natural")) {
    score += 180;
  }

  // Apple & Google High-Definition Neural / Enhanced voices
  if (name.includes("enhanced") || name.includes("premium")) {
    score += 140;
  }
  if (name.includes("neural")) {
    score += 130;
  }
  if (name.includes("google")) {
    score += 100;
  }

  // Soft, warm, gentle native speakers
  if (targetPrefix === "ja") {
    if (name.includes("nanami")) score += 90; // Nanami: very soft, gentle Japanese female voice
    if (name.includes("keita")) score += 75; // Keita: calm, warm Japanese male voice
    if (name.includes("aoi")) score += 70;
    if (name.includes("shiori")) score += 70;
    if (name.includes("kyoko")) score += 65;
    if (name.includes("otoya")) score += 65;
    if (name.includes("ayumi")) score += 30;
  } else if (targetPrefix === "es") {
    if (name.includes("elvira")) score += 90; // Elvira: soft, warm Spanish female voice
    if (name.includes("paloma")) score += 80;
    if (name.includes("alvaro")) score += 75; // Alvaro: calm, friendly Spanish male voice
    if (name.includes("monica")) score += 65;
    if (name.includes("paulina") || name.includes("paulino")) score += 65;
    if (name.includes("sofia")) score += 65;
    if (name.includes("jorge")) score += 55;
  } else if (targetPrefix === "fr") {
    if (name.includes("denise")) score += 90; // Denise: soft, soothing French voice
    if (name.includes("henri")) score += 75; // Henri: articulate, calm French male voice
    if (name.includes("celeste")) score += 70;
    if (name.includes("julie")) score += 65;
    if (name.includes("thomas")) score += 65;
    if (name.includes("amelie")) score += 65;
  } else {
    if (name.includes("jenny")) score += 90; // Jenny: warm, conversational English voice
    if (name.includes("aria")) score += 80;
    if (name.includes("guy")) score += 75;
    if (name.includes("samantha")) score += 65;
    if (name.includes("sonia")) score += 60;
  }

  return score;
}

/**
 * Select the softest, most pleasant voice for a target language.
 */
function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: SupportedLanguage,
  preferredName?: string,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  if (preferredName) {
    const namedVoice = voices.find((v) => v.name.toLowerCase() === preferredName.toLowerCase());
    if (namedVoice) return namedVoice;
  }

  const prefix = targetLang.split("-")[0].toLowerCase();
  const matchingVoices = voices.filter((v) =>
    v.lang.replace("_", "-").toLowerCase().startsWith(prefix),
  );

  if (!matchingVoices.length) {
    return voices[0] || null;
  }

  // Sort descending by softness and acoustic quality score
  matchingVoices.sort((a, b) => scoreVoice(b, targetLang) - scoreVoice(a, targetLang));

  return matchingVoices[0];
}

/**
 * Returns available voices for the target language, ranked from softest/highest quality down.
 */
export function getAvailableVoicesForLang(targetLang: SupportedLanguage): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = loadVoices();
  const prefix = targetLang.split("-")[0].toLowerCase();
  return voices
    .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix))
    .sort((a, b) => scoreVoice(b, targetLang) - scoreVoice(a, targetLang));
}

export interface SpeakOptions {
  lang?: SupportedLanguage | string;
  rate?: number;
  pitch?: number;
  volume?: number;
  profile?: VoiceProfileKey;
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Read text aloud in authentic native pronunciation with a soft, pitched-down tone.
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

  // Apply voice profile (defaults to "soft": pitched down 0.92, rate 0.88, volume 0.90)
  const profileKey = options.profile || getSavedVoiceProfile();
  const profile = VOICE_PROFILES[profileKey] || VOICE_PROFILES.soft;

  utterance.lang = lang;
  utterance.rate = options.rate ?? profile.rate;
  utterance.pitch = options.pitch ?? profile.pitch; // Pitched down for gentle, pleasant listening
  utterance.volume = options.volume ?? profile.volume; // Soft volume preventing ear fatigue

  // Attempt voice selection from pre-warmed cache
  const voices = loadVoices();
  const bestVoice = selectBestVoice(voices, lang, options.voiceName);
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
