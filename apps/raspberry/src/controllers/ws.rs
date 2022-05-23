use std::time::Instant;

use actix::Addr;
use actix_web::{
    web,
    HttpRequest,
    HttpResponse,
    Error
};
use actix_identity::Identity;
use actix_web_actors::ws;

use sqlx::PgPool;

use crate::server;
use crate::session;

pub async fn get(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<server::ChatServer>>,
    pool: web::Data<PgPool>,
    id: Identity,
) -> Result<HttpResponse, Error> {
    // println!("{}", pool.is_closed());
    if let Some(session_id) = id.identity() {
        ws::start(
            session::WsChatSession {
                id: 0,
                hb: Instant::now(),
                room: "Main".to_owned(),
                name: None,
                addr: srv.get_ref().clone(),
                // authenticated: false,
                // handle: None,
                pool: pool.get_ref().clone(),
                session_id: session_id,
            },
            &req,
            stream,
        )
    } else {
        Ok(HttpResponse::Ok().finish())
    }
}