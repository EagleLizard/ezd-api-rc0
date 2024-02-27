
create table users (
  id INT PRIMARY KEY NOT NULL, 
  name TEXT NOT NULL
);

create table ping_addr (
  ping_addr_id SERIAL,
  addr TEXT NOT NULL,

  PRIMARY KEY (ping_addr_id)
);

create table ping (
  ping_id uuid DEFAULT gen_random_uuid(),
  -- src_addr TEXT NOT NULL,
  src_addr_id INT references ping_addr(ping_addr_id) NOT NULL,
  bytes SMALLINT NOT NULL,
  -- addr TEXT NOT NULL,
  addr_id INT references ping_addr(ping_addr_id) NOT NULL,
  seq INT NOT NULL,
  ttl SMALLINT NOT NULL,
  time float(32) NOT NULL,
  time_unit TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (ping_id)
);

insert into users values (
  1,
  'ezd'
);
