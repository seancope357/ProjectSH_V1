import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

const VALID_DOCUMENTS = [
  'terms-of-service',
  'privacy-policy',
  'community-guidelines',
  'seller-agreement',
]

const DOCUMENT_TITLES: Record<string, string> = {
  'terms-of-service': 'Terms of Service',
  'privacy-policy': 'Privacy Policy',
  'community-guidelines': 'Community Guidelines',
  'seller-agreement': 'Seller Agreement',
}

async function getDocumentContent(document: string) {
  if (!VALID_DOCUMENTS.includes(document)) {
    return null
  }

  const filePath = path.join(process.cwd(), 'public', 'legal', `${document}.md`)
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return fileContents
  } catch (error) {
    console.error(`Error reading ${document}:`, error)
    return null
  }
}

// Simple markdown to HTML conversion for basic formatting
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
  
  // Convert headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  
  // Convert italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  
  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
  
  // Convert horizontal rules
  html = html.replace(/^---$/gim, '<hr>')
  
  // Convert line breaks to paragraphs
  const paragraphs = html.split('\n\n')
  html = paragraphs
    .map((para) => {
      para = para.trim()
      if (!para) return ''
      if (para.startsWith('<h') || para.startsWith('<hr')) return para
      if (para.startsWith('-') || para.startsWith('*')) {
        // Handle lists
        const items = para.split('\n').filter(line => line.trim())
        return '<ul>' + items.map(item => {
          const cleaned = item.replace(/^[-*]\s*/, '')
          return `<li>${cleaned}</li>`
        }).join('') + '</ul>'
      }
      return `<p>${para}</p>`
    })
    .join('\n')
  
  return html
}

export async function generateStaticParams() {
  return VALID_DOCUMENTS.map((doc) => ({
    document: doc,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: { document: string } 
}): Promise<Metadata> {
  const title = DOCUMENT_TITLES[params.document] || 'Legal Document'
  return {
    title: `${title} - SequenceHub`,
    description: `Read the SequenceHub ${title}`,
  }
}

export default async function LegalDocumentPage({
  params,
}: {
  params: { document: string }
}) {
  const markdown = await getDocumentContent(params.document)
  
  if (!markdown) {
    notFound()
  }

  const content = convertMarkdownToHTML(markdown)
  const title = DOCUMENT_TITLES[params.document]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-white/10 bg-surface/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/seller-onboarding"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Onboarding
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="prose prose-invert prose-lg max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="legal-document"
          />
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} SequenceHub. All rights reserved.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
            {VALID_DOCUMENTS.map((doc) => (
              <Link
                key={doc}
                href={`/legal/${doc}`}
                className="text-white/70 hover:text-white transition-colors"
              >
                {DOCUMENT_TITLES[doc]}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
