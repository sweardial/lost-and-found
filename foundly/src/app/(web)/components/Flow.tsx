"use client";
import { useState } from "react";
import React from "react";
import Chat from "./Chat";
import EmailVerification from "./EmailVerification";

interface Props {
  flow: "lost" | "found";
}
export default function Flow(props: Props) {
  const { flow } = props;

  const [isVerified, setIsVerified] = useState(false);

  if (isVerified) {
    return <Chat flow={flow} />;
  }

  return <EmailVerification onComplete={() => setIsVerified(true)} />;
}
