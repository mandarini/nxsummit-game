import { useState, useEffect } from "react";

interface LoginLimiterState {
  failedAttempts: number;
  disableLogin: boolean;
  disableTimer: number;
  setFailedAttempts: (attempts: number) => void;
  resetLoginState: () => void;
}

export function useLoginLimiter(
  maxAttempts: number = 3,
  disableDuration: number = 30
): LoginLimiterState {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [disableLogin, setDisableLogin] = useState(false);
  const [disableTimer, setDisableTimer] = useState(0);

  useEffect(() => {
    if (disableLogin && disableTimer > 0) {
      const timerId = setTimeout(() => {
        setDisableTimer((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    } else if (disableTimer === 0) {
      setDisableLogin(false);
      setFailedAttempts(0);
    }
  }, [disableLogin, disableTimer]);

  const resetLoginState = () => {
    if (failedAttempts >= maxAttempts) {
      setDisableLogin(true);
      setDisableTimer(disableDuration);
    }
  };

  return {
    failedAttempts,
    disableLogin,
    disableTimer,
    setFailedAttempts,
    resetLoginState,
  };
}
