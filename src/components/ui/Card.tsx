'use client'

import React from 'react'
import { clsx } from 'clsx'

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={clsx(
      'rounded-xl shadow-lg shadow-black/30 [box-shadow:0_0_0_1px_rgba(255,255,255,0.08),0_10px_40px_rgba(0,0,0,0.6)] bg-surface/90 border border-white/8 backdrop-blur-md transition-all duration-300 hover:translate-y-[-2px]',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={clsx('p-7 sm:p-9 border-b border-white/8', className)} {...props}>
    {children}
  </div>
)

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={clsx('p-7 sm:p-9', className)} {...props}>
    {children}
  </div>
)

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={clsx('p-7 sm:p-9 border-t border-white/8', className)} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardContent, CardFooter }
