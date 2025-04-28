"use client";
import { useState, useEffect, useCallback } from "react";

const RESEND_COOLDOWN_MS = 60_000; // 1 minute
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export function useResendTimer() {
  const [resendAttempts, setResendAttempts] = useState<number[]>([]);
  const [timeUntilNextResend, setTimeUntilNextResend] = useState(0);

  const canResend =
    resendAttempts.length < MAX_RESEND_ATTEMPTS && timeUntilNextResend === 0;

  const addResendAttempt = useCallback(() => {
    const now = Date.now();
    const updatedAttempts = [
      ...resendAttempts.filter((time) => now - time < RESEND_WINDOW_MS),
      now,
    ];
    setResendAttempts(updatedAttempts);
  }, [resendAttempts]);

  useEffect(() => {
    if (resendAttempts.length === 0) return;

    const calculateCooldown = () => {
      const now = Date.now();
      const lastAttempt = Math.max(...resendAttempts);
      const cooldownEnd = lastAttempt + RESEND_COOLDOWN_MS;
      return now < cooldownEnd ? cooldownEnd - now : 0;
    };

    const updateTimer = () => {
      setTimeUntilNextResend(calculateCooldown());
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [resendAttempts]);

  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const validAttempts = resendAttempts.filter(
        (time) => now - time < RESEND_WINDOW_MS
      );
      if (validAttempts.length !== resendAttempts.length) {
        setResendAttempts(validAttempts);
      }
    };
    const interval = setInterval(cleanup, 60_000);
    return () => clearInterval(interval);
  }, [resendAttempts]);

  return {
    canResend,
    addResendAttempt,
    resendAttempts: resendAttempts.length,
    timeUntilNextResend,
  };
}

// const getInitialResendAttempts = () => {
//   if (typeof window !== "undefined") {
//     const storedAttempts = sessionStorage.getItem("resend_attempts");
//     if (storedAttempts) {
//       try {
//         return JSON.parse(storedAttempts);
//       } catch (e) {
//         return [];
//       }
//     }
//   }
//   return [];
// };
// useEffect(() => {
//   const getUserId = async () => {
//     const getUserByIdDB = await cookies();

//     const userId = getUserByIdDB.get("userId")?.value;

//     if (userId) {
//       setUserId(userId);
//     }
//   };

//   getUserId();
// }, [email]);
// const [resendAttempts, setResendAttempts] = useState<number[]>(
//   getInitialResendAttempts
// );
// const [timeUntilNextResend, setTimeUntilNextResend] = useState<number>(0);

// const canResend =
//   resendAttempts.length < MAX_RESEND_ATTEMPTS && timeUntilNextResend === 0;

// const addResendAttempt = useCallback(() => {
//   const now = Date.now();
//   const newAttempts = [
//     ...resendAttempts.filter((time) => now - time < RESEND_WINDOW_MS),
//     now,
//   ];
//   setResendAttempts(newAttempts);

//   if (typeof window !== "undefined") {
//     sessionStorage.setItem("resend_attempts", JSON.stringify(newAttempts));
//   }
// }, [resendAttempts]);

// useEffect(() => {
//   if (resendAttempts.length === 0) return;

//   const calculateTimeUntilNextResend = () => {
//     const now = Date.now();
//     const lastAttempt = Math.max(...resendAttempts);
//     const cooldownEnds = lastAttempt + RESEND_COOLDOWN_MS;

//     return now < cooldownEnds ? cooldownEnds - now : 0;
//   };

//   const updateTimer = () => {
//     setTimeUntilNextResend(calculateTimeUntilNextResend());
//   };

//   updateTimer();

//   const timer = setInterval(updateTimer, 1000);

//   return () => clearInterval(timer);
// }, [resendAttempts]);

// useEffect(() => {
//   const cleanupOldAttempts = () => {
//     const now = Date.now();
//     const validAttempts = resendAttempts.filter(
//       (time) => now - time < RESEND_WINDOW_MS
//     );

//     if (validAttempts.length !== resendAttempts.length) {
//       setResendAttempts(validAttempts);

//       if (typeof window !== "undefined") {
//         sessionStorage.setItem(
//           "resend_attempts",
//           JSON.stringify(validAttempts)
//         );
//       }
//     }
//   };

//   const cleanup = setInterval(cleanupOldAttempts, 60000);

//   return () => clearInterval(cleanup);
// }, [resendAttempts]);
