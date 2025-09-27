import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseDB {
  // Get all sequences with pagination and filters
  static async getSequences(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    userId?: string;
  } = {}) {
    const { page = 1, limit = 10, category, search, userId } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('sequences')
      .select('*')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (userId) {
      query = query.eq('userId', userId);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data || [];
  }

  // Get sequence by ID
  static async getSequenceById(id: string) {
    const { data, error } = await supabase
      .from('sequences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data;
  }

  // Create new sequence
  static async createSequence(sequenceData: any) {
    const { data, error } = await supabase
      .from('sequences')
      .insert(sequenceData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return data;
  }

  // Update sequence
  static async updateSequence(id: string, updates: any) {
    const { data, error } = await supabase
      .from('sequences')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    return data;
  }

  // Delete sequence
  static async deleteSequence(id: string) {
    const { error } = await supabase
      .from('sequences')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }

    return true;
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data;
  }

  // Get user by ID
  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data;
  }

  // Create or update user
  static async upsertUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase upsert failed: ${error.message}`);
    }

    return data;
  }

  // Create new user
  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return data;
  }

  // Get user orders
  static async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data || [];
  }

  // Create order
  static async createOrder(orderData: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return data;
  }

  // Update order
  static async updateOrder(id: string, updates: any) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    return data;
  }

  // Get order by ID
  static async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data;
  }

  // Search sequences
  static async searchSequences(query: string, options: {
    category?: string;
    limit?: number;
  } = {}) {
    const { category, limit = 20 } = options;

    let supabaseQuery = supabase
      .from('sequences')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.ilike.%${query}%`)
      .limit(limit);

    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    const { data, error } = await supabaseQuery;
    
    if (error) {
      throw new Error(`Supabase search failed: ${error.message}`);
    }

    return data || [];
  }

  // Get sequences by category
  static async getSequencesByCategory(category: string, limit = 10) {
    const { data, error } = await supabase
      .from('sequences')
      .select('*')
      .eq('category', category)
      .limit(limit);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data || [];
  }

  // Get featured sequences
  static async getFeaturedSequences(limit = 10) {
    const { data, error } = await supabase
      .from('sequences')
      .select('*')
      .eq('featured', true)
      .limit(limit);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data || [];
  }

  // Check if database is available
  static async isAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sequences')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  // Generic database operation wrapper
  static async withFallback<T>(
    prismaOperation: () => Promise<T>,
    supabaseOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await prismaOperation();
    } catch (error) {
      console.warn('Prisma operation failed, falling back to Supabase:', error);
      return await supabaseOperation();
    }
  }
}