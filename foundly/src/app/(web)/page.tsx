"use client";

import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Chat from "./components/Chat"; // Import the Chat component
import Flow from "./components/Flow";

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

    return <h1 className="text-black font-bold text-3xl">LOGIN</h1>;
  };

  const handleLost = useCallback(() => {
    setAction("lost");
  }, []);

  const handleFound = useCallback(() => {
    setAction("found");
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-mtaYellowLine">
      <motion.div
        className={`flex flex-1 flex-row items-center justify-center bg-white group cursor-${
          action ? "default" : "pointer"
        } relative`}
        onClick={handleLost}
        animate={
          action === "lost"
            ? { width: "50%", x: "100%" }
            : { width: "50%", x: 0 }
        }
        transition={{ duration: 0.5 }}
      >
        <span className="transform transition-transform duration-300 group-hover:scale-200 text-mtaBlue text-1xl font-bold pr-8 border-l-0">
          LOST
        </span>
        {action === "lost" && (
          <motion.div className="absolute top-0 left-[-99%] h-full w-full flex flex-1 flex-row items-center justify-center bg-mtaYellowLine">
            <Flow flow="lost" />
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
        transition={{ duration: 0.5 }}
      >
        <div
          onClick={handleLogin}
          className="cursor-pointer flex justify-center items-center border-zinc-900 border-2 rounded-full h-40 w-40 bg-mtaYellowLine hover:bg-mtaOrangeLine"
        >
          {actionButtonText()}
        </div>
      </motion.div>

      <motion.div
        onClick={handleFound}
        className={`cursor-${
          action ? "default" : "pointer"
        } flex flex-row flex-1 items-center justify-center bg-mtaBlue group`}
        animate={
          action === "found"
            ? { width: "50%", x: "-100%" }
            : { width: "50%", x: 0 }
        }
        transition={{ duration: 0.5 }}
      >
        <span className="transform transition-transform duration-300 group-hover:scale-200 text-white text-1xl font-bold">
          FOUND
        </span>
        {action === "found" && (
          <motion.div className="absolute top-0 right-[-99%] h-full w-full flex flex-1 flex-row items-center justify-center bg-mtaYellowLine">
            <Flow flow="found" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
