# Deployment Checklist

## Production Checklist

Use this section to quickly validate your live configuration on Vercel.

### Environment (set in Vercel → Project Settings → Environment Variables)

- `NEXT_PUBLIC_APP_URL` = `https://project-sh-v1.vercel.app`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://tgceeslucxaczluzfpqe.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<your-anon-key>`
- `SUPABASE_SERVICE_ROLE_KEY` = `<your-service-role-key>`

### Payments

- Payments are currently disabled and all Stripe endpoints have been removed.

### Supabase Auth Settings

- Site URL: `https://project-sh-v1.vercel.app`
- Redirect URLs:
  - `https://project-sh-v1.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (development)

### Post-Deploy Verification

- Visit `/cart`, add item, click “Proceed to Checkout”
- Confirm checkout flow shows “Checkout temporarily disabled”
- Check `/orders` shows the new order (`subtotal`, `tax`, `platform_fee`, `total`)
- Verify `downloads` entries exist and `sequences.download_count` incremented

## Pre-Deployment Checklist

### ✅ Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `POSTGRES_PRISMA_URL` - Pooled connection for Prisma
- [ ] `POSTGRES_URL_NON_POOLING` - Direct connection
- [ ] `NEXT_PUBLIC_APP_URL` - Your app's public URL

# NextAuth variables are no longer needed - using Supabase authentication

# - [ ] `NEXTAUTH_URL` - Your app's URL

# - [ ] `NEXTAUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)

### ✅ Supabase Configuration

- [ ] Database schema deployed (run `npx prisma db push`)
- [ ] Row Level Security (RLS) policies configured
- [ ] Storage buckets created for sequence files

- [ ] Site URL and redirect URLs configured

<!-- Stripe configuration removed: payments are disabled in this build -->

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
# Visit: https://project-sh-v1.vercel.app/api/migrate
```

### 3. Verify Deployment

- [ ] App loads without errors
- [ ] Authentication works
- [ ] Database connections work
- [ ] File uploads work
- [ ] Checkout is disabled as expected

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

- Verify Supabase project URL and anon key are correct
- Ensure proper OAuth provider configuration in Supabase
- Check Supabase auth settings and policies

<!-- Stripe webhook troubleshooting removed: webhooks are not used -->

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
