use sqlx::{
    PgPool,
    types::{
        Uuid
    }
};
use crate::server;

pub async fn add_user(usr: server::SignUpEvent, pool: &PgPool) -> sqlx::Result<Uuid> {
    let rec = sqlx::query!(
        r#"
INSERT INTO users ( username, email, password )
VALUES ( $1, $2, $3 )
RETURNING id
        "#,
        usr.username,
        usr.email,
        usr.password
    )
    .fetch_one(pool)
    .await?;

    let rec = sqlx::query!(
        r#"
INSERT INTO user_sessions ( userid )
VALUES ( $1 )
RETURNING id
        "#,
        rec.id
    )
    .fetch_one(pool)
    .await?;

    Ok(rec.id)
}