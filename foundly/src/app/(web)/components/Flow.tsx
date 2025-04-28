"use client";
import React, { Suspense } from "react";
import Chat from "./Chat";
import EmailVerification from "./EmailVerification";
import CodeVerification from "./CodeVerification";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../loading";
import { Spinner } from "./Spinner";

interface Props {
  flow: "lost" | "found";
}

export default function Flow(props: Props) {
  const { flow } = props;
  const { isLoading, userId, isVerified } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (isVerified) {
    return <Chat flow={flow} />;
  }

  if (userId) {
    return <CodeVerification />;
  }

  return <EmailVerification />;
}
