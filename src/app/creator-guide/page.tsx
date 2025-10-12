import React from 'react'

export const metadata = {
  title: 'Creator Guide',
  description:
    'Best practices for xLights sequences, submission guidelines, and content tips.',
}

export default function CreatorGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Creator Guide</h1>
      <p className="mt-2 text-sm text-gray-600">
        Concise best practices for xLights usage, exporting, submission, and
        content creation.
      </p>

      <nav className="mt-6">
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>
            <a className="underline" href="#xlights-best-practices">
              xLights Best Practices
            </a>
          </li>
          <li>
            <a className="underline" href="#exporting-sequences">
              Exporting Sequences
            </a>
          </li>
          <li>
            <a className="underline" href="#submission-guidelines">
              Submission Guidelines
            </a>
          </li>
          <li>
            <a className="underline" href="#content-creation">
              Content Creation Tips
            </a>
          </li>
        </ul>
      </nav>

      <section id="xlights-best-practices" className="mt-10">
        <h2 className="text-2xl font-semibold">xLights Best Practices</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-800">
          <li>
            - Keep timing marks clean and consistent. Use a master track for
            song beats and separate tracks for feature moments (vocals,
            instruments, transitions).
          </li>
          <li>
            - Leverage effect layering: background ambience + accent layer +
            lead focus. Avoid over-saturating all props simultaneously.
          </li>
          <li>
            - Use groups strategically (e.g., arches, windows, mega tree,
            outlines). Name groups clearly and avoid redundant nesting.
          </li>
          <li>
            - Respect performance: favor lower CPU effects for global props;
            reserve heavy effects for focal props.
          </li>
          <li>
            - Maintain color theory: limit palettes to 3–5 key colors; use
            contrast for legibility and rhythm for motion.
          </li>
          <li>
            - Document controller mappings: provide prop counts, channel ranges,
            and controller models.
          </li>
        </ul>
      </section>

      <section id="exporting-sequences" className="mt-10">
        <h2 className="text-2xl font-semibold">Exporting Sequences</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-800">
          <li>
            - Preferred primary format: FSEQ (v2 or v1). Include frame rate and
            duration metadata.
          </li>
          <li>
            - Optional bundle: ZIP with xLights project assets (models, timing
            tracks, images, videos). Keep structure simple (top-level folders by
            type).
          </li>
          <li>
            - Validate sequence: play-through without dropped frames; confirm
            controller channels align with documented mappings.
          </li>
          <li>
            - Include a short README in the bundle describing setup, props,
            controllers, and recommended effects settings.
          </li>
        </ul>
      </section>

      <section id="submission-guidelines" className="mt-10">
        <h2 className="text-2xl font-semibold">Submission Guidelines</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-800">
          <li>
            - Title: clear and descriptive; include artist and song title when
            relevant.
          </li>
          <li>
            - Description: summarize theme, focal props, notable moments, and
            any setup caveats.
          </li>
          <li>
            - Tags: add 5–10 relevant tags (e.g., holiday, genre, tempo, props).
          </li>
          <li>
            - Pricing: reflect complexity and uniqueness; ensure previews match
            the final export.
          </li>
          <li>
            - Licenses: if audio is referenced, specify license type and link to
            the license/source. Provide credits for artist(s).
          </li>
        </ul>
      </section>

      <section id="content-creation" className="mt-10">
        <h2 className="text-2xl font-semibold">Content Creation Tips</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-800">
          <li>
            - Start with a storyboard: outline scene progression and prop focus
            per segment.
          </li>
          <li>
            - Use musical structure: align effects to intro, verse, chorus,
            bridge; vary intensity to maintain engagement.
          </li>
          <li>
            - Provide a short video preview (MP4) if available; keep under 30s
            showcasing highlights.
          </li>
          <li>
            - Accessibility: avoid rapid flashing beyond recommended safety
            thresholds; offer alternatives for sensitive viewers.
          </li>
          <li>
            - QA checklist: verify timing marks, prop coverage, color
            consistency, controller mappings, and export integrity.
          </li>
        </ul>
      </section>
    </div>
  )
}
