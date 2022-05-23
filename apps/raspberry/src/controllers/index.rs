use actix::Addr;
use actix_web::{
    Responder,
    HttpResponse,
    web,
};

use crate::html;
use crate::server;

pub async fn get() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/html")
        .body(html::HTML_STR)
    // NamedFile::open_async("./test/index.html").await.unwrap()
}

pub async fn post(
    body: web::Json<server::ClientEvent>,
    srv: web::Data<Addr<server::ChatServer>>,
) -> impl Responder /* Result<HttpResponse, Error> */ {
    // println!("Event: {}", body.event_name);
    srv.get_ref().do_send(body.into_inner());
    HttpResponse::Ok()
    // Ok(HttpResponse::Ok().content_type("text/plain").body("Test"))
}