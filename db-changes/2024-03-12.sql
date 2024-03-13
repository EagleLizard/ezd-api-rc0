
create table jwt_sessions (
  jwt_session_id SERIAL PRIMARY KEY,
  valid BOOLEAN NOT NULL DEFAULT TRUE,

  user_id uuid references users(user_id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table sessions (
  sid TEXT PRIMARY KEY NOT NULL UNIQUE,
  sess json NOT NULL,
  expire TIMESTAMP NOT NULL
);
