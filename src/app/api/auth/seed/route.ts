import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-db'

async function ensureUser(email: string, password: string, username: string, fullName: string, role: 'SELLER' | 'USER') {
  const { data: existing, error: getErr } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .limit(1)
    .maybeSingle()

  if (getErr) throw getErr

  let userId = existing?.id

  if (!userId) {
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) throw createErr
    userId = created.user?.id as string

    const { error: insertErr } = await supabaseAdmin
      .from('profiles')
      .insert({ id: userId, username, full_name: fullName, role })
    if (insertErr) throw insertErr
  } else {
    const { error: upErr } = await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName, role })
      .eq('id', userId)
    if (upErr) throw upErr
  }

  return userId!
}

async function ensureCategory(name: string) {
  const { data: existing, error: getErr } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('name', name)
    .limit(1)
    .maybeSingle()
  if (getErr) throw getErr
  if (existing?.id) return existing.id as string
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('categories')
    .insert({ name })
    .select('id')
    .single()
  if (insErr) throw insErr
  return inserted.id as string
}

export async function GET(request: NextRequest) {
  // Dev-only safety
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Disabled outside development' }, { status: 403 })
  }

  try {
    // 1) Users
    const seller1Id = await ensureUser('seller1@example.com', 'Seller1!pass', 'seller1', 'Seller One', 'SELLER')
    const seller2Id = await ensureUser('seller2@example.com', 'Seller2!pass', 'seller2', 'Seller Two', 'SELLER')
    const seller3Id = await ensureUser('seller3@example.com', 'Seller3!pass', 'seller3', 'Seller Three', 'SELLER')
    const buyer1Id  = await ensureUser('buyer1@example.com',  'Buyer1!pass',  'buyer1',  'Buyer One',  'USER')

    // 2) Categories
    const catHoliday  = await ensureCategory('Holiday & Seasonal')
    const catHalloween = await ensureCategory('Halloween')
    const catNewYear  = await ensureCategory('New Year')

    // 3) Sequences (ensure unique titles to avoid duplicates on re-run)
    const sequencesToCreate = [
      {
        title: 'Christmas Wonderland',
        description: 'Magical Christmas sequence with twinkling effects and smooth transitions.',
        price: 12.99,
        category_id: catHoliday,
        seller_id: seller1Id,
        status: 'published',
        is_active: true,
        is_approved: true,
        thumbnail_url: '/images/sequence-preview-default.jpg',
        preview_url: '/images/sequence-preview-default.jpg',
      },
      {
        title: 'Haunted Night',
        description: 'Spooky Halloween sequence with eerie glows and pulsating beats.',
        price: 9.99,
        category_id: catHalloween,
        seller_id: seller2Id,
        status: 'published',
        is_active: true,
        is_approved: true,
        thumbnail_url: '/images/sequence-preview-default.jpg',
        preview_url: '/images/sequence-preview-default.jpg',
      },
      {
        title: 'New Year Spark',
        description: 'Festive New Year sequence with fireworks-like bursts.',
        price: 14.99,
        category_id: catNewYear,
        seller_id: seller3Id,
        status: 'published',
        is_active: true,
        is_approved: true,
        thumbnail_url: '/images/sequence-preview-default.jpg',
        preview_url: '/images/sequence-preview-default.jpg',
      },
    ]

    for (const seq of sequencesToCreate) {
      const { data: existing, error: selErr } = await supabaseAdmin
        .from('sequences')
        .select('id')
        .eq('title', seq.title)
        .limit(1)
        .maybeSingle()
      if (selErr) throw selErr
      if (!existing) {
        const { error: insErr } = await supabaseAdmin.from('sequences').insert(seq)
        if (insErr) throw insErr
      }
    }

    const { data: sequences, error: listErr } = await supabaseAdmin
      .from('sequences')
      .select('id,title')
      .in('title', sequencesToCreate.map(s => s.title))
    if (listErr) throw listErr

    const idByTitle: Record<string, string> = {}
    for (const s of sequences || []) idByTitle[s.title] = s.id

    // 4) Reviews by buyer
    const reviewsToCreate = [
      { title: 'Christmas Wonderland', rating: 5, comment: 'Absolutely stunning! Smooth transitions and great pacing.' },
      { title: 'Haunted Night',       rating: 4, comment: 'Spooky and fun. Needed minor mapping tweaks.' },
    ]
    for (const r of reviewsToCreate) {
      const seqId = idByTitle[r.title]
      if (!seqId) continue
      const { data: existing, error: revSelErr } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('user_id', buyer1Id)
        .eq('sequence_id', seqId)
        .limit(1)
        .maybeSingle()
      if (revSelErr) throw revSelErr
      if (!existing) {
        const { error: revInsErr } = await supabaseAdmin
          .from('reviews')
          .insert({ user_id: buyer1Id, sequence_id: seqId, rating: r.rating, comment: r.comment })
        if (revInsErr) throw revInsErr
      }
    }

    // 5) Order for buyer
    const prices = [12.99, 9.99]
    const subtotal = prices.reduce((a, b) => a + b, 0)
    const tax = Number((subtotal * 0.08).toFixed(2))
    const platform_fee = 1.0
    const total = Number((subtotal + tax + platform_fee).toFixed(2))

    let orderId: string | null = null
    const { data: existingOrder, error: ordSelErr } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('user_id', buyer1Id)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle()
    if (ordSelErr) throw ordSelErr
    if (!existingOrder) {
      const { data: order, error: ordInsErr } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: buyer1Id,
          stripe_payment_intent_id: 'pi_test_123',
          status: 'completed',
          subtotal,
          tax,
          platform_fee,
          total,
          currency: 'USD',
        })
        .select('id')
        .single()
      if (ordInsErr) throw ordInsErr
      orderId = order.id
    } else {
      orderId = existingOrder.id
    }

    if (orderId) {
      const oi = [] as Array<{ order_id: string; sequence_id: string; quantity: number; price: number; seller_payout: number }>
      const cwId = idByTitle['Christmas Wonderland']
      const hnId = idByTitle['Haunted Night']
      if (cwId) oi.push({ order_id: orderId, sequence_id: cwId, quantity: 1, price: 12.99, seller_payout: 10.0 })
      if (hnId) oi.push({ order_id: orderId, sequence_id: hnId, quantity: 1, price: 9.99, seller_payout: 7.5 })

      for (const item of oi) {
        const { data: existing, error: oiSelErr } = await supabaseAdmin
          .from('order_items')
          .select('id')
          .eq('order_id', item.order_id)
          .eq('sequence_id', item.sequence_id)
          .limit(1)
          .maybeSingle()
        if (oiSelErr) throw oiSelErr
        if (!existing) {
          const { error: oiInsErr } = await supabaseAdmin.from('order_items').insert(item)
          if (oiInsErr) throw oiInsErr
        }
      }

      // 6) Downloads for buyer
      const downloads = [
        { sequence_id: cwId, download_url: 'https://example.com/downloads/christmas.zip' },
        { sequence_id: hnId, download_url: 'https://example.com/downloads/halloween.zip' },
      ].filter(d => !!d.sequence_id)
      for (const d of downloads) {
        const { data: existing, error: dlSelErr } = await supabaseAdmin
          .from('downloads')
          .select('id')
          .eq('user_id', buyer1Id)
          .eq('sequence_id', d.sequence_id as string)
          .limit(1)
          .maybeSingle()
        if (dlSelErr) throw dlSelErr
        if (!existing) {
          const { error: dlInsErr } = await supabaseAdmin
            .from('downloads')
            .insert({ user_id: buyer1Id, sequence_id: d.sequence_id as string, order_id: orderId, download_url: d.download_url })
          if (dlInsErr) throw dlInsErr
        }
      }
    }

    return NextResponse.json({
      ok: true,
      users: [
        { email: 'seller1@example.com', password: 'Seller1!pass' },
        { email: 'seller2@example.com', password: 'Seller2!pass' },
        { email: 'seller3@example.com', password: 'Seller3!pass' },
        { email: 'buyer1@example.com',  password: 'Buyer1!pass' },
      ],
      sequences: Object.keys(idByTitle),
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 })
  }
}