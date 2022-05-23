use actix_web::{
    web,
    services,
    HttpResponse
};

pub mod login;
pub mod logout;
pub mod signup;
pub mod index;
pub mod ws;
pub mod count;
pub mod default;

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
            // default page
            web::scope("")
                .default_service(web::to(default::all))
        ]
    );
}