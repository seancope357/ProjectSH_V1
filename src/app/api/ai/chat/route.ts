
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSystemPrompt, LuminaContext } from '@/lib/ai/lumina';
import { supabaseAdmin } from '@/lib/supabase-db';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role === 'SELLER' ? 'SELLER' : 'BUYER';
    
    let context: LuminaContext = { role };
    
    if (role === 'SELLER' && user) {
      // Fetch seller context
      const [{ data: profile }, { data: sequences }] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
        supabaseAdmin.from('sequences').select('title, description, tags, price, status').eq('seller_id', user.id).limit(10)
      ]);
      
      context.userData = { profile, sequences };
    } else {
      // Fetch buyer/marketplace context
      const { data: categories } = await supabaseAdmin.from('categories').select('name').limit(10);
      context.marketplaceData = { 
        availableCategories: categories?.map(c => c.name) || [],
        platformName: 'SequenceHUB',
        description: 'Premium LED Sequence Marketplace'
      };
    }

    const result = streamText({
      model: openai('gpt-4o'),
      messages,
      system: getSystemPrompt(context),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Lumina Chat Error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
