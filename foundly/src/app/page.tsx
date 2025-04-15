"use client";

import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const router = useRouter();

  const [action, setAction] = useState<null | "login" | "lost" | "found">();

  const handleLogin = () => {
    setAction("login");
    router.push("/login");
  };

  const handleLost = () => {
    setAction("lost");
    router.push("/lost");
  };

  const handleFound = () => {
    setAction("found");
    router.push("found");
  };

  return (
    <div className="flex h-screen w-screen">
      <div
        className="flex flex-1 flex-row items-center justify-center bg-red-400 group border-r-black border-r-1 cursor-pointer"
        onClick={handleLost}
      >
        <span className="transform transition-transform duration-300 group-hover:scale-200 text-black text-1xl font-bold">
          {" "}
          I LOST SOMETHING
        </span>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div
          onClick={handleLogin}
          className="cursor-pointer flex justify-center items-center border-zinc-900 border-2 rounded-full h-40 w-40 bg-amber-300 hover:bg-amber-500"
        >
          LOG IN
        </div>
      </div>
      <div
        onClick={handleFound}
        className="cursor-pointer flex flex-row flex-1 items-center justify-center align-middle bg-blue-500 group  border-l-black border-l-1"
      >
        <span className="transform transition-transform duration-300 group-hover:scale-200 text-black text-1xl font-bold">
          I FOUND SOMETHING
        </span>
      </div>
      {/* ADD ANIMATION LATER */}
      {/* <motion.div
        className="flex flex-1 flex-row items-center justify-center bg-red-400 group border-r-black border-r-1"
        onClick={handleLost}
        animate={
          action === "lost"
            ? { x: 0, width: "100%" }
            : action === "login"
            ? { x: "-100%" }
            : {}
        }
        transition={{ duration: 0.6 }}
      >
        <span className="text-black text-xl font-bold">I LOST SOMETHING</span>
      </motion.div>

      <motion.div
        className="absolute top-3/7 left-1/2 flex items-center justify-center h-40 w-40 bg-amber-300 rounded-full z-20 cursor-pointer border-2 border-zinc-900"
        onClick={handleLogin}
        initial={{ scale: 1 }}
        animate={action === "login" ? { scale: 30 } : { scale: 1 }}
        transition={{ duration: 1 }}
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {action !== "login" && (
          <span className="text-black font-bold">LOG IN</span>
        )}
      </motion.div>

      <motion.div
        className="flex flex-1 flex-row items-center justify-center bg-blue-500 group border-r-black border-r-1"
        onClick={handleFound}
        animate={
          action === "found"
            ? { x: 0, width: "100%" }
            : action === "login"
            ? { x: "100%" }
            : {}
        }
        transition={{ duration: 0.6 }}
      >
        <span className="text-black text-xl font-bold">I FOUND SOMETHING</span>
      </motion.div> */}
    </div>
  );
}
