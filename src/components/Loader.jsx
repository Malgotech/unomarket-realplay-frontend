import React from 'react'

const Loader = ({ size = 'medium' }) => {
  // Size variants
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }
  
  return (
    <div className="flex justify-center items-center">
      <div className={`${sizes[size]} border-4 border-[#f3f3f3] border-t-4 border-t-[#2563eb] rounded-full animate-spin`}></div>
    </div>
  )
}

export default Loader