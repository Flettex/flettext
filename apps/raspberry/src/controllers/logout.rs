use actix_web::{
    web,
    HttpResponse,
    http::{StatusCode, header::ContentType}
};
use actix_identity::Identity;
use sqlx::PgPool;

use crate::db;

pub async fn delete(
    id: Identity,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    if let Some(session_id) = id.identity() {
        match db::logout::delete_session(
            sqlx::types::Uuid::parse_str(&session_id).unwrap(),
            pool.as_ref(),
        )
        .await
        {
            Ok(_) => {
                id.forget();
                HttpResponse::Ok().finish()
            }
            Err(_) => HttpResponse::build(StatusCode::BAD_REQUEST)
                .content_type(ContentType::plaintext())
                .body("Bad request"),
        }
    } else {
        HttpResponse::Ok().finish()
    }
}