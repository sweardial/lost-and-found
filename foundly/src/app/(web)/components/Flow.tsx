"use client";
import React from "react";
import Chat from "./Chat";
import EmailVerification from "./EmailVerification";
import CodeVerification from "./CodeVerification";
import { useVerification } from "../contexts/VerificationContext";

interface Props {
  flow: "lost" | "found";
}
export default function Flow(props: Props) {
  const { flow } = props;
  const { isVerified, email } = useVerification();

  if (isVerified) {
    return <Chat flow={flow} />;
  }

  if (email) {
    return <CodeVerification />;
  }

  return <EmailVerification />;
}
