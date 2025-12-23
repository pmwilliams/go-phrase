import React from 'react'

export function useWakeLock() {
  const wakeLock = React.useRef<WakeLockSentinel>(null)

  React.useEffect(() => {
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen")
        .then((wakeLockSentinel) => {
          wakeLock.current = wakeLockSentinel
          wakeLock.current.addEventListener("release", () => {
            wakeLock.current = null
          });
        });

      document.addEventListener("visibilitychange", async () => {
        if (wakeLock.current !== null && document.visibilityState === "visible") {
          wakeLock.current = await navigator.wakeLock.request("screen");
        }
      });
    }
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release().then(() => {
          wakeLock.current = null;
        });
      }
    }   
  }, [])
}