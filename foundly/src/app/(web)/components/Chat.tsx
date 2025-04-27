"use client";

import { STEPS } from "@/lib/constants";
import Image from "next/image";
import { useChat } from "../hooks/useChat";
import LoadingMessage from "./LoadingMessage";
import Progress from "./Progress";

interface Props {
  flow: "lost" | "found";
}

export default function Chat(props: Props) {
  const { flow } = props;
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

  //TODO: add proper handling of abusive request

  const isInputDisabled =
    isLoading || input.trim() === "" || currentStep === STEPS.COMPLETE;

  if (inappropriateCounter > 2) {
    return (
      <div className="flex justify-center items-center px-4 py-2  text-black font-bold text-4xl">
        GOODBYE
      </div>
    );
  }

  return (
    <div className="rounded-2xl flex h-3/4 w-2/3 bg-amber-50 justify-center items-center">
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

        <Progress currentStep={currentStep} />

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
          {isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>

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
              disabled={currentStep === STEPS.COMPLETE || isLoading}
            />

            <div className="flex justify-center items-center space-x-2">
              <div className="text-gray-400">{input.length}/100</div>

              <button
                onClick={sendMessage}
                disabled={isInputDisabled}
                className="p-2 bg-mtaGreenLine text-black rounded-full hover:bg-amber-400 disabled:opacity-50"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
