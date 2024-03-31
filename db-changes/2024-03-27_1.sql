

-- 0 = most privileged
-- 1 = least privileged
alter table user_roles add privilege_level int default 1 NOT NULL;
