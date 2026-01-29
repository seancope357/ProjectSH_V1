import { createClient } from '@/lib/supabase/server'

export async function getSequences() {
  const supabase = createClient()
  const { data: sequences, error } = await supabase.from('sequences').select('*')

  if (error) {
    console.error('Error fetching sequences:', error)
    return []
  }

  return sequences.map(seq => ({
    id: seq.id,
    title: seq.title,
    description: seq.description,
    price: seq.price,
    image: seq.thumbnail_url || seq.preview_url || seq.file_url,
    badge: undefined,
    rating: seq.rating || 0,
    seller: 'Unknown Seller',
    downloads: seq.purchases_count || 0,
    duration: 'N/A',
    props: seq.props_used || [],
  }))
}