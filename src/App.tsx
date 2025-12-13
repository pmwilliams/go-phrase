import React from 'react';

import './App.css';
import { getWord } from './words';

function App() {
  const [word, setWord] = React.useState("")
  const [showWord, setShowWord] = React.useState(false)
  const [nextBeep, setNextBeep] = React.useState(0)
  const audioContextRef = React.useRef<AudioContext | undefined>(undefined)
  const oscillatorGainRef = React.useRef<GainNode | undefined>(undefined)
  const buzzerGainRef = React.useRef<GainNode | undefined>(undefined)
  const factor = React.useRef<number>(0)
  const wakeLock = React.useRef<WakeLockSentinel>(null)

  const isPlaying = nextBeep > 100

  React.useEffect(() => {
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen")
        .then((wakeLockSentinel) => wakeLock.current = wakeLockSentinel);
    }
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release().then(() => {
          wakeLock.current = null;
        });
      }
    }   
  }, [])

  const start = async () => {
    const context = new AudioContext()

    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0, context.currentTime);
    
    const oscillator = context.createOscillator()

    oscillator.frequency.setValueAtTime(1000, context.currentTime)
    oscillator.connect(gainNode)
    oscillator.start()

    const buzzerGainNode = context.createGain();
    buzzerGainNode.connect(context.destination);
    buzzerGainNode.gain.setValueAtTime(0, context.currentTime);
    
    const buzzer = context.createOscillator()

    buzzer.frequency.setValueAtTime(100, context.currentTime)
    buzzer.type = "sawtooth"
    buzzer.connect(buzzerGainNode)
    buzzer.start()

    setNextBeep(1500)

    audioContextRef.current = context
    oscillatorGainRef.current = gainNode
    buzzerGainRef.current = buzzerGainNode

    factor.current = 0.945 + Math.random() * 0.03

    setWord(getWord())
  }

  const stop = () => {
    setNextBeep(0)
  }

  const reveal = () => {
    setShowWord(true)

    setTimeout(() => setShowWord(false), 2000)
  }

  const skip = () => {
    setWord(getWord())
    reveal()
  }

  const beep = React.useCallback(() => {
    const context = audioContextRef.current

    if (!context) {
      return
    }
    
    oscillatorGainRef.current?.gain.linearRampToValueAtTime(1, context.currentTime + 0.05)

    setTimeout(() => {
      oscillatorGainRef.current?.gain.linearRampToValueAtTime(0, context.currentTime + 0.05)
      setNextBeep(currentBeep => currentBeep * factor.current)
    }, 100)
  }, [setNextBeep])

  const buzz = React.useCallback(() => {
    const context = audioContextRef.current

    if (!context) {
      return
    }
    
    buzzerGainRef.current?.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.05)

    setNextBeep(0)
    navigator.vibrate(1500);

    setTimeout(() => {
      buzzerGainRef.current?.gain.linearRampToValueAtTime(0, context.currentTime + 0.05)
    }, 1500)
  }, [])

  React.useEffect(() => {
    if (isPlaying)
    {
      setTimeout(() => beep(), nextBeep)
    }
    else if (nextBeep) {
      buzz()
    }
  }, [nextBeep, beep, buzz, isPlaying])

  return (
    <div className="App">
      <button
        className={isPlaying ? 'stop-button' : 'start-button'}
        onClick={() => isPlaying ? stop() : start()}
      >
          {isPlaying ? 'STOP' : 'START'}
      </button>

      <div className="action-buttons">
        <button
          className="action-button"
          disabled={!isPlaying}
          onClick={() => skip()}
        >
          Next
        </button>
      </div>

      <div 
        className={showWord ? 'word' : 'word-hidden'}
        onClick={() => reveal()}
      >
        {word}
      </div>
    </div>
  );
}

export default App;
