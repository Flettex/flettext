use std::time::{Duration, Instant};

use actix::prelude::*;
use actix_web_actors::ws;

use crate::server;

use serde::{Serialize, Deserialize};
use serde_json::{json};
use std::fmt;

use sqlx::postgres::PgPool;

fn format_m(content: &str) -> String {
    json!({
        "data": {
            "content": content
        },
        "type": "MessageCreate"
    }).to_string()
}

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(5);

const CLIENT_TIMEOUT: Duration = Duration::from_secs(10);

#[derive(Serialize, Deserialize, Clone)]
struct WsMessageCreate {
    content: String
}

#[derive(Serialize, Deserialize, Clone)]
struct WsMessageUpdate {
    id: usize,
    content: String
}

#[derive(Serialize, Deserialize, Clone)]
struct WsDevice {
    os: String,
    device: String,
    browser: String
}

// #[derive(Serialize, Deserialize, Clone)]
// struct WsAuthMsg {
//     password: String,
//     cred: WsDevice
// }

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "data")]
enum WsReceiveTypes {
    // {"type":"MessageUpdate", "data":{"content":"",id:1}}
    MessageUpdate(WsMessageUpdate),
    // {"type":"MessageCreate", "data":{"content":""}}
    MessageCreate(WsMessageCreate),
    // {"type":"Auth", "data":{"token":"123","cred":{"os":"1", "device":"2", "browser":"3"}}}
    /* Auth(WsAuthMsg), */
    // {"type":"Null"}
    // used for testing purposes
    Null
}

impl fmt::Display for WsReceiveTypes {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            WsReceiveTypes::MessageCreate(msg) => write!(f, "{}", msg.content),
            WsReceiveTypes::MessageUpdate(msg) => write!(f, "Updating {} to {}", msg.id, msg.content),
            // WsReceiveTypes::Auth(msg) => write!(f, "{{\"password\":\"{t}\",\"cred\":{{\"os\":\"{os}\",\"browser\":\"{browser}\",\"device\":\"{device}\"}}}}", t=msg.password, os=msg.cred.os, browser=msg.cred.browser, device=msg.cred.device),
            WsReceiveTypes::Null => write!(f, "{}", "null"),
        }
    }
}

#[derive(Debug)]
pub struct WsChatSession {
    pub id: usize,

    pub hb: Instant,

    pub room: String,

    pub name: Option<String>,

    pub addr: Addr<server::ChatServer>,

    // pub authenticated: bool,

    // pub handle: Option<SpawnHandle>,

    pub pool: PgPool,

    pub session_id: String,
}

impl WsChatSession {
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT_INTERVAL, |act, ctx| {
            if Instant::now().duration_since(act.hb) > CLIENT_TIMEOUT {
                println!("Websocket Client heartbeat failed, disconnecting!");

                act.addr.do_send(server::Disconnect { id: act.id });

                ctx.stop();

                return;
            }

            ctx.ping(b"");
        });
    }

    fn decode_json(&self, s: &str) -> serde_json::Result<WsReceiveTypes> {
        serde_json::from_str(s)
    }
}

impl Actor for WsChatSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);
        
        // self.handle = Some(ctx.run_later(Duration::from_secs(30), |_, ctx| {
        //     ctx.close(Some(ws::CloseReason{
        //         code: ws::CloseCode::from(4001),
        //         description: Some("Authentication payload was not provided on time.".to_string())
        //     }));
        //     ctx.stop();
        // }));

        let addr = ctx.address();
        self.addr
            .send(server::Connect {
                addr: addr.recipient(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(res) => act.id = res,
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        self.addr.do_send(server::Disconnect { id: self.id });
        Running::Stop
    }
}

impl Handler<server::Message> for WsChatSession {
    type Result = ();

    fn handle(&mut self, msg: server::Message, ctx: &mut Self::Context) {
        ctx.text(json!(msg.data).to_string());
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsChatSession {

    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        log::debug!("WEBSOCKET MESSAGE: {:?}", msg);
        match msg {
            ws::Message::Ping(msg) => {
                self.hb = Instant::now();
                ctx.pong(&msg);
            }
            ws::Message::Pong(_) => {
                self.hb = Instant::now();
            }
            ws::Message::Text(text) => {
                let val = match self.decode_json(text.trim()) {
                    Err(err) => {
                        println!("{}", err);
                        WsReceiveTypes::Null
                    }
                    Ok(val) => val,
                };
                println!("{}", val);
                let m = text.trim();
                match val {
                    // WsReceiveTypes::Auth(pl) => {
                    //     if !self.authenticated {
                    //         match self.handle {
                    //             Some(h) => {
                    //                 ctx.cancel_future(h);
                    //             }
                    //             None => ()
                    //         };
                    //         self.authenticated = true;
                    //     }
                    // }
                    WsReceiveTypes::MessageCreate(m) => {
                        let msg = if let Some(ref name) = self.name {
                            format!("{}: {}", name, m.content)
                        } else {
                            m.content.to_owned()
                        };
                        log::info!("{} {}", msg, self.id);
                        self.addr.do_send(server::ClientMessage {
                            id: self.id,
                            msg,
                            room: self.room.clone(),
                        })
                    }
                    WsReceiveTypes::MessageUpdate(_) => {
                        // update msg
                    }
                    WsReceiveTypes::Null => {
                        if m.starts_with('/') {
                            let v: Vec<&str> = m.splitn(2, ' ').collect();
                            match v[0] {
                                "/list" => {
                                    println!("List rooms");
                                    self.addr
                                        .send(server::ListRooms)
                                        .into_actor(self)
                                        .then(|res, _, ctx| {
                                            match res {
                                                Ok(rooms) => {
                                                    for room in rooms {
                                                        ctx.text(format_m(&room));
                                                    }
                                                }
                                                _ => println!("Something is wrong"),
                                            }
                                            fut::ready(())
                                        })
                                        .wait(ctx)
                                }
                                "/join" => {
                                    if v.len() == 2 {
                                        self.room = v[1].to_owned();
                                        self.addr.do_send(server::Join {
                                            id: self.id,
                                            name: self.room.clone(),
                                        });
        
                                        ctx.text(format_m("joined"));
                                    } else {
                                        ctx.text(format_m("!!! room name is required"));
                                    }
                                }
                                "/name" => {
                                    if v.len() == 2 {
                                        self.name = Some(v[1].to_owned());
                                    } else {
                                        ctx.text(format_m("!!! name is required"));
                                    }
                                }
                                _ => ctx.text(format_m(&format!("!!! unknown command: {:?}", m))),
                            }
                        } else {
                            let msg = if let Some(ref name) = self.name {
                                format!("{}: {}", name, m)
                            } else {
                                m.to_owned()
                            };
                            log::info!("{} {}", msg, self.id);
                            self.addr.do_send(server::ClientMessage {
                                id: self.id,
                                msg,
                                room: self.room.clone(),
                            })
                        }
                    }
                }
            }
            ws::Message::Binary(_) => println!("Unexpected binary"),
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                ctx.stop();
            }
            ws::Message::Nop => (),
        }
    }
}
