use actix_web::{
    web,
    Responder
};
use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
    },
};

pub async fn get(count: web::Data<AtomicUsize>) -> impl Responder {
    let current_count = count.load(Ordering::SeqCst);
    format!("Visitors: {}", current_count)
}