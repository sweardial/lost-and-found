"use client";

import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Chat from "./components/Chat"; // Import the Chat component

export default function Home() {
  // const router = useRouter();

  const [action, setAction] = useState<null | "login" | "lost" | "found">();

  const handleLogin = () => {
    setAction((prev) => {
      if (prev === "lost") {
        return null;
      }

      if (prev === "found") {
        return null;
      }

      return "login";
    });
  };

  const actionButtonText = () => {
    if (action === "lost") {
      return <ArrowBackIcon className="text-black mr-15" />;
    }

    if (action === "found") {
      return <ArrowForwardIcon className="text-black ml-15" />;
    }

    return "LOG IN";
  };

  const handleLost = useCallback(() => {
    setAction("lost");
  }, []);

  const handleFound = useCallback(() => {
    setAction("found");
  }, []);

  console.log({ action });

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <motion.div
        className="flex flex-1 flex-row items-center justify-center bg-red-400 group cursor-pointer relative"
        onClick={handleLost}
        animate={
          action === "lost"
            ? { width: "50%", x: "100%" }
            : { width: "50%", x: 0 }
        }
        transition={{ duration: 0.6 }}
      >
        <span className="transform transition-transform duration-300 group-hover:scale-200 text-black text-1xl font-bold pr-8 border-l-0">
          I LOST SOMETHING
        </span>
        {action === "lost" && (
          <motion.div className="absolute top-0 left-[-99%] h-full w-full flex flex-1 flex-row items-center justify-center bg-red-400">
            <div className="rounded-2xl flex h-3/4 w-2/3 bg-amber-50 justify-center items-center">
              <Chat flow="lost" />
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        animate={
          action === "lost"
            ? { x: "50vw" }
            : action == "found"
            ? { x: "-50vw" }
            : { x: 0 }
        }
        transition={{ duration: 0.6 }}
      >
        <div
          onClick={handleLogin}
          className="cursor-pointer flex justify-center items-center border-zinc-900 border-2 rounded-full h-40 w-40 bg-amber-300 hover:bg-amber-500"
        >
          {actionButtonText()}
        </div>
      </motion.div>

      <motion.div
        onClick={handleFound}
        className="cursor-pointer flex flex-row flex-1 items-center justify-center bg-blue-500 group"
        animate={
          action === "found"
            ? { width: "50%", x: "-100%" }
            : { width: "50%", x: 0 }
        }
        transition={{ duration: 0.6 }}
      >
        <span className="transform transition-transform duration-300 group-hover:scale-200 text-black text-1xl font-bold">
          I FOUND SOMETHING
        </span>
        {action === "found" && (
          <motion.div className="absolute top-0 right-[-99%] h-full w-full flex flex-1 flex-row items-center justify-center bg-blue-500">
            <div className="rounded-2xl flex h-3/4 w-2/3 bg-amber-50 justify-center items-center">
              <Chat flow="found" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
