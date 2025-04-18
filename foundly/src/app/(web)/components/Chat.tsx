"use client";

import Image from "next/image";
import { useChat } from "../hooks/useChat";
import { STEPS } from "@/lib/constants";

export default function Chat({ flow }: { flow: "lost" | "found" }) {
  const {
    chatState: {
      messages,
      input,
      isLoading,
      currentStep,
      inappropriateCounter,
    },
    messagesEndRef,
    sendMessage,
    updateInput,
    handleKeyPress,
  } = useChat(flow);

  const renderProgress = () => {
    const steps = [
      STEPS.WHAT,
      STEPS.WHERE,
      STEPS.WHEN,
      STEPS.CONFIRM,
      STEPS.EMAIL,
      STEPS.COMPLETE,
    ];

    const currentIndex = steps.indexOf(currentStep || STEPS.WHAT);

    return (
      <div className="flex justify-between px-4 py-2 bg-gray-100">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex flex-col items-center ${
              index <= currentIndex ? "text-mtaBlueLine" : "text-gray-400"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                index < currentIndex || currentIndex == steps.length - 1
                  ? "bg-mtaGreenLine text-white"
                  : index === currentIndex
                  ? "bg-mtaBlueLine text-white"
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

  //TODO: add proper handling of abusive request

  if (inappropriateCounter > 2) {
    return (
      <div className="flex justify-center items-center px-4 py-2  text-black font-bold text-4xl">
        GOODBYE
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden">
      <div className="bg-mtaGreenLine p-4 border-b flex justify-center items-center">
        <Image
          src="/mta_logo.png"
          alt="MTA Logo"
          width={25}
          height={25}
          priority
        />
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
            onChange={(e) => updateInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            maxLength={100}
            className="flex-1 rounded-lg resize-none p-2 focus:outline-none focus:ring-2 focus:ring-mtaGreenLine placeholder:text-gray-400 text-gray-800"
            rows={1}
            disabled={currentStep === STEPS.COMPLETE}
          />

          <div className="flex justify-center items-center space-x-2">
            <div className="text-gray-400">{input.length}/100</div>

            <button
              onClick={sendMessage}
              disabled={
                isLoading ||
                input.trim() === "" ||
                currentStep === STEPS.COMPLETE
              }
              className="p-2 bg-mtaGreenLine text-black rounded-full hover:bg-amber-400 disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
