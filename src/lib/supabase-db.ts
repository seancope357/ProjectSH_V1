import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database helper functions
export const db = {
  // Sequences
  sequences: {
    async findMany(filters?: { category?: string; status?: string; sellerId?: string }) {
      let query = supabaseAdmin
        .from('sequences')
        .select(`
          *,
          seller:profiles!sequences_seller_id_fkey(username, id),
          category:categories!sequences_category_id_fkey(name, id)
        `)
      
      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.sellerId) {
        query = query.eq('seller_id', filters.sellerId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },

    async findById(id: string) {
      const { data, error } = await supabaseAdmin
        .from('sequences')
        .select(`
          *,
          seller:profiles!sequences_seller_id_fkey(username, id),
          category:categories!sequences_category_id_fkey(name, id)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async create(sequence: any) {
      const { data, error } = await supabaseAdmin
        .from('sequences')
        .insert(sequence)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabaseAdmin
        .from('sequences')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(id: string) {
      const { error } = await supabaseAdmin
        .from('sequences')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Orders
  orders: {
    async findMany(userId?: string) {
      let query = supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            sequence:sequences(title, price, seller:profiles!sequences_seller_id_fkey(username))
          )
        `)
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },

    async create(order: any) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert(order)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Cart
  cart: {
    async findByUserId(userId: string) {
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .select(`
          *,
          sequence:sequences(
            *,
            seller:profiles!sequences_seller_id_fkey(username)
          )
        `)
        .eq('user_id', userId)
      
      if (error) throw error
      return data
    },

    async addItem(item: any) {
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .insert(item)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async updateQuantity(id: string, quantity: number) {
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async removeItem(id: string) {
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    async clearCart(userId: string) {
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
    }
  },

  // Categories
  categories: {
    async findMany() {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  },

  // Profiles
  profiles: {
    async findById(id: string) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  }
}