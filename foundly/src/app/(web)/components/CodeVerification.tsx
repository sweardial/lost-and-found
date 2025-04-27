"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import Button from "./Button";

interface Props {
  onComplete: () => void;
  email: string;
}

export default function CodeVerification(props: Props) {
  const { onComplete, email } = props;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCodeSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/verificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }

      onComplete();
    } catch (err) {
      console.log({ err });
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }, [code, email, onComplete]);

  const isCodeValid = code.length == 6 && !isNaN(Number(code));

  return (
    <div>
      <div className="flex p-5 space-y-5 bg-amber-100 flex-col cursor-default justify-center items-center h-auto w-100 rounded-2xl">
        <div>
          <Image
            src="/mta_logo.png"
            alt="MTA Logo"
            width={25}
            height={25}
            priority
          />
        </div>
        <div>
          <p>{`We sent an email with a verification code to ${email}`}</p>
          <br></br>
          <p>Enter it below to confirm your email.</p>
        </div>

        <div className="flex justify-between w-full space-x-2">
          <input
            className="py-2 px-2 border-2 rounded-2xl flex-grow-[2] "
            type="text"
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <Button
            type="confirm"
            text="Continue"
            onClick={onCodeSubmit}
            isDisabled={!isCodeValid}
            isLoading={isLoading}
          />
        </div>
      </div>
      {error && (
        <div className="flex justify-center items-center px-4 py-2 text-red-500 font-bold text-sm">
          {error}
        </div>
      )}
      <div>
        <p className="text-center text-gray-500 text-sm mt-2">
          Didn&apos;t receive the code?{" "}
          <span onClick={() => {}} className="text-mtaBlueLine cursor-pointer">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}
