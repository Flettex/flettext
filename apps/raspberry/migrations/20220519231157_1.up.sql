-- Add migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- idk how to make many to many relationships

CREATE TABLE IF NOT EXISTS users (
    user_id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username        TEXT NOT NULL UNIQUE CHECK (char_length(username) <= 64),
    email           TEXT NOT NULL UNIQUE CHECK (char_length(email) <= 191),
    password        TEXT NOT NULL,
    profile         TEXT,
    created_at      TIMESTAMP DEFAULT current_timestamp,
    description     TEXT CHECK (char_length(description) <= 255),
    allow_login     BOOLEAN NOT NULL DEFAULT TRUE,
    friends         BIGINT[]
    -- online          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id      uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    userid          BIGINT NOT NULL,
    CONSTRAINT fk_user_sessions FOREIGN KEY(userid) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS todos (
    id              BIGSERIAL PRIMARY KEY,
    description     TEXT NOT NULL,
    done            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS posts (
    post_id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at      TIMESTAMP DEFAULT current_timestamp,
    updated_at      TIMESTAMP DEFAULT current_timestamp,
    title           TEXT NOT NULL CHECK (char_length(title) <= 255),
    content         TEXT,
    published       BOOLEAN DEFAULT FALSE,
    authorid        BIGINT NOT NULL,
    CONSTRAINT fk_user_posts FOREIGN KEY(authorid) REFERENCES users(user_id) ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS guilds (

-- );

-- CREATE TABLE IF NOT EXISTS members (
--     member_id       BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     userid          BIGINT NOT NULL,
--     guildid         BIGINT NOT NULL,
--     permissions     INT DEFAULT 0,
--     joined_at       TIMESTAMP DEFAULT current_timestamp,
--     CONSTRAINT fk_user_members FOREIGN KEY(userid) REFERENCES users(user_id) ON DELETE CASCADE,
--     CONSTRAINT fk_guild_members FOREIGN KEY(guildid) REFERENCES guilds(guild_id) ON DELETE CASCADE
-- );