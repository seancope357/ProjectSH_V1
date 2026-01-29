import React from 'react'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={
          `flex h-12 w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-base font-medium text-white placeholder:text-gray-400 transition-all duration-300 focus:border-primary/60 focus:bg-white/10 focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-white/25 shadow-inner shadow-black/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`
        }
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export default Input