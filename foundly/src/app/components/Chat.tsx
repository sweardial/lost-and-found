"use client";

import { useCallback, useEffect, useRef, useState } from "react";

enum STAGES {
  WHAT = "WHAT",
  WHEN = "WHEN",
  WHERE = "WHERE",
  CONFIRM = "CONFIRM",
  COMPLETE = "COMPLETE",
}

type message = {
  role: string;
  content: string;
};

export default function Chat({ flow }: { flow: "lost" | "found" }) {
  const isInitialized = useRef(false);
  const messagesEndRef = useRef<any>(null);

  const [{ messages, input, threadId, isLoading, currentStep }, setChatState] =
    useState<{
      messages: message[];
      input: string;
      threadId: string | null;
      isLoading: boolean;
      currentStep: STAGES | null;
    }>({
      messages: [],
      input: "",
      threadId: null,
      isLoading: false,
      currentStep: null,
    });

  useEffect(() => {
    //to prevent double rendering due to React.Strict Mode
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    const initialization = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Initialize ${flow} item report`,
            context: { flow },
          }),
        });

        if (!response.ok) throw new Error("Failed to initiate chat");

        const data = await response.json();

        console.log({ data });

        setChatState((prev) => ({
          ...prev,
          threadId: data.context.threadId,
          isLoading: false,
          currentStep: data.step,
          messages: [
            ...prev.messages,
            { role: "assistant", content: data.message },
          ],
        }));
      } catch (error) {
        console.error("Error initiating chat:", error);
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
      }
    };

    initialization();
  }, []);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: input };
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      input: "",
      isLoading: true,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          context: {
            flow,
            threadId,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.message,
      };

      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, aiMessage],
        currentStep: data.step,
      }));
    } catch (error) {
      console.error("Error sending message:", error);

      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [
          ...prev.messages,
          {
            role: "assistant",
            content: "Sorry, I'm having trouble connecting. Please try again.",
          },
        ],
      }));
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderProgress = () => {
    const stages = [
      STAGES.WHAT,
      STAGES.WHERE,
      STAGES.WHEN,
      STAGES.CONFIRM,
      STAGES.COMPLETE,
    ];

    const currentIndex = stages.indexOf(currentStep || STAGES.WHAT);

    return (
      <div className="flex justify-between px-4 py-2 bg-amber-100">
        {stages.map((step, index) => (
          <div
            key={step}
            className={`flex flex-col items-center ${
              index <= currentIndex ? "text-amber-800" : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                index < currentIndex || currentIndex == stages.length - 1
                  ? "bg-green-500 text-white"
                  : index === currentIndex
                  ? "bg-amber-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-1">{step}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden">
      <div className="bg-amber-300 p-4 border-b">
        <h2 className="text-lg text-black font-semibold">
          {flow === "lost" ? "Report a Lost Item" : "Report a Found Item"}
        </h2>
      </div>

      {/* Progress indicator */}
      {renderProgress()}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "assistant"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-blue-500 text-white"
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) =>
              setChatState((prev) => ({ ...prev, input: e.target.value }))
            }
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            maxLength={100}
            className="flex-1 rounded-lg resize-none p-2 focus:outline-none focus:ring-2 focus:ring-amber-300 placeholder:text-gray-400 text-gray-800"
            rows={1}
            disabled={currentStep === STAGES.COMPLETE}
          />

          <div className="flex justify-center items-center space-x-2">
            <div className=" text-gray-400">{input.length}/100</div>

            <button
              onClick={sendMessage}
              disabled={
                isLoading ||
                input.trim() === "" ||
                currentStep === STAGES.COMPLETE
              }
              className="p-2 bg-amber-300 text-black rounded-full hover:bg-amber-400 disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
