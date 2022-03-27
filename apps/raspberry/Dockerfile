FROM lukemathwalker/cargo-chef:latest-rust-bullseye AS chef
WORKDIR /raspberry

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /raspberry/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin raspberry-backend-app

FROM debian:bullseye-slim AS runtime
WORKDIR /raspberry
COPY --from=builder /raspberry/target/release/raspberry-backend-app /usr/local/bin
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/raspberry-backend-app"]