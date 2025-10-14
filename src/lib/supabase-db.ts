import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database helper functions
export const db = {
  // Sequences
  sequences: {
    normalizeFileUrl(fileUrl?: string | null): string | null {
      if (!fileUrl) return fileUrl ?? null
      // Already normalized
      if (fileUrl.startsWith('supabase://')) return fileUrl
      // Absolute Supabase public URL
      try {
        if (fileUrl.startsWith('http')) {
          const u = new URL(fileUrl)
          const prefix = '/storage/v1/object/public/'
          const idx = u.pathname.indexOf(prefix)
          if (idx >= 0) {
            const after = u.pathname.slice(idx + prefix.length)
            const [bucket, ...rest] = after.split('/')
            const path = rest.join('/')
            if (bucket && path) return `supabase://${bucket}/${path}`
          }
          return fileUrl // external or non-public Supabase URL; leave unchanged
        }
      } catch {
        // If URL parsing fails, fall through
      }
      // Relative bucket/path
      const [bucket, ...rest] = fileUrl.split('/')
      const path = rest.join('/')
      if (bucket && path) return `supabase://${bucket}/${path}`
      return fileUrl
    },
    async findMany(
      filters: { category?: string; status?: string; sellerId?: string } = {}
    ) {
      // Standard query with relations. Note: On some deployments the
      // PostgREST relationship between sequences and categories/profiles
      // may not exist. Use findManySimple if relationships are unavailable.
      let query = supabaseAdmin.from('sequences').select(
        `
          *,
          category:categories(name),
          seller:profiles!seller_id(username, full_name)
        `
      )

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters.sellerId) {
        query = query.eq('seller_id', filters.sellerId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async findManySimple(
      filters: { category?: string; status?: string; sellerId?: string } = {}
    ) {
      // Relationship-free query for environments without FK relationships.
      let query = supabaseAdmin.from('sequences').select('*')

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters.sellerId) {
        query = query.eq('seller_id', filters.sellerId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async findById(id: string) {
      const { data, error } = await supabaseAdmin
        .from('sequences')
        .select(
          `
          *,
          category:categories(name),
          seller:profiles!seller_id(username, full_name)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async findByIds(ids: string[]) {
      const { data, error } = await supabaseAdmin
        .from('sequences')
        .select(
          `
          *,
          category:categories(name),
          seller:profiles!seller_id(username, full_name)
        `
        )
        .in('id', ids)

      if (error) throw error
      return data || []
    },

    async create(sequence: any) {
      if (sequence && 'file_url' in sequence) {
        sequence.file_url = db.sequences.normalizeFileUrl(sequence.file_url)
      }
      const { data, error } = await supabaseAdmin
        .from('sequences')
        .insert(sequence)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(id: string, updates: any) {
      if (updates && 'file_url' in updates) {
        updates.file_url = db.sequences.normalizeFileUrl(updates.file_url)
      }
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
      return true
    },
  },

  // Orders
  orders: {
    async findMany(userId?: string) {
      let query = supabaseAdmin
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            sequences (
              id,
              title,
              price,
              thumbnail_url
            )
          )
        `
        )
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async findById(id: string) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            sequences (
              id,
              title,
              price,
              thumbnail_url
            )
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error

      // Transform order_items to items for compatibility
      if (data && data.order_items) {
        data.items = data.order_items.map((item: any) => ({
          sequence_id: item.sequence_id,
          price: item.price,
          seller_id: item.seller_id,
          sequence: item.sequences,
        }))
      }

      return data
    },

    async create(order: any) {
      const { items, ...orderData } = order

      // Create the order first
      const { data: orderResult, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      if (items && items.length > 0) {
        const orderItems = items.map((item: any) => ({
          order_id: orderResult.id,
          sequence_id: item.sequence_id,
          price: item.price,
          seller_id: item.seller_id,
          seller_payout: item.seller_payout,
        }))

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError
      }

      return orderResult
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
    },
  },

  // Cart
  cart: {
    async findByUserId(userId: string) {
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .select(
          `
          *,
          sequence:sequences(
            *,
            seller:profiles!sequences_seller_id_fkey(username)
          )
        `
        )
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
    },
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
    },
  },

  // Profiles
  downloads: {
    async findMany(userId?: string) {
      let query = supabaseAdmin
        .from('downloads')
        .select(
          `
          *,
          sequences (
            id,
            title,
            thumbnail_url,
            file_url
          )
        `
        )
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    },

    async create(download: any) {
      const { data, error } = await supabaseAdmin
        .from('downloads')
        .insert(download)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(id: string, updates: any) {
      const { data, error } = await supabaseAdmin
        .from('downloads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async incrementDownloadCount(id: string) {
      const { data, error } = await supabaseAdmin.rpc(
        'increment_download_count',
        { download_id: id }
      )

      if (error) throw error
      return data
    },
  },

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
    },
  },
}
