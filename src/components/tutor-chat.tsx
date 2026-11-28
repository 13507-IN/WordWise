"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Bot, Mic, MicOff, RotateCcw, Sparkles } from "lucide-react";
import { AudioSpeakerButton } from "@/components/audio-speaker-button";
import {
  isSpeechRecognitionSupported,
  resolveLanguageCode,
  startSpeechRecognition,
  type ActiveRecognition,
  type SupportedLanguage,
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
  examName,
  examCode,
  level,
}: {
  examName: string;
  examCode?: string;
  level: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Speech Recognition state
  const targetExamLang = resolveLanguageCode(examCode || examName);
  const [voiceLang, setVoiceLang] = useState<SupportedLanguage>(targetExamLang);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const activeRecognitionRef = useRef<ActiveRecognition | null>(null);
  const baseInputRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const speechRecSupported = isSpeechRecognitionSupported();

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (activeRecognitionRef.current) {
        activeRecognitionRef.current.abort();
      }
    };
  }, []);

  function stopListening() {
    if (activeRecognitionRef.current) {
      activeRecognitionRef.current.stop();
      activeRecognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
      return;
    }

    if (!speechRecSupported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    setError("");
    baseInputRef.current = input;
    setIsListening(true);
    setInterimText("");

    const rec = startSpeechRecognition({
      lang: voiceLang,
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          const prefix = baseInputRef.current ? `${baseInputRef.current} ` : "";
          const nextVal = `${prefix}${transcript}`.trim();
          setInput(nextVal);
          baseInputRef.current = nextVal;
          setInterimText("");
        } else {
          setInterimText(transcript);
        }
      },
      onError: (errMsg) => {
        setError(errMsg);
        setIsListening(false);
        setInterimText("");
      },
      onEnd: () => {
        setIsListening(false);
        setInterimText("");
        activeRecognitionRef.current = null;
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      },
    });

    activeRecognitionRef.current = rec;
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isListening) {
      stopListening();
    }

    const content = input.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The tutor could not respond.");
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
                  title="Listen to native voice pronunciation"
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
        {busy && (
          <div className="tutor-message assistant">
            <span>Tutor</span>
            <p>Thinking through your question in {langBadgeText}…</p>
          </div>
        )}
      </div>

      {error && <p className="form-error tutor-error" role="alert">{error}</p>}

      {/* Voice Input Active Banner */}
      {isListening && (
        <div className="tutor-listening-bar" role="status">
          <div className="listening-pulse-dot" />
          <div className="listening-info">
            <strong>Listening in {voiceLang === "ja-JP" ? "Japanese 🇯🇵" : voiceLang === "es-ES" ? "Spanish 🇪🇸" : voiceLang === "fr-FR" ? "French 🇫🇷" : "English 🇺🇸"}…</strong>
            <span>{interimText ? `“${interimText}”` : "Speak clearly into your microphone"}</span>
          </div>
          <button
            type="button"
            className="listening-stop-btn"
            onClick={stopListening}
          >
            <MicOff size={14} /> Stop
          </button>
        </div>
      )}

      {/* Compose Form */}
      <form className="tutor-compose" onSubmit={send}>
        <div className="tutor-compose-top">
          <label className="sr-only" htmlFor="tutor-message">Ask your tutor</label>
          <div className="tutor-lang-toggle">
            <span className="lang-toggle-label">Voice input language:</span>
            <button
              type="button"
              className={`lang-chip${voiceLang === targetExamLang ? " active" : ""}`}
              onClick={() => {
                if (isListening) stopListening();
                setVoiceLang(targetExamLang);
              }}
            >
              {targetExamLang === "ja-JP" ? "🇯🇵 日本語 (Japanese)" : targetExamLang === "es-ES" ? "🇪🇸 Español (Spanish)" : "🇫🇷 Français (French)"}
            </button>
            <button
              type="button"
              className={`lang-chip${voiceLang === "en-US" ? " active" : ""}`}
              onClick={() => {
                if (isListening) stopListening();
                setVoiceLang("en-US");
              }}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        <div className="tutor-input-box">
          <textarea
            ref={textareaRef}
            id="tutor-message"
            maxLength={1800}
            rows={2}
            placeholder={`Ask a question or speak in ${targetExamLang === "ja-JP" ? "Japanese" : targetExamLang === "es-ES" ? "Spanish" : "your target language"}…`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <div className="tutor-input-actions">
            <button
              type="button"
              className={`tutor-mic-btn${isListening ? " is-recording" : ""}`}
              onClick={toggleListening}
              title={
                isListening
                  ? "Click to stop recording"
                  : `Speak in ${voiceLang === "ja-JP" ? "Japanese" : voiceLang === "es-ES" ? "Spanish" : voiceLang === "fr-FR" ? "French" : "English"}`
              }
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <>
                  <span className="mic-pulse-ring" />
                  <MicOff size={16} />
                </>
              ) : (
                <Mic size={16} />
              )}
              <span className="mic-btn-text">{isListening ? "Listening…" : "Voice input"}</span>
            </button>
            <button
              className="button"
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
            >
              <ArrowUp aria-hidden="true" size={17} /> Send
            </button>
          </div>
        </div>
      </form>
      <p className="tutor-disclaimer">
        Authentic speech synthesis & recognition powered by native Web Speech API. Audio pronunciation works for words, sentences, and exam questions.
      </p>
    </section>
  );
}
