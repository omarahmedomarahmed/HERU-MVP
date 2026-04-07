import React, { useState } from 'react'
import { cn } from '@/lib/utils'

const COUNTRY_CODES = [
  { code: '+20', country: 'EG', label: 'Egypt (+20)' },
  { code: '+966', country: 'SA', label: 'Saudi Arabia (+966)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+965', country: 'KW', label: 'Kuwait (+965)' },
  { code: '+974', country: 'QA', label: 'Qatar (+974)' },
  { code: '+973', country: 'BH', label: 'Bahrain (+973)' },
  { code: '+968', country: 'OM', label: 'Oman (+968)' },
  { code: '+962', country: 'JO', label: 'Jordan (+962)' },
  { code: '+961', country: 'LB', label: 'Lebanon (+961)' },
  { code: '+964', country: 'IQ', label: 'Iraq (+964)' },
  { code: '+1', country: 'US', label: 'USA (+1)' },
  { code: '+44', country: 'GB', label: 'UK (+44)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
  { code: '+33', country: 'FR', label: 'France (+33)' },
]

export default function PhoneInput({ value, onChange, className, placeholder = 'Phone number', disabled }) {
  // Parse existing value into code + number
  const parseValue = (val) => {
    if (!val) return { countryCode: '+20', number: '' }
    const str = String(val).trim()
    // Try to match a country code prefix
    for (const cc of COUNTRY_CODES) {
      if (str.startsWith(cc.code)) {
        return { countryCode: cc.code, number: str.slice(cc.code.length).trim() }
      }
    }
    // If starts with +, try extracting
    if (str.startsWith('+')) {
      const spaceIdx = str.indexOf(' ')
      if (spaceIdx > 0) {
        return { countryCode: str.slice(0, spaceIdx), number: str.slice(spaceIdx + 1) }
      }
    }
    return { countryCode: '+20', number: str.replace(/^\+/, '') }
  }

  const parsed = parseValue(value)
  const [countryCode, setCountryCode] = useState(parsed.countryCode)
  const [number, setNumber] = useState(parsed.number)

  const handleCodeChange = (newCode) => {
    setCountryCode(newCode)
    onChange(`${newCode} ${number}`)
  }

  const handleNumberChange = (newNumber) => {
    // Only allow digits and spaces
    const cleaned = newNumber.replace(/[^\d\s]/g, '')
    setNumber(cleaned)
    onChange(`${countryCode} ${cleaned}`)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        value={countryCode}
        onChange={(e) => handleCodeChange(e.target.value)}
        disabled={disabled}
        className="w-[120px] h-9 rounded-md border border-zinc-700 bg-zinc-800 text-white text-sm px-2 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
      >
        {COUNTRY_CODES.map((cc) => (
          <option key={cc.code} value={cc.code}>
            {cc.country} {cc.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-9 rounded-md border border-zinc-700 bg-zinc-800 text-white text-sm px-3 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
      />
    </div>
  )
}
