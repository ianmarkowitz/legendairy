-- ─────────────────────────────────────────────────────────────────────────────
-- REFINEMENTS — shipping status + tracking
-- ─────────────────────────────────────────────────────────────────────────────

-- 4. Add 'shipped' status + tracking columns
alter type order_status add value if not exists 'shipped';
alter table orders add column if not exists tracking_number  text;
alter table orders add column if not exists shipped_at       timestamptz;

-- 5. Add carrier column for shipping notifications
alter table orders add column if not exists tracking_carrier text check (tracking_carrier in ('UPS', 'USPS', 'FedEx', 'Other'));
