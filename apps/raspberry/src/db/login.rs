use sqlx::{
    PgPool,
    types::{
        Uuid
    }
};

pub async fn create_session(user_id: i64, pool: &PgPool) -> sqlx::Result<Uuid> {
    match sqlx::query!(
        r#"
INSERT INTO user_sessions ( userid )
VALUES ( $1 )
RETURNING session_id
        "#,
        user_id
    )
    .fetch_one(pool)
    .await {
        Ok(rec) => Ok(rec.session_id),
        Err(err) => Err(err)
    }
}

pub async fn get_user_and_password(email: String, pool: &PgPool) -> sqlx::Result<(i64, String)> {
    match sqlx::query!(
        r#"
SELECT user_id, password FROM users WHERE email = $1
        "#,
        email
    )
    .fetch_one(pool)
    .await {
        Ok(rec) => Ok((rec.user_id, rec.password)),
        Err(err) => Err(err)
    }
}