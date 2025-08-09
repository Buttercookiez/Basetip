-- Create tip_links and transactions tables
create table if not exists tip_links (
  id uuid primary key default gen_random_uuid(),
  thread_link text not null,
  wallet_address text not null,
  created_at timestamp with time zone default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  tip_id uuid references tip_links(id) on delete cascade,
  tx_hash text not null,
  from_address text,
  to_address text,
  amount_eth text,
  created_at timestamp with time zone default now()
);

-- Enable RLS and add open policies for demo/hackathon
alter table tip_links enable row level security;
create policy "public_select" on tip_links for select using (true);
create policy "public_insert" on tip_links for insert with check (true);

alter table transactions enable row level security;
create policy "public_select_tx" on transactions for select using (true);
create policy "public_insert_tx" on transactions for insert with check (true);
