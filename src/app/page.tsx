import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A3T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Achwanya 3D Tours</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
          <Link href="/auth/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Nairobi's Premier
            <span className="text-orange-500"> 3D Virtual Tour</span> Service
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Transform your property listings with immersive 3D tours. 
            Capture more leads, save time, and close deals faster with cutting-edge virtual tour technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            7-day free trial • No credit card required • 1 property tour
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Achwanya 3D Tours?</h3>
            <p className="text-lg text-gray-600">Built specifically for the Kenyan real estate market</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Professional 3D Tours</h4>
              <p className="text-gray-600">High-quality virtual tours that showcase properties in stunning detail</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">WhatsApp Integration</h4>
              <p className="text-gray-600">Instant lead notifications directly to your WhatsApp</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Real Analytics</h4>
              <p className="text-gray-600">Track views, engagement, and lead conversion in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h3>
            <p className="text-lg text-gray-600">Choose the plan that fits your business</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h4 className="text-xl font-bold mb-2">Trial</h4>
              <p className="text-gray-600 mb-4">Perfect for getting started</p>
              <div className="text-3xl font-bold mb-4">Free</div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 active tour
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 3 bedrooms
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  7 days access
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="text-gray-400 mr-2">✗</span>
                  WhatsApp notifications
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Start Free Trial
              </Button>
            </div>
            
            <div className="bg-orange-500 text-white rounded-lg shadow-lg p-8 border-2 border-orange-500 transform scale-105">
              <div className="bg-white text-orange-500 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h4 className="text-xl font-bold mb-2">Basic</h4>
              <p className="text-orange-100 mb-4">For growing agents</p>
              <div className="text-3xl font-bold mb-4">KSh 18,000<span className="text-lg font-normal">/mo</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  3 active tours
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  Unlimited bedrooms
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  WhatsApp notifications
                </li>
                <li className="flex items-center">
                  <span className="text-white mr-2">✓</span>
                  Basic analytics
                </li>
              </ul>
              <Button className="w-full bg-white text-orange-500 hover:bg-gray-100">
                Get Started
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <h4 className="text-xl font-bold mb-2">Pro</h4>
              <p className="text-gray-600 mb-4">For established agencies</p>
              <div className="text-3xl font-bold mb-4">KSh 35,000<span className="text-lg font-normal">/mo</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  12 active tours
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited bedrooms
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced analytics
                </li>
              </ul>
              <Button className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Property Listings?
          </h3>
          <p className="text-xl text-orange-100 mb-8">
            Join dozens of Nairobi agents already using Achwanya 3D Tours to close more deals
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A3T</span>
                </div>
                <h4 className="text-xl font-bold">Achwanya 3D Tours</h4>
              </div>
              <p className="text-gray-400">
                Nairobi's trusted 3D virtual tour service for real estate professionals
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400">
                <li>📧 support@achwanya.co.ke</li>
                <li>📱 +254 700 123456</li>
                <li>📍 Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Achwanya 3D Tours. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
