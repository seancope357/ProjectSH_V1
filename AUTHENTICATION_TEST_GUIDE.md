# Authentication Testing Guide

## Test Scenarios

### 1. Registration Flow
- [ ] Visit `/auth/register`
- [ ] Test email/password registration
- [ ] Verify email confirmation (if enabled)
- [ ] Check if user is redirected to role selection page

### 2. Login Flow
- [ ] Visit `/auth/signin`
- [ ] Test email/password login
- [ ] Verify successful login redirects to home page
- [ ] Test "Remember me" functionality

### 3. Role Selection
- [ ] After registration, verify role selection page appears
- [ ] Test selecting different roles (BUYER, SELLER, ADMIN)
- [ ] Verify role is saved to user metadata

### 4. Role-Based Access Control
- [ ] **Admin Access**: Try accessing `/admin` with different roles
  - Should allow: ADMIN
  - Should redirect: BUYER, SELLER, unauthenticated
- [ ] **Seller Access**: Try accessing `/seller/dashboard` and `/seller/upload`
  - Should allow: SELLER, ADMIN
  - Should redirect: BUYER, unauthenticated
- [ ] **General Access**: Verify all users can access public pages

### 5. Logout Flow
- [ ] Test logout functionality
- [ ] Verify user is redirected to home page
- [ ] Verify protected pages redirect to login after logout

### 6. Session Persistence
- [ ] Login and refresh the page
- [ ] Close and reopen browser tab
- [ ] Verify session persists correctly

## Current Implementation Status

✅ **Completed**:
- All client components migrated from NextAuth to Supabase
- Role-based access control implemented
- API routes using Supabase authentication
- Middleware configured for Supabase

🔄 **In Progress**:
- Testing authentication flows

⏳ **Pending**:
- Cleanup NextAuth dependencies