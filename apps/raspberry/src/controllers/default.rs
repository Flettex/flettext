use actix_web::{
    HttpRequest,
    HttpResponse,
    http::{StatusCode, header::ContentType}
};

use crate::html;

pub async fn all(req: HttpRequest) -> HttpResponse {
    if req.method() == "GET" {
        HttpResponse::build(StatusCode::NOT_FOUND)
            .content_type(ContentType::html())
            .body(html::DEFAULT_PAGE_HTML)
    } else {
        HttpResponse::NotFound().finish()
    }
}