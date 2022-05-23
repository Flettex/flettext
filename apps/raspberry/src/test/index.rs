#[cfg(test)]
mod tests {
    use crate::controllers::*;
    use actix_web::{
        // http::{self, header::ContentType},
        test,
        App,
        web,
    };
    use actix_http::Request;
    use crate::html;

    fn req(uri: &str) -> Request {
        test::TestRequest::get().uri(uri).to_request()
    }

    #[actix_web::test]
    async fn test_index_get() {
        let app = test::init_service(
            App::new()
                .route("/", web::get().to(index::get)),
        )
        .await;

        // body check
        let resp = test::call_and_read_body(&app, req("/")).await;
        assert_eq!(resp, web::Bytes::from_static(html::HTML_STR.as_bytes()));

        // status check
        let resp = test::call_service(&app, req("/")).await;
        assert!(resp.status().is_success());
    }

    // #[actix_web::test]
    // async fn test_index_ok() {
    //     // let req = test::TestRequest::default()
    //     //     .insert_header(ContentType::plaintext())
    //     //     .to_http_request();
    //     let resp = index::get().await;
    //     assert_eq!(resp.status(), http::StatusCode::OK);
    // }

    // #[actix_web::test]
    // async fn test_index_not_ok() {
    //     let req = test::TestRequest::default().to_http_request();
    //     let resp = index(req).await;
    //     assert_eq!(resp.status(), http::StatusCode::BAD_REQUEST);
    // }
}