import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

function Hello() {
  return <div>Hello</div>
}

describe('smoke', () => {
  it('renders component', () => {
    render(<Hello />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
