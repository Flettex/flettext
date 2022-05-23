use sqlx::{
    PgPool,
    types::{
        Uuid
    }
};

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHasher,
        SaltString,
        Error
    },
    Argon2
};

pub fn create_password(password: String) -> Result<String, Error> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    match argon2.hash_password(password.as_bytes(), &salt) {
        Ok(hash) => Ok(hash.to_string()),
        Err(err) => Err(err)
    }
}

pub async fn create_user(username: String, email: String, password_hash: String, pool: &PgPool) -> sqlx::Result<Uuid> {
    match sqlx::query!(
        r#"
INSERT INTO users ( username, email, password )
VALUES ( $1, $2, $3 )
RETURNING user_id
        "#,
        username,
        email,
        password_hash
    )
        .fetch_one(pool)
        .await {
        Ok(rec) => {
            Ok(
                // this query cannot error...
                sqlx::query!(
                    r#"
INSERT INTO user_sessions ( userid )
VALUES ( $1 )
RETURNING session_id
                    "#,
                    rec.user_id
                )
                .fetch_one(pool)
                .await?
                .session_id
            )
        }
        Err(e) => Err(e),
    }
}