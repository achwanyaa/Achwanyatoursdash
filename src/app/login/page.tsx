'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email — we sent you a sign-in link.'
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send login link'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Wordmark */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#C9A84C] tracking-tight">Achwanya 3D Tours</h1>
        </div>

        <Card className="bg-[#141414] border-[#1E1E1E]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-serif text-[#E8E3D9]">Welcome back.</CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Enter your email to receive a sign-in link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message?.type === 'success' ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <p className="text-green-400 font-medium">{message.text}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full border-[#1E1E1E] text-[#E8E3D9] hover:bg-[#1E1E1E]"
                  onClick={() => setMessage(null)}
                >
                  Try another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#0A0A0A] border-[#1E1E1E] text-[#E8E3D9] placeholder:text-gray-600 focus:border-[#C9A84C] focus:ring-[#C9A84C]"
                  />
                </div>
                {message?.type === 'error' && (
                  <p className="text-red-400 text-sm">{message.text}</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-[#C9A84C] hover:bg-[#B39543] text-[#0A0A0A] font-semibold transition-colors"
                  disabled={loading || !email}
                >
                  {loading ? 'Sending link...' : 'Send Link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
