use actix_web::{
    web,
    services,
    HttpResponse
};

mod login;
mod logout;
mod signup;
mod index;
mod ws;
mod count;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        services![
            web::resource("/")
                .route(web::get().to(index::get))
                .route(web::post().to(index::post)),
            web::resource("/count")
                .route(web::get().to(count::get)),
            web::resource("/health")
                .route(web::get().to(|| {
                    HttpResponse::Ok()
                })),
            web::resource("/ws")
                .route(web::get().to(ws::get)),
            web::resource("/login")
                .route(web::post().to(login::post)),
            web::resource("/signup")
                .route(web::post().to(signup::post)),
            web::resource("/logout")
                .route(web::delete().to(logout::delete)),
        ]
    );
}