"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { resolveLanguageCode, speakText, stopSpeaking, type SupportedLanguage } from "@/lib/speech";

export interface AudioSpeakerButtonProps {
  text: string;
  lang?: SupportedLanguage | string;
  label?: string;
  title?: string;
  size?: "xs" | "sm" | "md";
  variant?: "inline" | "pill" | "subtle";
  className?: string;
}

export function AudioSpeakerButton({
  text,
  lang,
  label,
  title,
  size = "sm",
  variant = "subtle",
  className = "",
}: AudioSpeakerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // If unmounting while playing, stop speech
      if (isPlaying) {
        stopSpeaking();
      }
    };
  }, [isPlaying]);

  const targetLang = resolveLanguageCode(lang, text);
  const langName =
    targetLang === "ja-JP"
      ? "Japanese"
      : targetLang === "es-ES"
      ? "Spanish"
      : targetLang === "fr-FR"
      ? "French"
      : "English";

  const defaultTitle = isPlaying
    ? "Stop audio"
    : `Listen to authentic ${langName} pronunciation`;

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakText(text, {
      lang: targetLang,
      rate: 0.88, // Learner-friendly articulation speed
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }

  const iconSize = size === "xs" ? 13 : size === "sm" ? 15 : 17;

  return (
    <button
      type="button"
      className={`audio-pronounce-btn audio-${variant} audio-${size}${isPlaying ? " is-playing" : ""} ${className}`.trim()}
      onClick={handleClick}
      title={title || defaultTitle}
      aria-label={title || defaultTitle}
    >
      {isPlaying ? (
        <>
          <span className="audio-wave-anim" aria-hidden="true">
            <span className="bar bar-1" />
            <span className="bar bar-2" />
            <span className="bar bar-3" />
          </span>
          <VolumeX size={iconSize} aria-hidden="true" />
        </>
      ) : (
        <Volume2 size={iconSize} aria-hidden="true" />
      )}
      {label && <span className="audio-btn-label">{label}</span>}
      {isPlaying && <span className="sr-only">Playing {langName} pronunciation. Click to stop.</span>}
    </button>
  );
}
