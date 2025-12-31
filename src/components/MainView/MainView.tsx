import React from 'react';

import { TouchButton } from '../TouchButton/TouchButton';

import styles from './MainView.module.css'
import { useWakeLock } from '../../hooks/useWakeLock';
import { useBeep } from '../../hooks/useBeep';
import { useVibrate } from '../../hooks/useVibrate';
import { WordPanel } from '../WordPanel/WordPanel';
import { words } from '../../generated/words';

function MainView() {
  const [nextBeep, setNextBeep] = React.useState(0)
  const [wordIndex, setWordIndex] = React.useState(0)
  
  const factor = React.useRef<number>(0)

  const nextBeepRef = React.useRef<ReturnType<typeof setTimeout>>(null)
  const beepRef = React.useRef<ReturnType<typeof useBeep>>(null)
  const buzzRef = React.useRef<ReturnType<typeof useBeep>>(null)
  const vibrate = React.useRef<ReturnType<typeof useVibrate>>(null)

  const isPlaying = nextBeep > 100

  useWakeLock()

  beepRef.current = useBeep()
  buzzRef.current = useBeep()
  vibrate.current = useVibrate()

  const word = React.useMemo(() => words[wordIndex], [wordIndex])

  const start = async () => {
    const context = new AudioContext()

    beepRef.current?.initBeep(context)
    buzzRef.current?.initBeep(context, 100, 'sawtooth')

    setNextBeep(1500)

    factor.current = 0.945 + Math.random() * 0.03
  }

  const stop = () => {
    setNextBeep(0)

    if (nextBeepRef.current) {
      clearTimeout(nextBeepRef.current)
    }
  }

  const skip = () => {
    setWordIndex(currentIndex => currentIndex + 1)
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
      nextBeepRef.current = setTimeout(() => beep(), nextBeep)
    }
    else if (nextBeep) {
      buzz()
      beepRef.current?.destroy()
    }
  }, [nextBeep, beep, buzz, isPlaying])

  React.useEffect(() => {
    if (isPlaying)
    {
      document.body.classList.add('playing')
    } else {
      document.body.classList.remove('playing')
    }
  }, [isPlaying])

  React.useEffect(() => {
    const wordIndex = localStorage.getItem("wordIndex")
    console.log('loaded word index', wordIndex)
    setWordIndex(wordIndex ? Number.parseInt(wordIndex) : 0)
  }, [])

  React.useEffect(() => {
    if (wordIndex > 0) {
      window.localStorage.setItem("wordIndex", `${wordIndex}`)
    }
  }, [wordIndex])

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

      <WordPanel
        disabled={!isPlaying}
        word={word}/>

      <TouchButton
        disabled={!isPlaying}
        label="Next"
        onPress={() => skip()}
        theme={{
          button: styles.nextButton,
          pressing: styles.nextButtonPressed
        }}
      />
    </div>
  );
}

export default MainView;
