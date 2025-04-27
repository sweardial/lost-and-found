"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import React from "react";
import Button from "./Button";

interface Props {
  onComplete: (email: string) => void;
}

export default function EmailVerification(props: Props) {
  const { onComplete } = props;

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onEmailSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to send verification code"
        );
      }

      onComplete(email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, onComplete]);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const isEmailValid = email.length > 0 && emailRegex.test(email);

  return (
    <div className="flex flex-col cursor-default justify-center items-center h-50 w-100 bg-amber-100 rounded-2xl">
      <div>
        <Image
          src="/mta_logo.png"
          alt="MTA Logo"
          width={25}
          height={25}
          priority
          className="pb-4"
        />
      </div>
      <p>Enter your email</p>
      <div className="flex justify-between w-full px-5 py-3 space-x-2">
        <input
          className="py-2 px-2 border-2 rounded-2xl flex-grow-[2] "
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="confirm"
          text="Continue"
          onClick={onEmailSubmit}
          isDisabled={!isEmailValid}
          isLoading={isLoading}
        />
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
