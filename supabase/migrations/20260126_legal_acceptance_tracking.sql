-- Legal Document Acceptance Tracking
-- This migration adds columns to track when sellers accept legal documents and which versions

-- Add acceptance tracking columns to seller_onboarding_progress table
alter table public.seller_onboarding_progress
add column if not exists terms_accepted_at timestamptz,
add column if not exists privacy_accepted_at timestamptz,
add column if not exists terms_version_accepted text default '1.0',
add column if not exists privacy_version_accepted text default '1.0',
add column if not exists community_guidelines_accepted_at timestamptz,
add column if not exists seller_agreement_accepted_at timestamptz;

-- Add comments to document the columns
comment on column public.seller_onboarding_progress.terms_accepted_at is 'Timestamp when seller accepted Terms of Service';
comment on column public.seller_onboarding_progress.privacy_accepted_at is 'Timestamp when seller accepted Privacy Policy';
comment on column public.seller_onboarding_progress.terms_version_accepted is 'Version of Terms of Service that was accepted';
comment on column public.seller_onboarding_progress.privacy_version_accepted is 'Version of Privacy Policy that was accepted';
comment on column public.seller_onboarding_progress.community_guidelines_accepted_at is 'Timestamp when seller accepted Community Guidelines';
comment on column public.seller_onboarding_progress.seller_agreement_accepted_at is 'Timestamp when seller accepted Seller Agreement';

-- Create index for querying by acceptance timestamps
create index if not exists seller_onboarding_terms_accepted_idx
on public.seller_onboarding_progress(terms_accepted_at);

create index if not exists seller_onboarding_privacy_accepted_idx
on public.seller_onboarding_progress(privacy_accepted_at);

-- Update the complete_seller_onboarding function to set acceptance timestamps
create or replace function public.complete_seller_onboarding()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
  _current_timestamp timestamptz := now();
begin
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Update onboarding progress with acceptance timestamps if not already set
  update public.seller_onboarding_progress
  set
    is_completed = true,
    completed_at = _current_timestamp,
    current_step = 7,
    terms_accepted_at = coalesce(terms_accepted_at, _current_timestamp),
    privacy_accepted_at = coalesce(privacy_accepted_at, _current_timestamp),
    community_guidelines_accepted_at = coalesce(community_guidelines_accepted_at, _current_timestamp),
    seller_agreement_accepted_at = coalesce(seller_agreement_accepted_at, _current_timestamp),
    terms_version_accepted = coalesce(terms_version_accepted, '1.0'),
    privacy_version_accepted = coalesce(privacy_version_accepted, '1.0')
  where id = _user_id;

  -- Ensure seller_profile exists
  if not exists (select 1 from public.seller_profiles where id = _user_id) then
    raise exception 'Seller profile does not exist';
  end if;
end;
$$;

-- Create a function to record legal acceptance during onboarding
create or replace function public.record_legal_acceptance(
  p_terms_accepted boolean default false,
  p_privacy_accepted boolean default false,
  p_community_guidelines_accepted boolean default false,
  p_seller_agreement_accepted boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
  _current_timestamp timestamptz := now();
begin
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Update acceptance timestamps for checked agreements
  update public.seller_onboarding_progress
  set
    terms_accepted_at = case
      when p_terms_accepted and terms_accepted_at is null then _current_timestamp
      else terms_accepted_at
    end,
    privacy_accepted_at = case
      when p_privacy_accepted and privacy_accepted_at is null then _current_timestamp
      else privacy_accepted_at
    end,
    community_guidelines_accepted_at = case
      when p_community_guidelines_accepted and community_guidelines_accepted_at is null then _current_timestamp
      else community_guidelines_accepted_at
    end,
    seller_agreement_accepted_at = case
      when p_seller_agreement_accepted and seller_agreement_accepted_at is null then _current_timestamp
      else seller_agreement_accepted_at
    end,
    terms_version_accepted = case
      when p_terms_accepted then '1.0'
      else terms_version_accepted
    end,
    privacy_version_accepted = case
      when p_privacy_accepted then '1.0'
      else privacy_version_accepted
    end
  where id = _user_id;
end;
$$;

-- Grant execute permissions
grant execute on function public.record_legal_acceptance to authenticated;

-- Add audit log table for legal document updates (optional but recommended)
create table if not exists public.legal_acceptance_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (document_type in ('terms_of_service', 'privacy_policy', 'community_guidelines', 'seller_agreement')),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,

  created_at timestamptz not null default now()
);

-- Enable RLS on audit log
alter table public.legal_acceptance_audit_log enable row level security;

-- RLS policies for audit log (users can only see their own records)
create policy "Users can view own legal acceptance audit log"
on public.legal_acceptance_audit_log
for select
to authenticated
using (user_id = auth.uid());

-- Only the system can insert into audit log
create policy "System can insert legal acceptance audit log"
on public.legal_acceptance_audit_log
for insert
to authenticated
with check (user_id = auth.uid());

-- Create indexes for audit log
create index if not exists legal_audit_log_user_idx on public.legal_acceptance_audit_log(user_id);
create index if not exists legal_audit_log_document_type_idx on public.legal_acceptance_audit_log(document_type);
create index if not exists legal_audit_log_accepted_at_idx on public.legal_acceptance_audit_log(accepted_at);

-- Function to log legal acceptance
create or replace function public.log_legal_acceptance(
  p_document_type text,
  p_document_version text default '1.0',
  p_ip_address inet default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _user_id uuid := auth.uid();
  _log_id uuid;
begin
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Insert audit log entry
  insert into public.legal_acceptance_audit_log (
    user_id,
    document_type,
    document_version,
    ip_address,
    user_agent
  ) values (
    _user_id,
    p_document_type,
    p_document_version,
    p_ip_address,
    p_user_agent
  )
  returning id into _log_id;

  return _log_id;
end;
$$;

-- Grant execute permissions
grant execute on function public.log_legal_acceptance to authenticated;

-- Add comment to explain the audit log table
comment on table public.legal_acceptance_audit_log is 'Audit trail of legal document acceptances for compliance and record-keeping';

-- Create a view for active legal acceptances (most recent for each document type)
create or replace view public.current_legal_acceptances as
select distinct on (user_id, document_type)
  user_id,
  document_type,
  document_version,
  accepted_at
from public.legal_acceptance_audit_log
order by user_id, document_type, accepted_at desc;

-- Grant view access
grant select on public.current_legal_acceptances to authenticated;

-- Add RLS policy for the view
alter view public.current_legal_acceptances set (security_invoker = on);
