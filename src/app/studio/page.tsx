import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus, Play, Clock, Sparkles, Music, FileText, Settings } from 'lucide-react'

export default function StudioLanding() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-5xl font-heading font-extrabold">
                AI <span className="text-primary">Studio</span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create stunning xLights sequences with AI-powered generation and professional 3D visualization.
              Turn your music and ideas into captivating light shows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/studio/new">
                <Button size="lg" className="px-8">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Sequence
                </Button>
              </Link>
              <Button variant="outline" size="lg" accent="secondary" className="px-8">
                <Play className="h-5 w-5 mr-2" />
                Watch Tutorial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="py-8 px-4 bg-surface/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-heading font-bold">Recent Projects</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          {/* Empty State - Replace with actual projects later */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create First Project Card */}
            <Link href="/studio/new">
              <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/50 transition-colors group">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-2">Start Your First Project</h3>
                  <p className="text-gray-400 text-sm">
                    Create AI-generated sequences from music or prompts
                  </p>
                </div>
              </Card>
            </Link>
            
            {/* Placeholder project cards - will be replaced with actual data */}
            {[1, 2].map((i) => (
              <Card key={i} className="bg-surface/40 hover:bg-surface/60 transition-colors opacity-50">
                <div className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white/40" />
                  </div>
                  <h3 className="font-heading font-bold text-white/60 mb-2">Christmas Magic {i}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      2 days ago
                    </span>
                    <span>3:24</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Options */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Choose Your <span className="text-primary">Starting Point</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* From Music */}
            <Link href="/studio/new?type=music">
              <Card className="bg-surface/40 hover:bg-surface/60 transition-all hover-glow-primary group">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-4">From Music</h3>
                  <p className="text-gray-300 mb-6">
                    Upload your music and let AI analyze the beats, tempo, and energy to generate synchronized sequences.
                  </p>
                  <div className="text-accent font-medium">Perfect for any song →</div>
                </div>
              </Card>
            </Link>

            {/* From Prompt */}
            <Link href="/studio/new?type=prompt">
              <Card className="bg-surface/40 hover:bg-surface/60 transition-all hover-glow-secondary group">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-4">From Prompt</h3>
                  <p className="text-gray-300 mb-6">
                    Describe your vision in words. AI will interpret your style, mood, and effects to create sequences.
                  </p>
                  <div className="text-secondary font-medium">Express your creativity →</div>
                </div>
              </Card>
            </Link>

            {/* Advanced */}
            <Link href="/studio/new?type=advanced">
              <Card className="bg-surface/40 hover:bg-surface/60 transition-all hover-glow-accent group">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-4">Advanced</h3>
                  <p className="text-gray-300 mb-6">
                    Combine music, prompts, and custom layouts. Full control over AI generation and manual editing.
                  </p>
                  <div className="text-accent font-medium">Full power mode →</div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-12 px-4 bg-surface/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Professional <span className="text-primary">Features</span>
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to create stunning light sequences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: "AI Generation",
                description: "Smart sequence creation from music and text"
              },
              {
                icon: <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded"></div>,
                title: "3D Visualization",
                description: "Real-time preview with professional controls"
              },
              {
                icon: <Music className="h-6 w-6" />,
                title: "Audio Sync",
                description: "Beat detection and tempo analysis"
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "xLights Export",
                description: "Direct export to .xsq format"
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-surface/20 p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}