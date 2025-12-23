import React from 'react'

export function useBeep() {
  const contextRef = React.useRef<AudioContext>(null)
  const oscillatorGainRef = React.useRef<GainNode>(null)
  const oscillatorRef = React.useRef<OscillatorNode>(null)

  const initBeep = React.useCallback((
    context: AudioContext, 
    frequency: number = 1000,
    type: OscillatorType = 'sine'
  ) => {
    contextRef.current = context

    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0, context.currentTime);
    
    const oscillator = context.createOscillator()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, context.currentTime)
    oscillator.connect(gainNode)
    oscillator.start()

    oscillatorGainRef.current = gainNode
    oscillatorRef.current = oscillator
  }, [])

  const destroy = React.useCallback(() => {
    oscillatorRef.current?.stop()
    oscillatorRef.current = null
    oscillatorGainRef.current = null
  }, [])

  const beepStart = React.useCallback(() => {
    if (!contextRef.current) {
      return
    }
    oscillatorGainRef.current?.gain.linearRampToValueAtTime(1, contextRef.current?.currentTime + 0.05)
  }, [])

  const beepStop = React.useCallback(() => {
    if (!contextRef.current) {
      return
    }
    oscillatorGainRef.current?.gain.linearRampToValueAtTime(0, contextRef.current?.currentTime + 0.05)
  }, [])

  return { initBeep, destroy, beepStart, beepStop }
}