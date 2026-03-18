export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          whatsapp_number: string | null
          company_name: string | null
          plan_type: 'trial' | 'basic' | 'pro'
          subscription_status: 'active' | 'cancelled' | 'expired'
          trial_ends_at: string | null
          subscription_ends_at: string | null
          max_tours: number
          max_bedrooms: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      properties: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string | null
          address: string
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          area_sqft: number | null
          property_type: 'apartment' | 'house' | 'villa' | 'land'
          status: 'active' | 'sold' | 'rented'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      tours: {
        Row: {
          id: string
          property_id: string | null
          profile_id: string | null
          realsee_url: string
          realsee_id: string
          status: 'active' | 'inactive' | 'processing'
          views: number
          unique_views: number
          avg_view_time_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tours']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tours']['Insert']>
      }
      leads: {
        Row: {
          id: string
          tour_id: string
          profile_id: string | null
          name: string
          phone: string
          email: string | null
          message: string | null
          source: 'tour' | 'website' | 'whatsapp' | 'referral'
          quality_score: number
          contacted: boolean
          converted: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      tour_analytics: {
        Row: {
          id: string
          tour_id: string
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          country: string | null
          city: string | null
          view_duration_seconds: number | null
          completed_tour: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tour_analytics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tour_analytics']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          profile_id: string
          stripe_subscription_id: string | null
          plan_type: string
          amount: number
          currency: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
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
