create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('poet', 'cititor')),
  created_at timestamptz not null default now()
);

create table if not exists galleries (
  id serial primary key,
  author_id integer not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (author_id, name)
);

create table if not exists poems (
  id serial primary key,
  author_id integer references users(id) on delete set null,
  gallery_id integer references galleries(id) on delete set null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);
