"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";

import { AI_QUESTIONS, generateAiResponse } from "../lib/ai-responses";
import type {
  AiMessage,
  AiQuestionId,
  IntelligenceAnalytics,
  IntelligenceFilters,
} from "../types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AiAssistantPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: IntelligenceFilters;
  analytics: IntelligenceAnalytics;
};

export function AiAssistantPanel({
  open,
  onOpenChange,
  filters,
  analytics,
}: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "LARSSH Intelligence Assistant is ready. Select a guided question to generate advisory output for your current property scope. Live AI connection is not enabled in preview mode.",
    },
  ]);

  function askQuestion(questionId: AiQuestionId) {
    const question = AI_QUESTIONS.find((item) => item.id === questionId);
    if (!question) return;

    const response = generateAiResponse(questionId, filters, analytics);

    setMessages((current) => [
      ...current,
      { id: `${questionId}-user`, role: "user", content: question.prompt },
      { id: `${questionId}-assistant`, role: "assistant", content: response },
    ]);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-white/5 bg-black/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="paragon-gold-gradient flex size-10 items-center justify-center rounded-xl">
              <Bot className="text-gold-foreground size-4" />
            </div>
            <div>
              <SheetTitle>Ask AI</SheetTitle>
              <SheetDescription className="mt-1">
                Intelligence assistant · Mock preview
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex h-full flex-col">
          <div className="border-b border-white/5 px-4 py-4">
            <p className="text-muted-foreground mb-3 text-[10px] tracking-wider uppercase">
              Guided Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {AI_QUESTIONS.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => askQuestion(question.id)}
                  className="rounded-full border border-gold/20 bg-gold-muted/30 px-3 py-1.5 text-left text-xs transition-colors hover:border-gold/40 hover:bg-gold-muted/50"
                >
                  {question.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-7",
                  message.role === "assistant"
                    ? "border border-white/5 bg-white/[0.03]"
                    : "border border-gold/20 bg-gold-muted/20 ml-8"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="text-gold mb-2 flex items-center gap-2 text-[10px] tracking-wider uppercase">
                    <Sparkles className="size-3" />
                    Intelligence Assistant
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 p-4">
            <Button
              disabled
              className="w-full border border-white/10 bg-white/5 text-muted-foreground"
            >
              Live AI connection coming soon
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AskAiButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="paragon-gold-gradient text-gold-foreground h-11 rounded-xl px-5 shadow-lg shadow-gold/10"
    >
      <Bot className="size-4" />
      Ask AI
    </Button>
  );
}
