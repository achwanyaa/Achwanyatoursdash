'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface TourViewerProps {
  realseeUrl: string
  tourId: string
  propertyTitle: string
}

export function TourViewer({ realseeUrl, tourId, propertyTitle }: TourViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLeadCapture(true)
    }, 30000) // Show lead capture after 30 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 200px)' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading 3D Tour...</p>
          </div>
        </div>
      )}

      {/* Realsee iframe */}
      <iframe
        src={realseeUrl}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        title={`3D Tour: ${propertyTitle}`}
        allow="vr; xr; accelerometer; magnetometer; gyroscope; ambient-light-sensor"
        allowFullScreen
      />

      {/* Floating controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLeadCapture(true)}
          className="bg-white/90 backdrop-blur-sm"
        >
          Request Info
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(`https://wa.me/?text=I'm interested in: ${propertyTitle}`, '_blank')}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          WhatsApp
        </Button>
      </div>

      {/* Lead capture modal */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Request Information - {propertyTitle}
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+254 7XX XXX XXX"
                  type="tel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  defaultValue={`I'm interested in ${propertyTitle}`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLeadCapture(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Send Request
                </Button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              You'll receive an instant WhatsApp confirmation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
