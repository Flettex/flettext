use actix_identity::{Identity};
use actix_web::{
    http::{header::ContentType, StatusCode},
    web, HttpResponse
};

use argon2::{
    password_hash::{
        PasswordHash, PasswordVerifier
    },
    Argon2
};

use sqlx::postgres::PgPool;

use crate::server;
use crate::db;

pub async fn post(
    body: web::Json<server::LoginEvent>,
    pool: web::Data<PgPool>,
    id: Identity,
) -> HttpResponse {
    if let Some(_) = id.identity() {
        return HttpResponse::Ok().finish();
    }
    let pl = body.into_inner();
    let argon2 = Argon2::default();
    match db::login::get_user_and_password(pl.email, pool.as_ref()).await {
        Ok((user_id, password)) => {
            if argon2.verify_password(pl.password.as_bytes(), &PasswordHash::new(&password).unwrap()).is_ok() {
                match db::login::create_session(user_id, pool.as_ref()).await {
                    Ok(session_id) => {
                        id.remember(session_id.to_string());
                        HttpResponse::Ok().finish()
                    }
                    Err(err) => {
                        println!("{}", err);
                        HttpResponse::build(StatusCode::BAD_REQUEST)
                            .content_type(ContentType::plaintext())
                            .body("DB failed to create session")
                    } 
                }
            } else {
                HttpResponse::build(StatusCode::BAD_REQUEST)
                    .content_type(ContentType::plaintext())
                    .body("Password does not match")
            }
        }
        Err(err) => {
            println!("{}", err);
            HttpResponse::build(StatusCode::BAD_REQUEST)
                .content_type(ContentType::plaintext())
                .body("Email is not in record")
        }
    }
}