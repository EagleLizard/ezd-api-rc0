
create table keychain (
  key_id SERIAL PRIMARY KEY,

  key_text TEXT NOT NULL,
  iv TEXT NOT NULL,

  password_id uuid references passwords(password_id) NOT NULL
);
