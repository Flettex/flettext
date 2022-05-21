use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Instant,
    // string::String
    env
};

use actix::*;
use actix_web::{
    middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder,
};
use actix_web_actors::ws;

use sqlx::postgres::PgPool;

mod server;
mod html;
mod session;
mod db;

async fn health_check() -> impl Responder {
    HttpResponse::Ok()
}

async fn index() -> impl Responder {
    HttpResponse::Ok().content_type("text/html").body(html::HTML_STR)
    // NamedFile::open_async("./test/index.html").await.unwrap()
}

async fn message_route(
    body: web::Json<server::ClientEvent>,
    srv: web::Data<Addr<server::ChatServer>>
) -> impl Responder /* Result<HttpResponse, Error> */ {
    // println!("Event: {}", body.event_name);
    srv.get_ref().do_send(body.into_inner());
    HttpResponse::Ok()
    // Ok(HttpResponse::Ok().content_type("text/plain").body("Test"))
}

async fn chat_route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<server::ChatServer>>,
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, Error> {
    // println!("{}", pool.is_closed());
    ws::start(
        session::WsChatSession {
            id: 0,
            hb: Instant::now(),
            room: "Main".to_owned(),
            name: None,
            addr: srv.get_ref().clone(),
            authenticated: false,
            handle: None,
            pool: pool.get_ref().clone(),
        },
        &req,
        stream,
    )
}

async fn get_count(count: web::Data<AtomicUsize>) -> impl Responder {
    let current_count = count.load(Ordering::SeqCst);
    format!("Visitors: {}", current_count)
}

// async fn add_todo(pool: &PgPool, description: String) -> sqlx::Result<i64> {
//     let rec = sqlx::query!(
//         r#"
// INSERT INTO todos ( description )
// VALUES ( $1 )
// RETURNING id
//         "#,
//         description
//     )
//     .fetch_one(pool)
//     .await?;

//     Ok(rec.id)
// }

// async fn list_todos(pool: &PgPool) -> sqlx::Result<()> {
//     let recs = sqlx::query!(
//         r#"
// SELECT id, description, done
// FROM todos
// ORDER BY id
//         "#
//     )
//     .fetch_all(pool)
//     .await?;

//     for rec in recs {
//         println!(
//             "- [{}] {}: {}",
//             if rec.done { "x" } else { " " },
//             rec.id,
//             &rec.description,
//         );
//     }

//     Ok(())
// }

async fn login(
    body: web::Json<server::LoginEvent>,
    pool: web::Data<PgPool>
) -> impl Responder {
    println!("{}", body.into_inner().test);
    // add_todo(pool.as_ref(), "asdlfasf".to_string())
    //     .await
    //     .unwrap();
    // list_todos(pool.as_ref())
    //     .await
    //     .unwrap();
    HttpResponse::Ok()
}

async fn signup(
    body: web::Json<server::SignUpEvent>,
    pool: web::Data<PgPool>
) -> impl Responder {
    db::signup::add_user(
        body.into_inner(),
        pool.as_ref()
    )
        .await
        .unwrap();
    HttpResponse::Ok()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let app_state = Arc::new(AtomicUsize::new(0));

    let pool: PgPool = PgPool::connect(&env::var("DATABASE_URL").unwrap_or("postgres://postgres:1234@localhost:5432/flettex".to_string()))
        .await
        .expect("Failed to create pool");

    let server = server::ChatServer::new(app_state.clone()).start();

    let is_dev = match env::var("RAILWAY_STATIC_URL") {
        Ok(_) => false,
        Err(_) => true,
    };

    log::info!("{:?}", format!("starting HTTP server at {:?}", if is_dev {"http://localhost:8080"} else {"production url"}));

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::from(app_state.clone()))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(server.clone()))
            .route("/", web::get().to(index))
            .route("/", web::post().to(message_route))
            .route("/login", web::post().to(login))
            .route("/signup", web::post().to(signup))
            .route("/count", web::get().to(get_count))
            .route("/ws", web::get().to(chat_route))
            .route("/healthcheck", web::get().to(health_check))
            .wrap(Logger::default())
    })
    .workers(2)
    .bind((if is_dev {"127.0.0.1"} else {"0.0.0.0"}, 8080))?
    .run()
    .await
}