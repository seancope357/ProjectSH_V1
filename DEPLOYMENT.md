# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `POSTGRES_PRISMA_URL` - Pooled connection for Prisma
- [ ] `POSTGRES_URL_NON_POOLING` - Direct connection
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (use live keys for production)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `NEXTAUTH_URL` - Your app's URL
- [ ] `NEXTAUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- [ ] `NEXT_PUBLIC_APP_URL` - Your app's public URL

### ✅ Supabase Configuration
- [ ] Database schema deployed (run `npx prisma db push`)
- [ ] Row Level Security (RLS) policies configured
- [ ] Storage buckets created for sequence files
- [ ] Authentication providers enabled (Google OAuth)
- [ ] Site URL and redirect URLs configured

### ✅ Stripe Configuration
- [ ] Webhook endpoint configured: `https://your-app.vercel.app/api/webhooks/stripe`
- [ ] Required webhook events enabled:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `account.updated`
  - `account.application.deauthorized`
- [ ] Connect platform settings configured
- [ ] Test mode vs Live mode keys properly set

### ✅ Google OAuth Configuration
- [ ] OAuth consent screen configured
- [ ] Authorized redirect URIs added:
  - `https://your-app.vercel.app/api/auth/callback/google`
- [ ] Domain verification completed (if required)

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Using Vercel CLI
vercel --prod

# Or push to main branch if auto-deployment is enabled
git push origin main
```

### 2. Run Database Migrations
```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
npx prisma generate
npx prisma db push

# Option 2: Run migration in Vercel function
# Visit: https://your-app.vercel.app/api/migrate
```

### 3. Verify Deployment
- [ ] App loads without errors
- [ ] Authentication works (Google OAuth)
- [ ] Database connections work
- [ ] File uploads work
- [ ] Stripe payments work
- [ ] Webhooks receive events

## Post-Deployment Configuration

### Supabase RLS Policies
Ensure these policies are enabled in your Supabase dashboard:

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Sequences are publicly readable
CREATE POLICY "Sequences are publicly readable" ON sequences
  FOR SELECT USING (true);

-- Only sellers can create sequences
CREATE POLICY "Sellers can create sequences" ON sequences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('SELLER', 'ADMIN')
    )
  );
```

### Storage Policies
```sql
-- Allow authenticated users to upload to sequences bucket
CREATE POLICY "Authenticated users can upload sequences" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sequences' AND 
    auth.role() = 'authenticated'
  );

-- Allow public access to sequence files
CREATE POLICY "Public access to sequences" ON storage.objects
  FOR SELECT USING (bucket_id = 'sequences');
```

## Monitoring and Maintenance

### Health Checks
- [ ] Set up Vercel monitoring
- [ ] Configure Supabase alerts
- [ ] Monitor Stripe webhook delivery
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

### Regular Maintenance
- [ ] Monitor database performance
- [ ] Review and rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Monitor storage usage

## Troubleshooting Common Issues

### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm run build  # Test locally first
npx prisma generate  # Ensure Prisma client is generated
```

### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase project status
- Ensure connection pooling is properly configured
- Verify SSL requirements

### Authentication Issues
- Check Google OAuth redirect URIs
- Verify NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set and secure
- Check Supabase auth settings

### Stripe Webhook Issues
- Verify webhook URL is accessible
- Check webhook signing secret
- Ensure proper CORS headers
- Monitor webhook delivery in Stripe dashboard

### File Upload Issues
- Check Supabase storage bucket permissions
- Verify RLS policies
- Ensure proper CORS configuration
- Check file size limits

## Performance Optimization

### Vercel Optimizations
- [ ] Enable Edge Runtime where possible
- [ ] Configure proper caching headers
- [ ] Use Vercel Analytics
- [ ] Optimize images with Next.js Image component

### Database Optimizations
- [ ] Add proper indexes
- [ ] Use connection pooling
- [ ] Monitor query performance
- [ ] Consider read replicas for high traffic

### Supabase Optimizations
- [ ] Enable realtime only where needed
- [ ] Optimize RLS policies
- [ ] Use proper indexes
- [ ] Monitor database metrics

## Security Checklist

### Production Security
- [ ] Use HTTPS everywhere
- [ ] Implement proper CORS policies
- [ ] Enable security headers
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Regular security audits
- [ ] Monitor for suspicious activity

### Data Protection
- [ ] Implement proper data validation
- [ ] Use parameterized queries
- [ ] Encrypt sensitive data
- [ ] Implement audit logging
- [ ] Regular backups
- [ ] GDPR compliance (if applicable)

## Rollback Plan

### Emergency Rollback
1. Revert to previous Vercel deployment
2. Restore database from backup if needed
3. Update DNS if custom domain is used
4. Notify users of any service interruption

### Gradual Rollback
1. Use Vercel's traffic splitting
2. Monitor error rates
3. Gradually shift traffic back
4. Fix issues and redeploy