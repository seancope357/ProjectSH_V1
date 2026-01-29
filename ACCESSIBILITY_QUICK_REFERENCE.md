# Accessibility Quick Reference Guide

## Common Patterns Used in SequenceHub Onboarding

### 1. Screen Reader Only Content
```typescript
// Hide visually but keep for screen readers
<span className="sr-only">Additional context for screen readers</span>

// Announce dynamic changes
<div aria-live="polite" className="sr-only">
  {status === 'loading' && 'Loading, please wait'}
  {status === 'success' && 'Success!'}
</div>
```

### 2. Keyboard-Accessible File Upload
```typescript
const fileInputRef = useRef<HTMLInputElement>(null)

return (
  <>
    <Button
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          fileInputRef.current?.click()
        }
      }}
      aria-label="Upload file"
    >
      Upload
    </Button>
    <input
      ref={fileInputRef}
      type="file"
      className="sr-only"
      onChange={handleFileChange}
    />
  </>
)
```

### 3. Toggle Buttons (Checkbox Pattern)
```typescript
<button
  type="button"
  onClick={() => toggleItem(id)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleItem(id)
    }
  }}
  role="checkbox"
  aria-checked={isSelected}
  aria-labelledby={`item-${id}-label`}
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  <div id={`item-${id}-label`}>Item Name</div>
  <span className="sr-only">
    {isSelected ? 'Selected' : 'Not selected'}
  </span>
</button>
```

### 4. Radio Button Pattern
```typescript
<div role="radiogroup" aria-required="true">
  {options.map(option => (
    <button
      key={option.id}
      type="button"
      onClick={() => selectOption(option.id)}
      role="radio"
      aria-checked={selected === option.id}
      className="focus:ring-2 focus:ring-primary"
    >
      {option.label}
      <span className="sr-only">
        {selected === option.id ? 'Selected' : 'Not selected'}
      </span>
    </button>
  ))}
</div>
```

### 5. Form Field with Full ARIA
```typescript
<div>
  <Label htmlFor="field-id">
    Field Label <span aria-label="required">*</span>
  </Label>
  <Input
    id="field-id"
    value={value}
    onChange={handleChange}
    required
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? 'field-error field-help' : 'field-help'}
  />
  <p id="field-help" className="text-sm text-white/50">
    Helper text
  </p>
  {error && (
    <p id="field-error" role="alert" className="text-sm text-red-400">
      {error}
    </p>
  )}
</div>
```

### 6. ARIA Live Regions
```typescript
// Polite: Non-critical updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {characterCount}/1000 characters
</div>

// Assertive: Errors and critical info
<div aria-live="assertive" role="alert" className="text-red-400">
  {errorMessage}
</div>

// Status: Generic status updates
<div role="status" aria-live="polite">
  Saving...
</div>
```

### 7. Skip Links
```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

### 8. Loading States
```typescript
<Button disabled aria-busy="true">
  <span className="animate-spin" aria-hidden="true">⟳</span>
  Loading...
</Button>
```

### 9. Icon Accessibility
```typescript
// Decorative icons
<Icon className="h-5 w-5" aria-hidden="true" />

// Icon with meaning
<Icon className="h-5 w-5" aria-label="Success" role="img" />

// Icon-only button
<Button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</Button>
```

### 10. Focus Management on Route Change
```typescript
const mainContentRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  // Focus main content on step change
  mainContentRef.current?.focus()

  // Announce to screen reader
  announceToScreenReader(`Now on step: ${stepName}`)
}, [currentStep])

return (
  <div
    ref={mainContentRef}
    tabIndex={-1}
    className="focus:outline-none"
  >
    {/* Content */}
  </div>
)
```

## CSS Classes

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus (for skip links) */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Focus Rings
```css
/* Standard focus ring */
.focus-ring:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Tailwind utility */
.focus:ring-2
.focus:ring-primary
.focus:ring-offset-2
.focus:ring-offset-background
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Commands

```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react eslint-plugin-jsx-a11y

# Run tests
npm run test:a11y

# Lint for accessibility issues
npm run lint:a11y
```

## Quick Checklist

Before committing code, verify:

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible (2px minimum)
- [ ] All images have alt text
- [ ] All form fields have labels
- [ ] Error messages use role="alert" or aria-live="assertive"
- [ ] Dynamic content uses aria-live
- [ ] Color contrast meets 4.5:1 (text) or 3:1 (UI)
- [ ] Icons are either decorative (aria-hidden) or have labels
- [ ] Buttons have descriptive labels
- [ ] No keyboard traps
- [ ] Semantic HTML used where possible
- [ ] Heading hierarchy is logical (h1 → h2 → h3)

## Common Mistakes to Avoid

1. ❌ `<div onClick={...}>` → ✅ `<button onClick={...}>`
2. ❌ `<img src="..." />` → ✅ `<img src="..." alt="Description" />`
3. ❌ `<input />` alone → ✅ `<label><input /></label>`
4. ❌ Click-only interactions → ✅ Click + Enter/Space key handlers
5. ❌ Color alone for info → ✅ Color + text/icon
6. ❌ Low contrast text → ✅ 4.5:1 minimum ratio
7. ❌ Missing focus indicators → ✅ Visible focus rings
8. ❌ Unlabeled buttons → ✅ aria-label or visible text

## Resources

- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM:** https://webaim.org/
- **Deque axe:** https://www.deque.com/axe/

## Need Help?

1. Check this guide first
2. Review ACCESSIBILITY_AUDIT_REPORT.md for detailed examples
3. Use browser dev tools + axe extension
4. Test with a screen reader (NVDA is free)
5. Ask in #accessibility Slack channel
