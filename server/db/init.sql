create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('poet', 'cititor')),
  created_at timestamptz not null default now()
);

create table if not exists poems (
  id serial primary key,
  author_id integer references users(id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);
