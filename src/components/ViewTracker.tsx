'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  tourId: string
}

export function ViewTracker({ tourId }: ViewTrackerProps) {
  useEffect(() => {
    const sessionId = crypto.randomUUID()

    fetch(`/api/tours/${tourId}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    }).catch(() => {
      // Non-critical — silently fail
    })
  }, [tourId])

  return null
}
