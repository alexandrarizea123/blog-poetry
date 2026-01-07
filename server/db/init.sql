create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('poet', 'cititor')),
  created_at timestamptz not null default now()
);
