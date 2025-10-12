'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-700 dark:text-gray-300" />
        <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-700 dark:text-gray-300" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
            <button
              onClick={() => {
                setTheme('light')
                setIsOpen(false)
              }}
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                setTheme('dark')
                setIsOpen(false)
              }}
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                setTheme('system')
                setIsOpen(false)
              }}
              className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
