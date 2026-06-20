(() => {
  const measurementId = 'G-L8HEPHK5EG'
  const productionHosts = new Set([
    'ahmedsayed.app',
    'www.ahmedsayed.app',
    'ahedgithu.github.io'
  ])

  if (!productionHosts.has(window.location.hostname)) return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: true,
    anonymize_ip: true
  })

  const tag = document.createElement('script')
  tag.async = true
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.append(tag)

  const sendEvent = (name, parameters = {}) => {
    window.gtag('event', name, parameters)
  }

  const getTopicLabel = (element) => {
    const topic = element.closest('.topic-item')
    return topic?.querySelector('.topic-item__title, h3, h4')?.textContent?.trim() || 'unknown'
  }

  document.addEventListener('click', (event) => {
    const audioDownload = event.target.closest('.lecture-record-player__download')
    if (audioDownload) {
      sendEvent('audio_download', {
        topic: getTopicLabel(audioDownload)
      })
      return
    }

    const quizButton = event.target.closest('[data-quiz-topic]')
    if (quizButton) {
      sendEvent('mcq_start', {
        topic: quizButton.dataset.quizTopic || 'unknown'
      })
      return
    }

    const recordButton = event.target.closest('[data-record-toggle]')
    if (recordButton) {
      sendEvent('audio_player_open', {
        topic: getTopicLabel(recordButton)
      })
      return
    }

    const resourceLink = event.target.closest('a.topic-resource')
    if (!resourceLink) return

    const resourceType = [...resourceLink.classList]
      .find((className) => className.startsWith('topic-resource--'))
      ?.replace('topic-resource--', '') || 'other'

    let linkDomain = 'internal'
    try {
      linkDomain = new URL(resourceLink.href, window.location.href).hostname || 'internal'
    } catch {
      // Keep the safe fallback for malformed or relative links.
    }

    sendEvent('resource_open', {
      topic: getTopicLabel(resourceLink),
      resource_type: resourceType,
      link_domain: linkDomain
    })
  }, true)

  document.addEventListener('play', (event) => {
    if (!(event.target instanceof HTMLAudioElement)) return
    const player = event.target.closest('[data-record-player]')
    sendEvent('audio_play', {
      topic: player ? getTopicLabel(player) : 'unknown'
    })
  }, true)
})()
