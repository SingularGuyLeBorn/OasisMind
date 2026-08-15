"use client";

import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Headphones, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useVoiceConversation } from "@/lib/useVoiceConversation";

export type UseChatInputVoiceArgs = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  isStreaming?: boolean;
  disabled?: boolean;
  voiceReplyText?: string | null;
};

export function useChatInputVoice({
  input,
  setInput,
  isStreaming,
  disabled,
  voiceReplyText = null,
}: UseChatInputVoiceArgs) {
  // 听写模式（点 Mic）：webkitSpeechRecognition 追加到输入框，不自动发送
  const voiceBaseRef = useRef("");
  const [voiceChatOn, setVoiceChatOn] = useState(false);
  const { supported: sttSupported, listening, error: sttError, start: sttStart, stop: sttStop } =
    useSpeechRecognition(
      { lang: "zh-CN", interimResults: true, continuous: false, keepAlive: false },
      {
        onInterim: (t) => {
          if (voiceChatOn) return;
          setInput((voiceBaseRef.current + t).replace(/\s+$/, " "));
        },
        onFinal: (t) => {
          if (voiceChatOn) return;
          const merged =
            (voiceBaseRef.current ? voiceBaseRef.current.replace(/\s+$/, "") + " " : "") + t;
          voiceBaseRef.current = merged + " ";
          setInput(voiceBaseRef.current);
        },
      },
    );
  useEffect(() => {
    if (!listening) voiceBaseRef.current = input;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  // 语音对话模式：停顿自动发送 → 回复自动朗读（轻量，浏览器原生）
  const voiceSendRef = useRef<(text: string) => void>(() => {});
  useVoiceConversation({
    enabled: voiceChatOn,
    isStreaming: !!isStreaming,
    disabled: !!disabled,
    replyText: voiceReplyText,
    onSend: (text) => voiceSendRef.current(text),
    onDraftChange: (t) => {
      if (voiceChatOn) setInput(t);
    },
  });
  useEffect(() => {
    if (voiceChatOn && listening) sttStop();
  }, [voiceChatOn, listening, sttStop]);

  return {
    voiceChatOn,
    setVoiceChatOn,
    listening,
    sttSupported,
    sttError,
    sttStart,
    sttStop,
    voiceBaseRef,
    voiceSendRef,
  };
}

export function ChatInputVoiceButtons({
  disabled,
  input,
  voiceChatOn,
  setVoiceChatOn,
  listening,
  sttSupported,
  sttError,
  sttStart,
  sttStop,
  voiceBaseRef,
}: {
  disabled?: boolean;
  input: string;
  voiceChatOn: boolean;
  setVoiceChatOn: Dispatch<SetStateAction<boolean>>;
  listening: boolean;
  sttSupported: boolean;
  sttError: string | null;
  sttStart: () => void;
  sttStop: () => void;
  voiceBaseRef: RefObject<string>;
}) {
  if (!sttSupported) return null;
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setVoiceChatOn((v) => !v)}
        data-testid="chat-voice-conversation"
        className={cn(
          "inline-flex items-center justify-center rounded-lg p-1.5 transition disabled:opacity-50",
          voiceChatOn
            ? "bg-[var(--kp-brand)]/15 text-[var(--kp-brand)] hover:bg-[var(--kp-brand)]/25"
            : "text-[var(--kp-text-3)] hover:bg-[var(--kp-bg-mute)] hover:text-[var(--kp-brand-deep)]",
        )}
        title={voiceChatOn ? "语音对话开启中：你说完我答，答完我念" : "开启语音对话（你说完自动发送，我答完自动朗读）"}
        aria-label={voiceChatOn ? "关闭语音对话" : "开启语音对话"}
      >
        <Headphones className={cn("h-4 w-4", voiceChatOn && "animate-pulse")} />
      </button>
      {!voiceChatOn && (
        <button
          type="button"
          disabled={disabled}
          onClick={listening ? sttStop : () => { voiceBaseRef.current = input; sttStart(); }}
          data-testid="chat-voice-input"
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-1.5 transition disabled:opacity-50",
            listening
              ? "bg-red-500/15 text-red-500 hover:bg-red-500/25"
              : "text-[var(--kp-text-3)] hover:bg-[var(--kp-bg-mute)] hover:text-[var(--kp-brand-deep)]",
          )}
          title={
            sttError
              ? sttError
              : listening
                ? "正在听…点击停止"
                : "语音输入（浏览器原生，免费）"
          }
          aria-label={listening ? "停止语音输入" : "开始语音输入"}
        >
          <Mic className={cn("h-4 w-4", listening && "animate-pulse")} />
        </button>
      )}
    </>
  );
}
