use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Instant,
    // string::String
};

use actix::*;
use actix_web::{
    middleware::Logger, web, App, Error, HttpRequest, HttpResponse, HttpServer, Responder,
};
use actix_web_actors::ws;
// use actix_files::{NamedFile};

// use serde::{Deserialize};
// use serde_json::Value;

mod server;
mod html;
mod session;

async fn index() -> impl Responder {
    HttpResponse::Ok().content_type("text/html").body(html::html_str())
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
) -> Result<HttpResponse, Error> {
    ws::start(
        session::WsChatSession {
            id: 0,
            hb: Instant::now(),
            room: "Main".to_owned(),
            name: None,
            addr: srv.get_ref().clone(),
        },
        &req,
        stream,
    )
}

async fn get_count(count: web::Data<AtomicUsize>) -> impl Responder {
    let current_count = count.load(Ordering::SeqCst);
    format!("Visitors: {}", current_count)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let app_state = Arc::new(AtomicUsize::new(0));

    let server = server::ChatServer::new(app_state.clone()).start();

    log::info!("starting HTTP server at http://localhost:8080");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::from(app_state.clone()))
            .app_data(web::Data::new(server.clone()))
            .route("/", web::get().to(index))
            .route("/", web::post().to(message_route))
            .route("/count", web::get().to(get_count))
            .route("/ws", web::get().to(chat_route))
            .wrap(Logger::default())
    })
    .workers(2)
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}