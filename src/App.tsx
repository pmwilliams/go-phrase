import React from 'react';

import './App.css';
import { getWord } from './words';
import { TouchButton } from './components/TouchButton/TouchButton';

import styles from './App.module.css'
import { useWakeLock } from './hooks/useWakeLock';
import { useBeep } from './hooks/useBeep';
import { useVibrate } from './hooks/useVibrate';
import { WordPanel } from './components/WordPanel/WordPanel';

function App() {
  const [word, setWord] = React.useState("word")
  const [nextBeep, setNextBeep] = React.useState(0)
  
  const factor = React.useRef<number>(0)

  const beepRef = React.useRef<ReturnType<typeof useBeep>>(null)
  const buzzRef = React.useRef<ReturnType<typeof useBeep>>(null)
  const vibrate = React.useRef<ReturnType<typeof useVibrate>>(null)

  const isPlaying = nextBeep > 100

  useWakeLock()

  beepRef.current = useBeep()
  buzzRef.current = useBeep()
  vibrate.current = useVibrate()

  const start = async () => {
    const context = new AudioContext()

    beepRef.current?.initBeep(context)
    buzzRef.current?.initBeep(context, 100, 'sawtooth')

    setNextBeep(1500)

    factor.current = 0.945 + Math.random() * 0.03

    setWord(getWord())
  }

  const stop = () => {
    setNextBeep(0)
  }

  const skip = () => {
    setWord(getWord())
  }

  const beep = React.useCallback(() => {
    beepRef.current?.beepStart()

    setTimeout(() => {
      beepRef.current?.beepStop()
      setNextBeep(currentBeep => currentBeep * factor.current)
    }, 100)
  }, [setNextBeep])

  const buzz = React.useCallback(() => {
    buzzRef.current?.beepStart()

    setNextBeep(0)

    vibrate.current?.forDuration(1500)

    setTimeout(() => {
      buzzRef.current?.beepStop()
      buzzRef.current?.destroy()
    }, 1500)
  }, [])

  React.useEffect(() => {
    if (isPlaying)
    {
      setTimeout(() => beep(), nextBeep)
    }
    else if (nextBeep) {
      buzz()
      beepRef.current?.destroy()
    }
  }, [nextBeep, beep, buzz, isPlaying])

  return (
    <div 
      className="App">
      <TouchButton 
        label={isPlaying ? 'Stop' : 'Start'}
        onPress={() => isPlaying ? stop() : start()}
        theme={{
          button: isPlaying ? styles.stopButton : styles.startButton,
          pressing: isPlaying ? styles.stopButtonPressed : styles.startButtonPressed
        }}
      />

      <TouchButton
        disabled={!isPlaying}
        label="Next"
        onPress={() => skip()}
        theme={{
          button: styles.nextButton,
          pressing: styles.nextButtonPressed
        }}
      />

      <WordPanel
        disabled={!isPlaying}
        word={word}/>
    </div>
  );
}

export default App;
