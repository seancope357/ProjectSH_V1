export type SellerSpecialization =
  | 'christmas'
  | 'halloween'
  | 'easter'
  | 'patriotic'
  | 'religious'
  | 'music_visualization'
  | 'animated_props'
  | 'mega_trees'
  | 'house_outlines'
  | 'custom_props'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_seller: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_seller?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_seller?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      seller_profiles: {
        Row: {
          id: string
          seller_name: string
          seller_bio: string | null
          seller_tagline: string | null
          profile_picture_url: string | null
          banner_image_url: string | null
          website_url: string | null
          facebook_url: string | null
          instagram_url: string | null
          youtube_url: string | null
          specializations: SellerSpecialization[]
          expertise_level: string | null
          years_experience: number | null
          stripe_account_id: string | null
          stripe_account_status: string
          stripe_charges_enabled: boolean
          stripe_payouts_enabled: boolean
          marketing_consent: boolean
          newsletter_consent: boolean
          total_sequences: number
          total_sales: number
          total_revenue_cents: number
          average_rating: number | null
          response_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          seller_name: string
          seller_bio?: string | null
          seller_tagline?: string | null
          profile_picture_url?: string | null
          banner_image_url?: string | null
          website_url?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          specializations?: SellerSpecialization[]
          expertise_level?: string | null
          years_experience?: number | null
          stripe_account_id?: string | null
          stripe_account_status?: string
          stripe_charges_enabled?: boolean
          stripe_payouts_enabled?: boolean
          marketing_consent?: boolean
          newsletter_consent?: boolean
          total_sequences?: number
          total_sales?: number
          total_revenue_cents?: number
          average_rating?: number | null
          response_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_name?: string
          seller_bio?: string | null
          seller_tagline?: string | null
          profile_picture_url?: string | null
          banner_image_url?: string | null
          website_url?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          specializations?: SellerSpecialization[]
          expertise_level?: string | null
          years_experience?: number | null
          stripe_account_id?: string | null
          stripe_account_status?: string
          stripe_charges_enabled?: boolean
          stripe_payouts_enabled?: boolean
          marketing_consent?: boolean
          newsletter_consent?: boolean
          total_sequences?: number
          total_sales?: number
          total_revenue_cents?: number
          average_rating?: number | null
          response_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      seller_onboarding_progress: {
        Row: {
          id: string
          step_welcome_completed: boolean
          step_profile_completed: boolean
          step_specializations_completed: boolean
          step_payout_completed: boolean
          step_guidelines_completed: boolean
          step_first_upload_completed: boolean
          is_completed: boolean
          completed_at: string | null
          current_step: number
          last_active_step: number
          started_at: string
          updated_at: string
        }
        Insert: {
          id: string
          step_welcome_completed?: boolean
          step_profile_completed?: boolean
          step_specializations_completed?: boolean
          step_payout_completed?: boolean
          step_guidelines_completed?: boolean
          step_first_upload_completed?: boolean
          is_completed?: boolean
          completed_at?: string | null
          current_step?: number
          last_active_step?: number
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          step_welcome_completed?: boolean
          step_profile_completed?: boolean
          step_specializations_completed?: boolean
          step_payout_completed?: boolean
          step_guidelines_completed?: boolean
          step_first_upload_completed?: boolean
          is_completed?: boolean
          completed_at?: string | null
          current_step?: number
          last_active_step?: number
          started_at?: string
          updated_at?: string
        }
      }
      sequences: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          seller_id: string
          file_url: string
          preview_url: string | null
          thumbnail_url: string | null
          props_used: string[]
          views_count: number
          purchases_count: number
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          seller_id: string
          file_url: string
          preview_url?: string | null
          thumbnail_url?: string | null
          props_used?: string[]
          views_count?: number
          purchases_count?: number
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          seller_id?: string
          file_url?: string
          preview_url?: string | null
          thumbnail_url?: string | null
          props_used?: string[]
          views_count?: number
          purchases_count?: number
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          buyer_id: string
          sequence_id: string
          stripe_payment_intent_id: string
          amount_paid: number
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          sequence_id: string
          stripe_payment_intent_id: string
          amount_paid: number
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          sequence_id?: string
          stripe_payment_intent_id?: string
          amount_paid?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          sequence_id: string
          buyer_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sequence_id: string
          buyer_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sequence_id?: string
          buyer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
