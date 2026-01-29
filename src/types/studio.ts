import { z } from 'zod'

// Database Types - extending existing database.ts
export interface StudioTables {
  layouts: {
    Row: {
      id: string
      owner_id: string
      name: string
      source: 'xLights' | 'builder'
      layout_json: Record<string, unknown>
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      owner_id: string
      name: string
      source: 'xLights' | 'builder'
      layout_json?: Record<string, unknown>
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      owner_id?: string
      name?: string
      source?: 'xLights' | 'builder'
      layout_json?: Record<string, unknown>
      created_at?: string
      updated_at?: string
    }
  }
  
  layout_models: {
    Row: {
      id: string
      layout_id: string
      type: string
      name: string
      meta_json: Record<string, unknown>
      positions_json: Array<[number, number, number]> // Vec3 positions
      created_at: string
    }
    Insert: {
      id?: string
      layout_id: string
      type: string
      name: string
      meta_json?: Record<string, unknown>
      positions_json: Array<[number, number, number]>
      created_at?: string
    }
    Update: {
      id?: string
      layout_id?: string
      type?: string
      name?: string
      meta_json?: Record<string, unknown>
      positions_json?: Array<[number, number, number]>
      created_at?: string
    }
  }

  ai_sequences: {
    Row: {
      id: string
      owner_id: string
      name: string
      status: 'draft' | 'ready' | 'rendering' | 'error'
      layout_id: string | null
      duration_ms: number | null
      bpm: number | null
      key: string | null
      is_public: boolean
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      owner_id: string
      name: string
      status?: 'draft' | 'ready' | 'rendering' | 'error'
      layout_id?: string | null
      duration_ms?: number | null
      bpm?: number | null
      key?: string | null
      is_public?: boolean
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      owner_id?: string
      name?: string
      status?: 'draft' | 'ready' | 'rendering' | 'error'
      layout_id?: string | null
      duration_ms?: number | null
      bpm?: number | null
      key?: string | null
      is_public?: boolean
      created_at?: string
      updated_at?: string
    }
  }

  ai_sequence_versions: {
    Row: {
      id: string
      sequence_id: string
      dsl_json: SequenceDSL
      analysis_json: AudioAnalysis
      xsq_xml: string | null
      xsq_size: number | null
      fps: number
      audio_ref: string | null
      preview_ref: string | null
      changelog: string
      created_at: string
    }
    Insert: {
      id?: string
      sequence_id: string
      dsl_json: SequenceDSL
      analysis_json?: AudioAnalysis
      xsq_xml?: string | null
      xsq_size?: number | null
      fps?: number
      audio_ref?: string | null
      preview_ref?: string | null
      changelog?: string
      created_at?: string
    }
    Update: {
      id?: string
      sequence_id?: string
      dsl_json?: SequenceDSL
      analysis_json?: AudioAnalysis
      xsq_xml?: string | null
      xsq_size?: number | null
      fps?: number
      audio_ref?: string | null
      preview_ref?: string | null
      changelog?: string
      created_at?: string
    }
  }

  ai_templates: {
    Row: {
      id: string
      name: string
      category: string
      description: string | null
      dsl_template_json: Partial<SequenceDSL>
      params_schema_json: Record<string, unknown>
      is_builtin: boolean
      created_at: string
    }
    Insert: {
      id?: string
      name: string
      category: string
      description?: string | null
      dsl_template_json: Partial<SequenceDSL>
      params_schema_json?: Record<string, unknown>
      is_builtin?: boolean
      created_at?: string
    }
    Update: {
      id?: string
      name?: string
      category?: string
      description?: string | null
      dsl_template_json?: Partial<SequenceDSL>
      params_schema_json?: Record<string, unknown>
      is_builtin?: boolean
      created_at?: string
    }
  }

  prompt_suggestions: {
    Row: {
      id: string
      category: string
      text: string
      embedding_vector: number[] | null
      created_at: string
    }
    Insert: {
      id?: string
      category: string
      text: string
      embedding_vector?: number[] | null
      created_at?: string
    }
    Update: {
      id?: string
      category?: string
      text?: string
      embedding_vector?: number[] | null
      created_at?: string
    }
  }

  ai_jobs: {
    Row: {
      id: string
      owner_id: string
      sequence_id: string | null
      type: 'analysis' | 'generation' | 'render'
      status: 'pending' | 'running' | 'completed' | 'failed'
      progress: number
      error: string | null
      logs: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      owner_id: string
      sequence_id?: string | null
      type: 'analysis' | 'generation' | 'render'
      status?: 'pending' | 'running' | 'completed' | 'failed'
      progress?: number
      error?: string | null
      logs?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      owner_id?: string
      sequence_id?: string | null
      type?: 'analysis' | 'generation' | 'render'
      status?: 'pending' | 'running' | 'completed' | 'failed'
      progress?: number
      error?: string | null
      logs?: string | null
      created_at?: string
      updated_at?: string
    }
  }
}

// Internal Sequence DSL - Zod schemas for validation

export const Vec3Schema = z.tuple([z.number(), z.number(), z.number()])
export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)
export const EasingSchema = z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier'])
export const BlendModeSchema = z.enum(['normal', 'add', 'multiply', 'screen', 'overlay'])

// Effect parameters
export const ColorWashParamsSchema = z.object({
  colors: z.array(ColorSchema),
  gradient: z.enum(['linear', 'radial']).optional(),
  intensity: z.number().min(0).max(1),
  palette_id: z.string().optional()
})

export const ChaseParamsSchema = z.object({
  direction: z.enum(['forward', 'backward', 'bounce', 'center-out', 'outside-in']),
  speed: z.number().min(0.1).max(10),
  width: z.number().min(1).max(100),
  colorA: ColorSchema,
  colorB: ColorSchema
})

export const TextParamsSchema = z.object({
  content: z.string(),
  font: z.string().optional(),
  size: z.number().min(8).max(144),
  color: ColorSchema,
  speed: z.number().min(0.1).max(5),
  path: z.enum(['horizontal', 'vertical', 'circular']).optional()
})

export const TwinkleParamsSchema = z.object({
  density: z.number().min(0).max(1),
  speed: z.number().min(0.1).max(5),
  colors: z.array(ColorSchema)
})

export const EffectParamsSchema = z.union([
  ColorWashParamsSchema,
  ChaseParamsSchema,
  TextParamsSchema,
  TwinkleParamsSchema,
  z.record(z.string(), z.unknown()) // Allow custom params
])

// Main effect schema
export const EffectSchema = z.object({
  id: z.string(),
  type: z.enum([
    'on_off', 'color_wash', 'bars', 'chase', 'twinkle', 'shimmer', 
    'pulse', 'morph', 'spiral', 'wave', 'text', 'fire', 'matrix_scroll'
  ]),
  start_ms: z.number().min(0),
  duration_ms: z.number().min(1),
  params: EffectParamsSchema,
  easing: EasingSchema.optional(),
  blend_mode: BlendModeSchema.optional(),
  timing_track_id: z.string().optional()
})

export const TimingMarkerSchema = z.object({
  time_ms: z.number().min(0),
  type: z.enum(['beat', 'bar', 'section', 'marker']),
  label: z.string().optional()
})

export const ModelTrackSchema = z.object({
  model_id: z.string(),
  effects: z.array(EffectSchema)
})

export const SequenceDSLSchema = z.object({
  version: z.string().default('1.0'),
  fps: z.number().min(1).max(120).default(50),
  duration_ms: z.number().min(1),
  global_palette: z.array(ColorSchema).optional(),
  models: z.array(z.string()), // Array of model IDs
  tracks: z.array(ModelTrackSchema),
  timing_markers: z.array(TimingMarkerSchema).optional()
})

// Audio analysis types
export const AudioAnalysisSchema = z.object({
  bpm: z.number(),
  beats: z.array(z.number()), // Beat positions in seconds
  bars: z.array(z.number()), // Bar positions in seconds  
  sections: z.array(z.object({
    start: z.number(),
    end: z.number(),
    label: z.string().optional()
  })),
  key: z.string().optional(),
  loudness: z.array(z.number()).optional(), // RMS values over time
  onsets: z.array(z.number()).optional(), // Onset detection
  tempo_changes: z.array(z.object({
    time: z.number(),
    bpm: z.number()
  })).optional()
})

// TypeScript types from schemas
export type Vec3 = z.infer<typeof Vec3Schema>
export type Color = z.infer<typeof ColorSchema>
export type Easing = z.infer<typeof EasingSchema>
export type BlendMode = z.infer<typeof BlendModeSchema>

export type ColorWashParams = z.infer<typeof ColorWashParamsSchema>
export type ChaseParams = z.infer<typeof ChaseParamsSchema>
export type TextParams = z.infer<typeof TextParamsSchema>
export type TwinkleParams = z.infer<typeof TwinkleParamsSchema>
export type EffectParams = z.infer<typeof EffectParamsSchema>

export type Effect = z.infer<typeof EffectSchema>
export type TimingMarker = z.infer<typeof TimingMarkerSchema>
export type ModelTrack = z.infer<typeof ModelTrackSchema>
export type SequenceDSL = z.infer<typeof SequenceDSLSchema>
export type AudioAnalysis = z.infer<typeof AudioAnalysisSchema>

// Layout and model types
export interface LayoutModel {
  id: string
  layout_id: string
  type: 'tree' | 'matrix' | 'arch' | 'string' | 'prop' | 'outline'
  name: string
  meta: {
    led_count?: number
    width?: number
    height?: number
    strand_count?: number
    [key: string]: unknown
  }
  positions: Vec3[] // LED positions in 3D space
}

export interface Layout {
  id: string
  owner_id: string
  name: string
  source: 'xLights' | 'builder'
  layout: {
    bounds?: {
      min: Vec3
      max: Vec3
    }
    units?: 'meters' | 'feet'
    [key: string]: unknown
  }
  models: LayoutModel[]
}

// Generation request types
export interface GenerationRequest {
  prompt_text?: string
  selected_template_id?: string
  layout_id: string
  audio_analysis?: AudioAnalysis
  options: {
    style_intensity: number // 0-1
    color_palette?: Color[]
    duration_ms?: number
    fps?: number
  }
}

export interface GenerationResult {
  dsl: SequenceDSL
  metadata: {
    generation_time_ms: number
    ai_model_used?: string
    template_used?: string
    style_keywords?: string[]
    confidence_score?: number
  }
}

// Studio UI State types
export interface ViewportCamera {
  position: Vec3
  target: Vec3
  zoom: number
}

export interface TimelineState {
  current_time_ms: number
  is_playing: boolean
  playback_rate: number
  loop_start_ms: number | null
  loop_end_ms: number | null
  selected_effects: string[]
  snap_to_grid: boolean
  grid_size_ms: number
}

export interface StudioState {
  sequence: SequenceDSL | null
  layout: Layout | null
  viewport: {
    camera: ViewportCamera
    show_grid: boolean
    show_bounds: boolean
    model_visibility: Record<string, boolean>
  }
  timeline: TimelineState
  ai_suggestions: {
    prompts: string[]
    templates: string[]
    color_palettes: Color[][]
  }
}

// AI processing types
export interface EmbeddingCache {
  model_id: string
  embeddings: Record<string, Float32Array>
  last_updated: number
}

export interface AIModelConfig {
  text_embeddings: {
    model: string
    cache_key: string
  }
  text_generation: {
    primary_endpoint: string
    fallback_rules: boolean
    models: string[]
  }
  audio_analysis: {
    features: string[]
    sample_rate: number
  }
}

// xLights export types
export interface XLightsMapping {
  dsl_effect: string
  xlights_effect: string
  param_mapping: Record<string, string>
  notes?: string
}

export interface ExportOptions {
  target_version: string
  include_timing_tracks: boolean
  fps_conversion: 'preserve' | 'convert_to_50'
  model_name_prefix?: string
}

export interface ExportResult {
  xml: string
  size_bytes: number
  effects_mapped: number
  effects_unsupported: string[]
  warnings: string[]
}