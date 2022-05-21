-- Add migration script here

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users
(
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(64) NOT NULL,
    tag         SMALLSERIAL NOT NULL CHECK (tag < 10000),
    email       VARCHAR (191) NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    avatar_url  TEXT DEFAULT NULL,
    created_at  TIMESTAMP DEFAULT current_timestamp,
    bio         VARCHAR(255) DEFAULT NULL,
    archived    BOOLEAN NOT NULL DEFAULT FALSE,
    online      BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (username, tag)
);

CREATE TABLE IF NOT EXISTS user_sessions
(
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    userid      BIGINT NOT NULL,
    CONSTRAINT fk_user_sessions
      FOREIGN KEY(userid) 
	  REFERENCES users(id)
	  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS todos
(
    id          BIGSERIAL PRIMARY KEY,
    description TEXT    NOT NULL,
    done        BOOLEAN NOT NULL DEFAULT FALSE
);