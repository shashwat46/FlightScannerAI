create table if not exists public.airlines (
  iata_code char(2) primary key,
  name text not null,
  skytrax_rating int check (skytrax_rating between 1 and 5),
  updated_at timestamptz default now()
);

create table if not exists public.airports (
  iata_code char(3) primary key,
  name text not null,
  skytrax_rating int check (skytrax_rating between 1 and 5),
  updated_at timestamptz default now()
);
