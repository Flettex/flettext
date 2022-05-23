use actix_identity::{Identity};
use actix_web::{
    http::{header::ContentType, StatusCode},
    web, HttpResponse
};

use sqlx::postgres::PgPool;
use crate::server;
use crate::db::signup::{
    create_user,
    create_password
};

pub async fn post(
    body: web::Json<server::SignUpEvent>,
    pool: web::Data<PgPool>,
    id: Identity,
) -> HttpResponse {
    if let Some(_) = id.identity() {
        return HttpResponse::Ok().finish();
    }
    let pl = body.into_inner();
    match create_password(pl.password) {
        Ok(password_hash) => {
            match create_user(pl.username, pl.email, password_hash, pool.as_ref()).await {
                Ok(session_id) => {
                    id.remember(session_id.to_string());
                    HttpResponse::Ok().finish()
                }
                Err(err) => match err {
                    sqlx::Error::Database(err) => {
                        // duplicate error
                        if err.code() == Some(std::borrow::Cow::Borrowed("25565")) {
                            HttpResponse::build(StatusCode::BAD_REQUEST)
                                .content_type(ContentType::plaintext())
                                .body("Bad request, duplicate")
                        } else {
                            println!("{}", err);
                            if let Some(errcode) = err.code() {
                                HttpResponse::build(StatusCode::BAD_REQUEST)
                                    .content_type(ContentType::plaintext())
                                    .body(format!("Bad request, database error code {}", errcode))
                            } else {
                                HttpResponse::build(StatusCode::BAD_REQUEST)
                                    .content_type(ContentType::plaintext())
                                    .body("Bad request, database error, code unknown")
                            }
                        }
                    }
                    _ => HttpResponse::build(StatusCode::BAD_REQUEST)
                        .content_type(ContentType::plaintext())
                        .body("Bad request, non-database error"),
                },
            }
        }
        Err(_) => {
            HttpResponse::build(StatusCode::BAD_REQUEST)
                .content_type(ContentType::plaintext())
                .body("Unable to hash password")
        }
    }
}