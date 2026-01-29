'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  Music, 
  FileText, 
  Settings, 
  Upload, 
  Sparkles, 
  ChevronRight,
  Play,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'

type CreationType = 'music' | 'prompt' | 'advanced' | null

export default function NewSequence() {
  const searchParams = useSearchParams()
  const [creationType, setCreationType] = useState<CreationType>(
    (searchParams.get('type') as CreationType) || null
  )
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    music_file: null as File | null,
    prompt_text: '',
    selected_template: '',
    style_intensity: 0.7,
    duration_ms: 0,
    layout_source: 'builder' // 'builder' | 'upload'
  })

  const templates = [
    {
      id: 'beat-driven',
      name: 'Beat-Driven Chases',
      category: 'Energetic',
      description: 'Fast-paced sequences that sync to strong beats',
      preview_colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
      estimated_time: '2-3 min'
    },
    {
      id: 'ambient-wash',
      name: 'Ambient Washes',
      category: 'Calm',
      description: 'Smooth color transitions and gentle movements',
      preview_colors: ['#667eea', '#764ba2', '#f093fb'],
      estimated_time: '3-4 min'
    },
    {
      id: 'epic-drops',
      name: 'Epic Drops',
      category: 'Dramatic',
      description: 'Build-ups with explosive synchronized moments',
      preview_colors: ['#f857a6', '#ff5858', '#ffad84'],
      estimated_time: '4-5 min'
    },
    {
      id: 'holiday-magic',
      name: 'Holiday Magic',
      category: 'Seasonal',
      description: 'Traditional holiday colors and patterns',
      preview_colors: ['#ff0000', '#00ff00', '#ffffff'],
      estimated_time: '3-4 min'
    }
  ]

  if (!creationType) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/studio" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Studio
            </Link>
            
            <div className="mb-12">
              <h1 className="text-4xl font-heading font-extrabold mb-4">
                Create New <span className="text-primary">Sequence</span>
              </h1>
              <p className="text-xl text-gray-300">
                Choose how you&apos;d like to start creating your sequence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="bg-surface/40 hover:bg-surface/60 transition-all hover-glow-primary group cursor-pointer"
                onClick={() => setCreationType('music')}
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-4">From Music</h3>
                  <p className="text-gray-300 mb-6">
                    Upload your music file and let AI analyze it to create synchronized sequences
                  </p>
                  <div className="flex items-center justify-center text-accent font-medium">
                    Start with music <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Card>

              <Card 
                className="bg-surface/40 hover:bg-surface/60 transition-all hover-glow-secondary group cursor-pointer"
                onClick={() => setCreationType('prompt')}
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-4">From Prompt</h3>
                  <p className="text-gray-300 mb-6">
                    Describe your vision and let AI interpret your style and mood
                  </p>
                  <div className="flex items-center justify-center text-secondary font-medium">
                    Start with ideas <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Card>

              <Card 
                className="bg-surface/40 hover:bg-surface/60 transition-all hover-glow-accent group cursor-pointer"
                onClick={() => setCreationType('advanced')}
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-white mb-4">Advanced Mode</h3>
                  <p className="text-gray-300 mb-6">
                    Combine music, prompts, and custom settings for maximum control
                  </p>
                  <div className="flex items-center justify-center text-accent font-medium">
                    Full control <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[80vh] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button 
                onClick={() => setCreationType(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Creation Type
              </button>
              <h1 className="text-3xl font-heading font-bold">
                Create from {creationType === 'music' ? 'Music' : creationType === 'prompt' ? 'Prompt' : 'Advanced'}
              </h1>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= stepNum 
                      ? 'bg-primary text-white' 
                      : 'bg-surface text-gray-400'
                  }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">Project Details</h2>
                <Card className="bg-surface/40 p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sequence Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="My Amazing Sequence"
                        className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>

                    {(creationType === 'music' || creationType === 'advanced') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Music File
                        </label>
                        <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                          <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                          <p className="text-white font-medium mb-2">Drop your music file here</p>
                          <p className="text-gray-400 text-sm mb-4">Supports MP3, WAV, OGG, M4A (max 50MB)</p>
                          <Button variant="outline">Choose File</Button>
                        </div>
                      </div>
                    )}

                    {(creationType === 'prompt' || creationType === 'advanced') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Describe Your Vision
                        </label>
                        <textarea
                          value={formData.prompt_text}
                          onChange={(e) => setFormData({...formData, prompt_text: e.target.value})}
                          placeholder="A festive Christmas sequence with twinkling stars and warm golden lights that cascade down the tree in rhythm with the music..."
                          rows={4}
                          className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">Be descriptive for better AI results</span>
                          <Button variant="outline" size="sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Get Ideas
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!formData.name}>
                  Continue to Templates
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">Choose a Template</h2>
                <p className="text-gray-300 mb-6">
                  Select a starting template that matches your style. You can customize it further after generation.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        formData.selected_template === template.id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-surface/40 hover:bg-surface/60'
                      }`}
                      onClick={() => setFormData({...formData, selected_template: template.id})}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-heading font-bold text-white mb-1">{template.name}</h3>
                            <span className="text-xs text-gray-400 bg-surface/60 px-2 py-1 rounded-full">
                              {template.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {template.estimated_time}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {template.preview_colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-accent">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs">Popular</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!formData.selected_template}
                >
                  Continue to Layout
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">Layout Setup</h2>
                <p className="text-gray-300 mb-6">
                  Choose how to set up your 3D layout for visualization and sequence generation.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.layout_source === 'builder'
                        ? 'bg-primary/20 border-primary'
                        : 'bg-surface/40 hover:bg-surface/60'
                    }`}
                    onClick={() => setFormData({...formData, layout_source: 'builder'})}
                  >
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-heading font-bold text-white mb-2">Quick Builder</h3>
                      <p className="text-gray-300 text-sm">
                        Use our interactive builder to quickly set up common props like trees, matrices, and arches.
                      </p>
                    </div>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.layout_source === 'upload'
                        ? 'bg-primary/20 border-primary'
                        : 'bg-surface/40 hover:bg-surface/60'
                    }`}
                    onClick={() => setFormData({...formData, layout_source: 'upload'})}
                  >
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-heading font-bold text-white mb-2">Import xLights</h3>
                      <p className="text-gray-300 text-sm">
                        Upload your existing xLights .xmodel files to use your current setup.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Sequence
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}