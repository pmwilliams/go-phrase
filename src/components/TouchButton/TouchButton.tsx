import React from "react"

import style from './TouchButton.module.css';

import { mergeTheme } from "../../utils/mergeTheme";

const defaultTheme = {
  button: style.button,
  pressing: style.pressing
}

export type TouchButtonProps = {
  disabled?: boolean
  label: string
  onPress?: () => void
  theme?: Partial<typeof defaultTheme>
}

export function TouchButton({
  disabled = false,
  label,
  onPress = () => {},
  theme
}: TouchButtonProps) {
  const mergedTheme = mergeTheme(defaultTheme, theme)

  const [isPressing, setIsPressing] = React.useState(false)

  const timeout = React.useRef<ReturnType<typeof setTimeout>>(null)

  const onDown = () => {
    setIsPressing(true)
    timeout.current = setTimeout(() => {
      onPress()
      setIsPressing(false)
    }, 750)
  }

  const onUp = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
      setIsPressing(false)
    }
  }

  const buttonStyle = [
    mergedTheme.button,
    isPressing ? mergedTheme.pressing : null
  ].join(' ')

  return (
    <button
      className={buttonStyle}
      disabled={disabled}
      onMouseDown={onDown}
      onTouchStart={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchEnd={onUp}
    >
      {label}
    </button>
  )
}