import React from 'react'
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react'

interface InstagramPreviewProps {
  imageUrl: string
  caption: string
}

export function InstagramPreview({ imageUrl, caption }: InstagramPreviewProps) {
  return (
    <div className="bg-white text-black max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 flex items-center">
        <img
          src="/placeholder.svg?height=40&width=40"
          alt="Profile"
          className="w-10 h-10 rounded-full mr-3"
        />
        <span className="font-semibold">Your Brand</span>
      </div>
      <img src={imageUrl} alt="Ad content" className="w-full h-96 object-cover" />
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <Heart className="w-6 h-6" />
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <Bookmark className="w-6 h-6" />
        </div>
        <p className="font-semibold mb-2">1,234 likes</p>
        <p>
          <span className="font-semibold mr-2">Your Brand</span>
          {caption}
        </p>
        <p className="text-gray-500 text-sm mt-2">View all 123 comments</p>
      </div>
    </div>
  )
}