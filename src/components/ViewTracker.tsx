'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
  tourId: string
  ownerId: string
}

export function ViewTracker({ tourId, ownerId }: ViewTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    let sessionId = sessionStorage.getItem('tour_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('tour_session_id', sessionId)
    }

    // Fire and forget view tracking
    fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tourId, ownerId, sessionId }),
      keepalive: true, // Fire and forget safely
    }).catch(err => {
      // Silently swallow tracking errors to not disrupt user experience
      console.warn('[ViewTracker] Failed to record view:', err)
    })
  }, [tourId, ownerId])

  return null
}
