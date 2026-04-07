import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Link2, AlertCircle } from 'lucide-react'

function isValidUrl(str) {
  if (!str) return true // empty is ok
  try {
    const url = new URL(str.startsWith('http') ? str : `https://${str}`)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function UrlInput({ value, onChange, className, placeholder = 'https://...', disabled, label }) {
  const [touched, setTouched] = useState(false)
  const isValid = !value || isValidUrl(value)
  const showError = touched && value && !isValid

  return (
    <div className="w-full">
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full h-9 rounded-md border bg-zinc-800 text-white text-sm pl-10 pr-3 placeholder:text-gray-500 focus:outline-none focus:ring-1 disabled:opacity-50",
            showError ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-red-500",
            className
          )}
        />
        {showError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
        )}
      </div>
      {showError && (
        <p className="text-red-400 text-xs mt-1">Please enter a valid URL (e.g. https://example.com)</p>
      )}
    </div>
  )
}
