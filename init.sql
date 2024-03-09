
CREATE EXTENSION pgcrypto;

create table users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table passwords (
  password_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  
  user_id uuid references users(user_id) NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create type addr_type_enum AS ENUM ('local', 'global');

create table ping_addr (
  ping_addr_id SERIAL PRIMARY KEY,
  addr TEXT NOT NULL UNIQUE,
  addr_type addr_type_enum NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table ping (
  ping_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- src_addr TEXT NOT NULL,
  src_addr_id INT references ping_addr(ping_addr_id) NOT NULL,
  bytes SMALLINT NOT NULL,
  -- addr TEXT NOT NULL,
  addr_id INT references ping_addr(ping_addr_id) NOT NULL,
  seq INT NOT NULL,
  ttl SMALLINT NOT NULL,
  time float(32) NOT NULL,
  time_unit TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


/*

2
4
10
11

SRC (e.g. local)
1
3
5
12

1
2
3
4
5
10
11
12

*/


/*

2
4
5

SRC (e.g local)
1
3

*/