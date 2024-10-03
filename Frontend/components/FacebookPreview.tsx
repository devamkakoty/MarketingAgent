import React from 'react'
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react'

interface FacebookPreviewProps {
  imageUrl: string
  caption: string
}

export function FacebookPreview({ imageUrl, caption }: FacebookPreviewProps) {
  return (
    <div className="bg-white text-black max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <img
            src="/placeholder.svg?height=40&width=40"
            alt="Profile"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-semibold">Your Brand</p>
            <p className="text-gray-500 text-sm">Sponsored · 1h</p>
          </div>
        </div>
        <p className="mb-4">{caption}</p>
      </div>
      <img src={imageUrl} alt="Ad content" className="w-full h-96 object-cover" />
      <div className="p-4">
        <div className="flex justify-between text-gray-500 mb-4">
          <span>1.2K Likes</span>
          <span>234 Comments · 56 Shares</span>
        </div>
        <hr className="mb-4" />
        <div className="flex justify-around">
          <button className="flex items-center text-gray-500 hover:text-blue-500">
            <ThumbsUp className="w-5 h-5 mr-2" />
            Like
          </button>
          <button className="flex items-center text-gray-500 hover:text-blue-500">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comment
          </button>
          <button className="flex items-center text-gray-500 hover:text-blue-500">
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}