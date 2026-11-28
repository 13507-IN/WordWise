"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Bot, Mic, MicOff, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { AudioSpeakerButton } from "@/components/audio-speaker-button";
import {
  getSavedVoiceProfile,
  isSpeechRecognitionSupported,
  resolveLanguageCode,
  saveVoiceProfile,
  speakText,
  startSpeechRecognition,
  type ActiveRecognition,
  type SupportedLanguage,
  type VoiceProfileKey,
} from "@/lib/speech";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_STARTERS: Record<string, { label: string; text: string }[]> = {
  "ja-JP": [
    { label: "🇯🇵 JLPT N5 Vocabulary", text: "Please give me 5 essential JLPT vocabulary words with furigana readings, English meanings, and sample sentences." },
    { label: "🇯🇵 は vs が Grammar", text: "Can you explain the difference between the particles は (wa) and が (ga) in Japanese with simple examples?" },
    { label: "🇯🇵 Listening Dialogue", text: "Create a short 3-line Japanese conversation between a customer and a shopkeeper, and pronounce each line." },
  ],
  "es-ES": [
    { label: "🇪🇸 Por vs Para", text: "Explain the difference between 'por' and 'para' in Spanish with practical DELE exam examples." },
    { label: "🇪🇸 DELE Vocabulary", text: "Give me 5 essential intermediate Spanish verbs with irregular preterite conjugations." },
    { label: "🇪🇸 Conversational Spanish", text: "Write a short conversation ordering food at a restaurant in Madrid with phonetic tips." },
  ],
  "fr-FR": [
    { label: "🇫🇷 Subjunctive Mood", text: "When do I need to use the subjunctive in French? Give me common trigger expressions." },
    { label: "🇫🇷 DALF Vocabulary", text: "Provide 5 advanced formal connectors used in DALF argumentative essays." },
    { label: "🇫🇷 Dialogue Practice", text: "Write a polite telephone dialogue in French for booking an appointment." },
  ],
};

export function TutorChat({
  examName = "Japanese Language Proficiency Test",
  examCode,
  level = "N5",
  defaultLang,
}: {
  examName?: string;
  examCode?: string;
  level?: string;
  defaultLang?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");
  const [voiceTone, setVoiceTone] = useState<VoiceProfileKey>(() => getSavedVoiceProfile());

  const recognitionRef = useRef<ActiveRecognition | null>(null);
  const targetExamLang = resolveLanguageCode(examCode || defaultLang || examName);
  const speechRecSupported = isSpeechRecognitionSupported();

  // Clean up any ongoing speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  function handleToneChange(tone: VoiceProfileKey) {
    setVoiceTone(tone);
    saveVoiceProfile(tone);
    const sample =
      targetExamLang === "ja-JP"
        ? "こんにちは"
        : targetExamLang === "es-ES"
        ? "¡Hola!"
        : targetExamLang === "fr-FR"
        ? "Bonjour"
        : "Hello";
    speakText(sample, { lang: targetExamLang, profile: tone });
  }

  function toggleListening() {
    if (!speechRecSupported) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Apple Safari.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    setError("");
    setInterimSpeech("");

    const active = startSpeechRecognition({
      lang: targetExamLang,
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          setInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
          setInterimSpeech("");
        } else {
          setInterimSpeech(transcript);
        }
      },
      onError: (errMessage) => {
        setError(errMessage);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
        setInterimSpeech("");
      },
    });

    if (active) {
      recognitionRef.current = active;
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimSpeech("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isListening) stopListening();

    const cleanInput = input.trim();
    if (!cleanInput || busy) return;

    setError("");
    const nextMessages: Message[] = [...messages, { role: "user", content: cleanInput }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          exam: `${examName} ${level}`,
          language: targetExamLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not reach your AI Tutor right now.");
      }

      const result = (await response.json()) as { reply: string };
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The tutor could not respond.");
    } finally {
      setBusy(false);
    }
  }

  const starters = QUICK_STARTERS[targetExamLang] || QUICK_STARTERS["ja-JP"];

  const langBadgeText =
    targetExamLang === "ja-JP"
      ? "Japanese (日本語)"
      : targetExamLang === "es-ES"
      ? "Spanish (Español)"
      : targetExamLang === "fr-FR"
      ? "French (Français)"
      : "Target Language";

  return (
    <section className="tutor-panel">
      <div className="tutor-panel-head">
        <div className="tutor-avatar"><Bot aria-hidden="true" /></div>
        <div>
          <strong>{examName} {level} AI Tutor</strong>
          <span className="tutor-subhead">
            Audio Pronunciation & Speech Recognition enabled ({langBadgeText})
          </span>
        </div>
        <div className="tutor-head-actions">
          <label className="voice-tone-select-wrap" title="Adjust voice tone & pitch">
            <Volume2 size={13} aria-hidden="true" />
            <select
              aria-label="Voice tone preset"
              className="voice-tone-select"
              value={voiceTone}
              onChange={(e) => handleToneChange(e.target.value as VoiceProfileKey)}
            >
              <option value="soft">Soft & Calming (Pitched down)</option>
              <option value="warm">Warm & Deep (Low pitch)</option>
              <option value="natural">Natural Studio (Balanced)</option>
            </select>
          </label>
          <button
            className="tutor-reset"
            type="button"
            disabled={!messages.length || busy}
            onClick={() => {
              if (isListening) stopListening();
              setMessages([]);
              setError("");
            }}
          >
            <RotateCcw aria-hidden="true" size={15} /> Clear
          </button>
        </div>
      </div>

      <div className="tutor-messages" aria-live="polite">
        {messages.length ? (
          messages.map((message, idx) => (
            <article className={`tutor-message ${message.role}`} key={`${message.role}-${idx}`}>
              <div className="tutor-msg-header">
                <span>{message.role === "user" ? "You" : "Tutor"}</span>
                <AudioSpeakerButton
                  text={message.content}
                  lang={targetExamLang}
                  size="xs"
                  variant="subtle"
                  label={message.role === "assistant" ? "Read aloud" : "Pronounce"}
                  title="Listen to soft, native voice pronunciation"
                />
              </div>
              <p className="tutor-msg-content">{message.content}</p>
            </article>
          ))
        ) : (
          <div className="tutor-empty">
            <Bot aria-hidden="true" size={32} />
            <h2>Speak or type your question in {langBadgeText}</h2>
            <p>
              Listen to native pronunciations of words, practice speaking with your microphone, or ask for targeted exam guidance.
            </p>
            <div className="tutor-quick-prompts">
              <span className="quick-prompts-label"><Sparkles size={13} /> Try asking:</span>
              <div className="quick-prompt-chips">
                {starters.map((starter, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    className="quick-prompt-btn"
                    onClick={() => setInput(starter.text)}
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {interimSpeech && (
          <div className="tutor-interim-speech">
            <span className="listening-pulse" />
            <span>{interimSpeech}</span>
          </div>
        )}

        {busy && (
          <div className="tutor-thinking">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
            <span>Thinking…</span>
          </div>
        )}
      </div>

      {error && (
        <div className="tutor-error-bar" role="alert">
          <span>{error}</span>
        </div>
      )}

      <form className="tutor-input-box" onSubmit={handleSubmit}>
        <div className="tutor-input-row">
          <input
            type="text"
            className="tutor-input"
            placeholder={
              isListening
                ? "Listening… speak in Japanese or English now"
                : `Ask a question about ${examName} or type words to hear pronunciation…`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />

          {speechRecSupported && (
            <button
              type="button"
              className={`tutor-mic-btn${isListening ? " is-listening" : ""}`}
              onClick={toggleListening}
              disabled={busy}
              title={isListening ? "Stop listening" : "Click to speak with microphone"}
              aria-label={isListening ? "Stop microphone" : "Start microphone"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <button
            type="submit"
            className="tutor-send-btn"
            disabled={!input.trim() || busy}
            title="Send question to tutor"
            aria-label="Send question"
          >
            <ArrowUp size={18} />
          </button>
        </div>

        <p className="tutor-footnote">
          Authentic native voice synthesis & recognition. Audio is pitched down for gentle, non-fatiguing listening.
        </p>
      </form>
    </section>
  );
}
