use std::{
    env,
    sync::{
        atomic::{AtomicUsize},
        Arc,
    },
};

use actix::*;
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{
    web,
    App,
    HttpServer,
    middleware::Logger,
    cookie::SameSite,
};

use sqlx::postgres::PgPool;

mod controllers;
mod db;
mod html;
mod server;
mod session;
mod test;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let app_state = Arc::new(AtomicUsize::new(0));

    let pool: PgPool = PgPool::connect(
        &env::var("DATABASE_URL")
            .unwrap_or("postgres://postgres:1234@localhost:5432/flettex".to_string()),
    )
    .await
    .expect("Failed to create pool");

    let server = server::ChatServer::new(app_state.clone()).start();

    let is_dev = match env::var("RAILWAY_STATIC_URL") {
        Ok(_) => false,
        Err(_) => true,
    };

    log::info!(
        "{:?}",
        format!(
            "starting HTTP server at {:?}",
            if is_dev {
                "http://localhost:8080"
            } else {
                "production url"
            }
        )
    );

    HttpServer::new(move || {
        let policy = CookieIdentityPolicy::new(&[0; 32])
            .name("auth-cookie")
            .same_site(SameSite::Lax)
            .http_only(true)
            .secure(if is_dev {false} else {true});
        App::new()
            .app_data(web::Data::from(app_state.clone()))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(server.clone()))
            .configure(controllers::config)
            .wrap(IdentityService::new(policy))
            .wrap(Logger::default())
    })
    .workers(2)
    .bind((if is_dev { "127.0.0.1" } else { "0.0.0.0" }, 8080))?
    .run()
    .await
}
