// hooks/useChat.ts
import { STEPS } from "@/lib/constants";
import { useCallback, useEffect, useRef, useState } from "react";

export type Message = {
  role: string;
  content: string;
};

export type ChatState = {
  messages: Message[];
  input: string;
  threadId: string | null;
  isLoading: boolean;
  currentStep: STEPS;
  inappropriateCounter: number;
};

export function useChat(flow: "lost" | "found") {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    input: "",
    threadId: null,
    isLoading: false,
    currentStep: STEPS.WHAT,
    inappropriateCounter: 0,
  });

  const mapper = {
    lost: "lost_item",
    found: "found_item",
  };

  const { messages, input, threadId } = chatState;

  useEffect(() => {
    const init = async () => {
      await callChatAPI(`Initialize ${flow} item report`);
    };

    init();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const callChatAPI = useCallback(
    async (message: string, userMessage?: Message) => {
      setChatState((prev) => ({
        ...prev,
        isLoading: true,
        messages: userMessage ? [...prev.messages, userMessage] : prev.messages,
        input: userMessage ? "" : prev.input,
      }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            context: {
              flow: mapper[flow],
              threadId,
            },
          }),
        });

        if (!response.ok)
          throw new Error("Failed to communicate with chat API");

        const data = await response.json();

        if (data.isInappropriate) {
          setChatState((prev) => ({
            ...prev,
            isLoading: false,
            inappropriateCounter: prev.inappropriateCounter + 1,
            messages: [
              ...prev.messages,
              {
                role: "assistant",
                content: "Please refrain from using inappropriate language.",
              },
            ],
          }));

          return data;
        }

        const aiMessage = {
          role: "assistant",
          content: data.message,
        };

        setChatState((prev) => ({
          ...prev,
          threadId: data.context?.threadId || prev.threadId,
          isLoading: false,
          currentStep: data.step.toUpperCase(),
          messages: [...prev.messages, aiMessage],
        }));

        return data;
      } catch (error) {
        console.error("Error in chat API:", error);

        setChatState((prev) => ({
          ...prev,
          isLoading: false,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content:
                "Sorry, I'm having trouble connecting. Please try again later.",
            },
          ],
        }));

        return null;
      }
    },
    [flow, threadId]
  );

  const sendMessage = useCallback(async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: input };

    await callChatAPI(input, userMessage);
  }, [input, callChatAPI]);

  const updateInput = useCallback((newInput: string) => {
    setChatState((prev) => ({ ...prev, input: newInput }));
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return {
    chatState,
    messagesEndRef,
    sendMessage,
    updateInput,
    handleKeyPress,
  };
}
