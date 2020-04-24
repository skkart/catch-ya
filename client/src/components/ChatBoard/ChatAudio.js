import { useState, useEffect } from 'react'
import soundFile from '../../assets/catch-ya-ping.mp3'

const useAudio = () => {
  const [audio] = useState(new Audio(soundFile))
  const [playing, setPlaying] = useState(false)

  const toggle = () => setPlaying(!playing)

  const play = () => setPlaying(true)

  const stop = () => setPlaying(stop)

  useEffect(() => {
    playing ? audio.play() : audio.pause()
  },
  [playing])

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false))
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false))
    }
  }, [])

  return [playing, toggle, play, stop]
}


export default useAudio