import React from "react";

export function useVibrate() {
  const forDuration = React.useCallback((duration: number) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  }, [])
  
  return {
    forDuration
  }
}