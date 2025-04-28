"use client";
import Image from "next/image";
import React, { useState } from "react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";

export default function CodeVerification() {
  const { email, verifyCode, isLoading, error } = useAuth();

  const [code, setCode] = useState("");

  const onCodeSubmit = async () => {
    try {
      await verifyCode(code);
    } catch (err) {}
  };

  // const formatTimeRemaining = (ms: number) => {
  //   const seconds = Math.ceil(ms / 1000);
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  // };

  const isCodeValid = code.length === 6 && !isNaN(Number(code));

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
            aria-label="Verification code"
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
        <div
          className="flex justify-center items-center px-4 py-2 text-red-500 font-bold text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <p className="text-center text-gray-500 text-sm mt-2">
          Didn&apos;t receive the code?{" "}
          {/* {canResend ? (
            <span
              onClick={resendCode}
              className="text-mtaBlueLine cursor-pointer"
              role="button"
              tabIndex={0}
            >
              Resend
            </span>
          ) : (
            <span className="text-gray-400">
              {timeUntilNextResend > 0
                ? `Resend available in ${formatTimeRemaining(
                    timeUntilNextResend
                  )}`
                : `Maximum attempts reached (${resendAttempts}/${MAX_RESEND_ATTEMPTS})`}
            </span>
          )} */}
        </p>
      </div>
    </div>
  );
}
