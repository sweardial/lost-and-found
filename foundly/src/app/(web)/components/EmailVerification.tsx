"use client";
import Image from "next/image";
import React from "react";
import Button from "./Button";
import { useVerification } from "../contexts/VerificationContext";

export default function EmailVerification() {
  const { sendVerificationCode, isLoading, error, setEmail } =
    useVerification();

  const [emailInput, setEmailInput] = React.useState("");

  const onEmailSubmit = async () => {
    try {
      await sendVerificationCode(emailInput);
      setEmail(emailInput);
    } catch (err) {}
  };

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = emailInput.length > 0 && emailRegex.test(emailInput);

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
          onChange={(e) => setEmailInput(e.target.value)}
          aria-label="Email address"
        />
        <Button
          type="confirm"
          text="Continue"
          onClick={onEmailSubmit}
          isDisabled={!isEmailValid}
          isLoading={isLoading}
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
