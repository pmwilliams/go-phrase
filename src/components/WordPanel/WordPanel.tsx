import React from "react"

import styles from './WordPanel.module.css'

export type WordPanelProps = {
  disabled?: boolean
  word: string
}

export function WordPanel({
  disabled = false,
  word
}: WordPanelProps) {
  const [showWord, setShowWord] = React.useState(false)

  const revealTimeout = React.useRef<ReturnType<typeof setTimeout>>(null)

  const reveal = () => {
    setShowWord(true)

    revealTimeout.current && clearTimeout(revealTimeout.current)
    revealTimeout.current = setTimeout(() => setShowWord(false), 2000)
  }

  React.useEffect(() => reveal(), [word])

  return (
    <button
      disabled={disabled}
      className={showWord ? styles.word : styles.word + ' ' + styles.hidden}
      onClick={() => reveal()}
    >
      {word}
    </button>
  )
}