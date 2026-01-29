import React from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, ArrowRight, User, Sparkles } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface WelcomeCardProps {
  user: SupabaseUser | null;
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">Buyer Dashboard</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome back, {firstName}! ✨
        </h1>
        <p className="text-blue-100 text-lg max-w-xl mb-8 leading-relaxed">
          Ready to light up your display? Your recent orders, saved sequences, and personalized recommendations are all right here.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link
            href="/sequences"
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-bold transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Browse Marketplace
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/30 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" />
            View Cart
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-2 px-6 py-3 text-white/90 hover:text-white font-semibold transition-colors group"
          >
            Track Orders
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      
      {/* Visual illustration or icon could go here on large screens */}
    </div>
  );
}
