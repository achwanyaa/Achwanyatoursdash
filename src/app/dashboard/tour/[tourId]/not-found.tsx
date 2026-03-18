import Link from 'next/link'

export default function TourNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">🏠</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Tour not found or no longer active
      </h1>
      <p className="text-gray-600 mb-6 max-w-md">
        The tour you&apos;re looking for may have been removed, expired, or you don&apos;t have access to it.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  )
}
