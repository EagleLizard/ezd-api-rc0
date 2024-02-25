
create table users (
  id INT PRIMARY KEY NOT NULL, 
  name TEXT NOT NULL
);

create table ping (
  ping_id uuid DEFAULT gen_random_uuid(),
  bytes SMALLINT NOT NULL,
  addr TEXT NOT NULL,
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
