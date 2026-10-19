-- GIPSUM · BASMAS UKKI PENS — jalankan di Supabase: SQL Editor > New query > Run

create table public.donors (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null check (char_length(nama) between 2 and 100),
  whatsapp   text,                      -- PRIVAT: hanya bendahara
  email      text,                      -- PRIVAT: hanya bendahara
  tipe       text not null check (tipe in ('Donatur Tetap','Donasi Sekali')),
  frekuensi  text default '-',
  program    text not null,
  nominal    bigint not null check (nominal >= 1000),
  metode     text not null,
  catatan    text,
  anonim     boolean not null default false,
  status     text not null default 'pending' check (status in ('pending','verified')),
  created_at timestamptz not null default now()
);

create table public.expenses (
  id         uuid primary key default gen_random_uuid(),
  tanggal    date not null default current_date,
  program    text not null,
  keterangan text not null,
  jumlah     bigint not null check (jumlah > 0),
  created_at timestamptz not null default now()
);

create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);

create function public.is_admin() returns boolean
language sql security definer set search_path = public stable
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

alter table public.donors   enable row level security;
alter table public.expenses enable row level security;
alter table public.admins   enable row level security;

-- Donor: siapa pun boleh mendaftar (hanya status pending), hanya bendahara yang bisa baca/ubah
create policy donors_insert on public.donors for insert to anon, authenticated
  with check (status = 'pending');
create policy donors_admin on public.donors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Pengeluaran: publik boleh baca (transparansi), hanya bendahara yang menulis
create policy expenses_read  on public.expenses for select to anon, authenticated using (true);
create policy expenses_admin on public.expenses for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Tampilan publik donatur: tanpa kontak, nama otomatis jadi "Hamba Allah" bila anonim
create view public.donors_public with (security_invoker = false) as
  select id, case when anonim then 'Hamba Allah' else nama end as nama,
         tipe, program, nominal, status, created_at
  from public.donors;
grant select on public.donors_public to anon, authenticated;

-- Setelah membuat akun bendahara di Authentication > Users, jalankan (ganti emailnya):
-- insert into public.admins select id from auth.users where email = 'bendahara@contoh.com';
