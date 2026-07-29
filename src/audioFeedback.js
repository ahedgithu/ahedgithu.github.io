export function soundPackAllowsPlayback(packId) {
  return Boolean(packId && packId !== 'muted')
}

export function stopExclusiveAudioPlayback(state) {
  if (!state) return
  state.playbackId = (Number(state.playbackId) || 0) + 1
  const activeAudio = state.active
  if (!activeAudio) return

  activeAudio.pause()
  activeAudio.currentTime = 0
  state.active = null
}

export function playExclusiveAudioPlayback(state, audio) {
  if (!state || !audio) return Promise.resolve(false)

  stopExclusiveAudioPlayback(state)
  const playbackId = state.playbackId
  audio.currentTime = 0
  state.active = audio
  audio.onended = () => {
    if (state.active === audio && state.playbackId === playbackId) {
      state.active = null
    }
  }

  return Promise.resolve(audio.play())
    .then(() => true)
    .catch(() => {
      if (state.active === audio && state.playbackId === playbackId) {
        state.active = null
      }
      return false
    })
}
