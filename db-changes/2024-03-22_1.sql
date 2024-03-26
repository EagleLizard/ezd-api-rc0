
create table user_roles (
  role_id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

alter table users add role_id int references user_roles(role_id);

insert into user_roles (role_name) values('Admin');
insert into user_roles (role_name) values('User');

-- after assigning roles to current users:
alter table users alter column role_id set not null; 
