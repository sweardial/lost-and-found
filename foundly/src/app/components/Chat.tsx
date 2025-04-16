"use client";

import { extractJsonFromMessage } from "@/utils/jsonUtils";
import { useCallback, useEffect, useRef, useState } from "react";

// Define the stages
const STAGES = {
  WHAT: "WHAT",
  WHEN: "WHEN",
  WHERE: "WHERE",
  COMPLETE: "COMPLETE",
};

// Define the item data structure
const initialItemData = {
  currentStage: STAGES.WHAT,
  itemDescription: "",
  pictureRequested: false,
  pictures: [],
  date: "",
  location: "",
  complete: false,
};

type message = {
  role: string;
  content: string;
  jsonData?: any;
};

export default function Chat({ flow }: { flow: "lost" | "found" }) {
  const isInitialized = useRef(false);
  const fileInputRef = useRef<any>(null);
  const messagesEndRef = useRef<any>(null);

  const [{ messages, input, threadId, isLoading, itemData }, setChatState] =
    useState<{
      messages: message[];
      input: string;
      threadId: string | null;
      isLoading: boolean;
      itemData: any;
    }>({
      messages: [],
      input: "",
      threadId: null,
      isLoading: false,
      itemData: initialItemData,
    });

  useEffect(() => {
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

        setChatState((prev) => ({
          ...prev,
          threadId: data.context.threadId,
          isLoading: false,
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
      const { jsonData, cleanMessage } = extractJsonFromMessage(data.message);

      const aiMessage = {
        role: "assistant",
        content: cleanMessage,
        jsonData,
      };

      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        messages: [...prev.messages, aiMessage],
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

  // const renderProgress = () => {
  //   const stages = [STAGES.WHAT, STAGES.WHEN, STAGES.WHERE];
  //   const currentIndex = stages.indexOf(itemData.currentStage);

  //   return (
  //     <div className="flex justify-between px-4 py-2 bg-amber-100">
  //       {stages.map((stage, index) => (
  //         <div
  //           key={stage}
  //           className={`flex flex-col items-center ${
  //             index <= currentIndex ? "text-amber-800" : "text-gray-400"
  //           }`}
  //         >
  //           <div
  //             className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
  //               index < currentIndex
  //                 ? "bg-green-500 text-white"
  //                 : index === currentIndex
  //                 ? "bg-amber-500 text-white"
  //                 : "bg-gray-200 text-gray-500"
  //             }`}
  //           >
  //             {index + 1}
  //           </div>
  //           <span className="text-xs mt-1">{stage}</span>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden">
      <div className="bg-amber-300 p-4 border-b">
        <h2 className="text-lg text-black font-semibold">
          {flow === "lost" ? "Report a Lost Item" : "Report a Found Item"}
        </h2>
      </div>

      {/* Progress indicator */}
      {/* {renderProgress()} */}

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
              {/* {message.isImage && message.imageUrl && (
                <div className="mb-2">
                  <Image
                    src={message.imageUrl}
                    width={200}
                    height={200}
                    alt="Uploaded"
                    className="rounded-md object-contain"
                  />
                </div>
              )} */}
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={
              !itemData.pictureRequested &&
              itemData.currentStage !== STAGES.WHAT
            }
            className="p-2 bg-amber-300 text-black rounded-full hover:bg-amber-400 disabled:opacity-50"
            title={
              itemData.pictureRequested
                ? "Upload image"
                : "Image upload available during WHAT stage"
            }
          >
            📷
          </button>
          {/* <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          /> */}
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
            disabled={itemData.complete}
          />

          <div className="flex justify-center items-center space-x-2">
            <div className=" text-gray-400">{input.length}/100</div>

            <button
              onClick={sendMessage}
              disabled={isLoading || input.trim() === "" || itemData.complete}
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
