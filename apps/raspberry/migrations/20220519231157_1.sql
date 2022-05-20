-- Add migration script here
-- CREATE TABLE IF NOT EXISTS users
-- (
--     id          BIGSERIAL PRIMARY KEY,
    
-- );
CREATE TABLE IF NOT EXISTS todos
(
    id          BIGSERIAL PRIMARY KEY,
    description TEXT    NOT NULL,
    done        BOOLEAN NOT NULL DEFAULT FALSE
);