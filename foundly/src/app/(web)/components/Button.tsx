"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  type: "confirm" | "cancel";
  isDisabled?: boolean;
  text: string;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

const buttonStyles = {
  confirm: "bg-mtaBlue text-white hover:bg-mtaBlueDark rounded-2xl",
  cancel: "bg-gray-300 hover:bg-gray-400 rounded-2xl",
  disabled: "opacity-50 cursor-not-allowed",
};

export default function Button(props: Props) {
  const { type, isDisabled, onClick, text, className, isLoading } = props;

  const baseStyles = `min-w-[100px] min-h-[50px] cursor-pointer ${buttonStyles[type]}`;

  const combinedStyles = isDisabled
    ? twMerge(baseStyles, buttonStyles.disabled, className)
    : twMerge(baseStyles, className);

  return (
    <div className="min-h-[">
      <button
        className={combinedStyles}
        disabled={isDisabled}
        onClick={onClick}
      >
        {isLoading ? "..." : text}
      </button>
    </div>
  );
}
