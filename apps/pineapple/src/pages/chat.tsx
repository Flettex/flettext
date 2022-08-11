import { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Modal, ModalBody, ModalField, ModalTrigger } from "../components/modal";

export default function Chat() {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [disconnecting, setDisconnecting] = useState<boolean>(false);
	const [logs, setLogs] = useState<{
        [key: string]: string[]
    }>({});
    const [room, setRoom] = useState<string>("Main");
	const logRef = useRef<HTMLDivElement | null>(null);
	const statusRef = useRef<HTMLSpanElement | null>(null);
	const textInputRef = useRef<HTMLInputElement | null>(null);
	const nameRef = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		if (socket) {
			socket.onopen = () => {
				log(room, "Connected");
			};

			socket.onmessage = (ev) => {
				console.log(ev);
				const event = JSON.parse(ev.data);
				console.log(event);
				if (event.type === "MemberCreate") {
					setRoom(event.data.room);
				} else if (event.type === "MemberRemove") {
					setRoom("Main");
				} else if (event.type === "MessageCreate") {
					log(event.data.room, "Received: " + event.data.content);
				} else if (event.type === "GuildCreate") {
					log(event.data.guild.name, "");
				}
			};

			socket.onclose = () => {
				log(room, "Disconnected");
				setSocket(null);
				setDisconnecting(false);
			};
		}
		if (!statusRef.current || !textInputRef.current) return;
		if (socket) {
			statusRef.current.style.backgroundColor = "transparent";
			statusRef.current.style.color = "green";
			statusRef.current.textContent = `connected`;
			textInputRef.current.focus();
		} else {
			statusRef.current.style.backgroundColor = "red";
			statusRef.current.style.color = "white";
			statusRef.current.textContent = "disconnected";
		}
	}, [socket, room, disconnecting]);

	useEffect(() => {
		if (logRef.current) {
			logRef.current.scrollTop += 1000;
		}
	}, [logs]);

	function connect() {
		if (socket) {
			if (disconnecting) {
				alert("Be patient I'm tryna disconnect");
				return;
			}
			setDisconnecting(true);
			log(room, "Disconnecting...");
			socket.close();
		} else {
			const { location } = window;

			const proto = location.protocol.startsWith("https") ? "wss" : "ws";
			const wsUri = `${proto}://localhost:8080/ws`;

			log(room, "Connecting...");
			setSocket(new WebSocket(wsUri));
		}
	}

	function log(room: string, msg: string) {
        console.log("ROOM", room);
		setLogs((logs) => ({
            ...logs,
            [room]: [...(logs[room] ?? []), msg]
        }));
	}

	return (
		<>
			<div>
				{/* <button onclick="fetch('/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: 'MessageCreate', client_id: 0, data: { content: 'Hello' }, room: 'Main'})})">Send Hi</button> */}
				<Button onClick={connect}>
					{socket ? "Disconnect" : "Connect"}
				</Button>
                <div>ROOM: {room}</div>
				<span>Status:</span>
				<span ref={statusRef}>disconnected</span>
			</div>

            <div>
                {Object.keys(logs).map((room) => 
                    <div key={room} onClick={() => setRoom(room)} style={{"border": "1px solid black"}}>Room {room}</div>
                )}
            </div>
			<div ref={logRef} style={{
                width: "30em",
                height: "20em",
                overflow: "auto",
                margin: "0.5em 0",
        
                border: "1px solid black"
            }}>{logs[room]?.map((i, ind) => <div key={ind}>{i}</div>)}</div>

			<form
				onSubmit={(ev) => {
					ev.preventDefault();

					if (!textInputRef.current || !socket) return;

					const text = textInputRef.current.value;

					log(room, "Sending: " + text);
					socket.send(
						JSON.stringify({
							type: "MessageCreate",
							data: {
								content: text,
								room
							},
						})
					);

					textInputRef.current.value = "";
					textInputRef.current.focus();
				}}
			>
				<input type="text" ref={textInputRef} />
				<Button type="submit">Submit</Button>
			</form>
			<Modal>
				<ModalTrigger>Trigger</ModalTrigger>
				<ModalBody>
					<ModalField>
						<form
							onSubmit={(ev) => {
								ev.preventDefault();

								if(!nameRef.current || !socket) return;
			
								const name = nameRef.current.value;
			
								log(room, "Creating guild: " + name);
								socket.send(
									JSON.stringify({
										type: "GuildCreate",
										data: {
											name
										},
									})
								);
							}}
						>
							Name<input type="text" ref={nameRef} />
							<br />
							Description?<input type="text" />
							<br />
							Icon?<input type="text" />
							<Button type="submit">Submit</Button>
						</form>
						<ModalTrigger>Close</ModalTrigger>
					</ModalField>
				</ModalBody>
			</Modal>

			<hr />

			<section>
				<h2>Commands</h2>
				<table>
					<tbody>
						<tr>
							<td>
								<code>/list</code>
							</td>
							<td>list all available rooms</td>
						</tr>
						<tr>
							<td>
								<code>/join name</code>
							</td>
							<td>
								join room, if room does not exist, create new one
							</td>
						</tr>
						<tr>
							<td>
								<code>/leave name</code>
							</td>
							<td>
								leave room, ignored if you are not a part of the room / room doesn't exist (can't leave main room)
							</td>
						</tr>
						<tr>
							<td>
								<code>/name name</code>
							</td>
							<td>set session name</td>
						</tr>
						<tr>
							<td>
								<code>some message</code>
							</td>
							<td>
								just string, send message to all peers in same room
							</td>
						</tr>
					</tbody>
				</table>
			</section>
		</>
	);
}
