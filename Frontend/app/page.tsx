'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Youtube, Instagram, Zap } from 'lucide-react'
import { Link as ScrollLink, Element } from 'react-scroll'
import { Parallax } from 'react-parallax'
import { LoginModal } from '@/components/ui/LoginModal'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import FeatureCard from '@/components/FeatureCard'

export default function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })

    return () => unsubscribe()
  }, [])

  const handleActionClick = () => {
    if (isLoggedIn) {
      router.push('/app')
    } else {
      setIsLoginModalOpen(true)
    }
  }

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative">
      <div className="absolute inset-0 bg-dots z-0"></div>
      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6 flex justify-between items-center sticky top-0 bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-sm">
          <h1 className="text-2xl font-bold">SegmentGenius</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <ScrollLink to="features" smooth={true} duration={500} className="cursor-pointer hover:text-blue-400 transition-colors">
                  Features
                </ScrollLink>
              </li>
              <li>
                <ScrollLink to="try-it-out" smooth={true} duration={500} className="cursor-pointer hover:text-blue-400 transition-colors">
                  Try It Out
                </ScrollLink>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          <Parallax bgImage="/path/to/hero-image.jpg" strength={500}>
            <section className="container mx-auto px-4 py-40 text-center">
              <h2 className="text-5xl font-bold mb-6">Transform Your Customer Data into Personalized Ads</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">Upload, segment, and create tailored content for your audience with the power of AI</p>
              <Button size="lg" onClick={handleActionClick}>
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </section>
          </Parallax>

          <Element name="features">
            <Parallax bgImage="/path/to/features-bg.jpg" strength={300}>
              <section className="bg-gray-800 bg-opacity-90 py-20">
                <div className="container mx-auto px-4">
                  <h3 className="text-3xl font-bold mb-12 text-center">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                      icon={<Users className="w-12 h-12 mb-4 text-blue-400" />}
                      title="Customer Segmentation"
                      description="Easily upload and segment your customer data for targeted marketing"
                    />
                    <FeatureCard
                      icon={<Zap className="w-12 h-12 mb-4 text-blue-400" />}
                      title="AI-Powered Content"
                      description="Generate personalized ad content tailored to each segment"
                    />
                    <FeatureCard
                      icon={<Youtube className="w-12 h-12 mb-4 text-blue-400" />}
                      title="Multi-Platform Support"
                      description="Create ads for YouTube, Instagram, and more"
                    />
                  </div>
                </div>
              </section>
            </Parallax>
          </Element>

          <Element name="try-it-out">
            <Parallax bgImage="/path/to/cta-bg.jpg" strength={400}>
              <section className="container mx-auto px-4 py-40 text-center">
                <h3 className="text-3xl font-bold mb-6">Ready to Revolutionize Your Marketing?</h3>
                <p className="text-xl mb-8">Experience the power of SegmentGenius firsthand</p>
                <Button size="lg" onClick={handleActionClick}>
                  Try It Now <ArrowRight className="ml-2" />
                </Button>
              </section>
            </Parallax>
          </Element>
        </main>

        <footer className="bg-gray-800 py-6">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2023 SegmentGenius. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}
