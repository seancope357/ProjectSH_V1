'use client'

import React from 'react'
import { clsx } from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'soft' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  accent?: 'primary' | 'secondary' | 'accent'
}

const Button: React.FC<ButtonProps> = ({
  className = '',
  children,
  variant = 'solid',
  size = 'md',
  accent = 'primary',
  ...props
}) => {
  // Base button styles with explicit padding
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed border'

  // Size variants with EXPLICIT padding
  const sizeStyles = {
    sm: 'h-9 text-sm font-medium',
    md: 'h-10 text-sm font-medium', 
    lg: 'h-11 text-base font-medium',
    xl: 'h-12 text-base font-medium',
  }[size]

  // Padding styles - SEPARATE from size to ensure they apply
  const paddingStyles = {
    sm: 'px-8',
    md: 'px-12', 
    lg: 'px-16',
    xl: 'px-20',
  }[size]

  // Color variants
  const colorStyles = {
    primary: {
      solid: 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 active:bg-gray-900 focus-visible:ring-gray-500',
      soft: 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200 hover:border-gray-300 active:bg-gray-50 focus-visible:ring-gray-400',
      outline: 'border-gray-300 text-gray-700 bg-transparent hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400',
      ghost: 'text-gray-700 bg-transparent border-transparent hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
    },
    secondary: {
      solid: 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500 hover:border-gray-400 active:bg-gray-700 focus-visible:ring-gray-400',
      soft: 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 hover:border-gray-400 active:bg-gray-100 focus-visible:ring-gray-500',
      outline: 'border-gray-400 text-gray-600 bg-transparent hover:border-gray-500 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-500',
      ghost: 'text-gray-600 bg-transparent border-transparent hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-500',
    },
    accent: {
      solid: 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 active:bg-gray-900 focus-visible:ring-gray-500',
      soft: 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200 hover:border-gray-300 active:bg-gray-50 focus-visible:ring-gray-400',
      outline: 'border-gray-300 text-gray-700 bg-transparent hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400',
      ghost: 'text-gray-700 bg-transparent border-transparent hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
    },
  }[accent][variant]

  return (
    <button 
      className={clsx(
        baseStyles,
        sizeStyles,
        paddingStyles,
        colorStyles,
        className
      )} 
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
