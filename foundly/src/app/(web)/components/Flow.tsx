"use client";
import { useState } from "react";
import React from "react";
import Chat from "./Chat";
import EmailVerification from "./EmailVerification";
import CodeVerification from "./CodeVerification";

interface Props {
  flow: "lost" | "found";
}
export default function Flow(props: Props) {
  const { flow } = props;

  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");

  if (isVerified) {
    return <Chat flow={flow} />;
  }

  if (email) {
    return (
      <CodeVerification email={email} onComplete={() => setIsVerified(true)} />
    );
  }

  return (
    <EmailVerification
      onComplete={(email) => {
        setEmail(email);
      }}
    />
  );
}
