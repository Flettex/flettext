import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box } from "../components/box";
import { Button } from "../components/button";
import { Modal, ModalBody, ModalField, ModalTrigger } from "../components/modal";

interface IChannel {
	id: string, // uuid
	name: string,
	description?: string,
	position: number,
	created_at: number, // number
	guild_id: string, // uuid, useless but too lazy to remove it
}

interface IGuild {
	id: string, // uuid
	name: string,
	description?: string,
	icon?: string,
	created_at: number, // time
	creator_id: number,
	channels: IChannel[]
}

interface IUserData {
	user?: {
		id: number,
		username: string,
		email: string,
		profile?: string,
		created_at: number, // time
		description?: string,
		allow_login: boolean,
		is_staff: boolean,
		is_superuser: boolean
	},
	guilds?: IGuild[]
}

const MAIN_GUILD: IGuild = {
	id: "Main",
	name: "Main",
	created_at: 0,
	creator_id: -1,
	channels: []
}

const MAIN_CHANNEL: IChannel = {
	id: "Main",
	name: "Main",
	position: -1,
	created_at: 0,
	guild_id: "Main"
}

export default function Chat() {
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [disconnecting, setDisconnecting] = useState<boolean>(false);
	const [logs, setLogs] = useState<{
        [key: string]: string[]
    }>({});
	const [userData, setUserData] = useState<IUserData>({});
	const [guild, setGuild] = useState<IGuild>(MAIN_GUILD);
    const [channel, setChannel] = useState<IChannel>(MAIN_CHANNEL);
	const logRef = useRef<HTMLDivElement | null>(null);
	const statusRef = useRef<HTMLSpanElement | null>(null);
	const textInputRef = useRef<HTMLInputElement | null>(null);
	const nameRef = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		console.log(userData);
	}, [userData]);
	useEffect(() => {
		if (socket) {
			socket.onopen = () => {
				log(channel.id, "Connected");
			};

			socket.onmessage = (ev) => {
				console.log(ev);
				const event = JSON.parse(ev.data);
				console.log(event);
				if (event.type === "MemberCreate") {
					// broken atm
					// setChannel(event.data.room);
				} else if (event.type === "MemberRemove") {
					// broken atm
					// setChannel("Main");
				} else if (event.type === "MessageCreate") {
					log(event.data.room, "Received: " + event.data.content);
				} else if (event.type === "GuildCreate") {
					// log(event.data.guild.name, "");
					setUserData(usrd => ({
						user: usrd.user,
						guilds: [...(usrd.guilds as IGuild[]), event.data.guild]
					}));
				} else if (event.type === "ChannelCreate") {
					setUserData(usrd => ({
						user: usrd.user,
						guilds: [...(usrd.guilds as IGuild[])].map((g) => g.id === event.data.channel.guild_id
							? {
								...g,
								channels: [...g.channels, event.data.channel]
							} : {
								...g
							}
						)
					}));
				} else if (event.type === "ReadyEvent") {
					setUserData({
						user: event.data.user,
						guilds: event.data.guilds
					});
				}
			};

			socket.onclose = () => {
				log(channel.id, "Disconnected");
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
	}, [socket, channel, disconnecting]);

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
			log(channel.id, "Disconnecting...");
			socket.close();
		} else {
			const { location } = window;

			const proto = location.protocol.startsWith("https") ? "wss" : "ws";
			const wsUri = `${proto}://localhost:8080/ws`;

			log(channel.id, "Connecting...");
			setSocket(new WebSocket(wsUri));
		}
	}

	function log(channel: string, msg: string) {
        console.log("ROOM", channel);
		setLogs((logs) => ({
            ...logs,
            [channel]: [...(logs[channel] ?? []), msg]
        }));
	}

	return (
		<>
			<div>
				<Button onClick={connect}>
					{socket ? "Disconnect" : "Connect"}
				</Button>
				<div>GUILD: {guild.name} {guild.id}</div>
                <div>CHANNEL: {channel.name} {channel.id}</div>
				<span>Status:</span>
				<span ref={statusRef}>disconnected</span>
			</div>

			<Box css={{
				display: 'flex',
				flexDirection: 'row'
			}}>
				<div>
					<div onClick={() => [setChannel(MAIN_CHANNEL), setGuild(MAIN_GUILD)]} style={{"border": "1px solid black"}}>Main</div>
					{
						(userData.guilds ?? []).map((g) => (
							<div
								key={g.id}
								onClick={() => [setGuild(g), setChannel(userData.guilds?.find((gd) => gd.id == g.id)?.channels?.[0] || MAIN_CHANNEL)]}
								style={{"border": "1px solid black"}}
							>
								{g.icon ? <Image src={g.icon} alt={g.name} width={50} height={50} /> : g.name}
							</div>
						))
					}
				</div>
				<div>
					{
						userData.guilds && userData.guilds.find((g) => g.id === guild.id)?.channels?.map((c) => (
							<div
								key={c.id}
								onClick={() => setChannel(c)}
								style={{"border": "1px solid black"}}
							>
								{c.name}
							</div>
						))
					}
				</div>
				<div ref={logRef} style={{
					width: "30em",
					height: "20em",
					overflow: "auto",
					// margin: "0.5em 0",
			
					border: "1px solid black"
				}}>{logs[channel.id]?.map((i, ind) => <div key={ind}>{i}</div>)}</div>
			</Box>
			<form
				onSubmit={(ev) => {
					ev.preventDefault();

					if (!textInputRef.current || !socket) return;

					const text = textInputRef.current.value;

					log(channel.id, "Sending: " + text);
					socket.send(
						JSON.stringify({
							type: "MessageCreate",
							data: {
								content: text,
								room: channel
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
				<ModalTrigger>Trigger Guild</ModalTrigger>
				<ModalBody>
					<ModalField>
						<form
							onSubmit={(ev) => {
								ev.preventDefault();

								if(!nameRef.current || !socket) return;
			
								const name = nameRef.current.value;
			
								log(channel.id, "Creating guild: " + name);
								socket.send(
									JSON.stringify({
										type: "GuildCreate",
										data: {
											name,
											description: (document.getElementById("d") as HTMLInputElement).value,
											icon: (document.getElementById("ic") as HTMLInputElement).value
										},
									})
								);
							}}
						>
							Name<input type="text" ref={nameRef} />
							<br />
							Description?<input type="text" id="d" />
							<br />
							Icon?<input type="text" id="ic" />
							<Button type="submit">Submit</Button>
						</form>
						<ModalTrigger>Close</ModalTrigger>
					</ModalField>
				</ModalBody>
			</Modal>
			<Modal>
				<ModalTrigger>Trigger Channel</ModalTrigger>
				<ModalBody>
					<ModalField>
						<form
							onSubmit={(ev) => {
								ev.preventDefault();

								if(!socket) return;

								let name = (document.getElementById("nom") as HTMLInputElement).value;
			
								log(channel.id, "Creating channel: " + name);
								socket.send(
									JSON.stringify({
										type: "ChannelCreate",
										data: {
											name,
											description: (document.getElementById("desc") as HTMLInputElement).value,
											position: +(document.getElementById("pos") as HTMLInputElement).value,
											guild_id: (document.getElementById("gid") as HTMLInputElement).value
										},
									})
								);
							}}
						>
							Name<input type="text" id="nom" />
							<br />
							Description?<input type="text" id="desc" />
							<br />
							Position<input type="number" id="pos" />
							<br />
							Guild Id<input type="text" id="gid" />
							<Button type="submit">Submit</Button>
						</form>
						<ModalTrigger>Close</ModalTrigger>
					</ModalField>
				</ModalBody>
			</Modal>
			<Modal>
				<ModalTrigger>Trigger Join Guild</ModalTrigger>
				<ModalBody>
					<ModalField>
						<form
							onSubmit={(ev) => {
								ev.preventDefault();

								if(!socket) return;

								let guild_id = (document.getElementById("guildid") as HTMLInputElement).value;
			
								log(channel.id, "Joining guild: " + guild_id);
								socket.send(
									JSON.stringify({
										type: "MemberCreate",
										data: {
											guild_id
										},
									})
								);
							}}
						>
							Guild Id<input type="text" id="guildid" />
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
							<td>list all available rooms (DEV ONLY)</td>
						</tr>
						<tr>
							<td>
								<code>/join name</code>
							</td>
							<td>
								<p style={{color: 'red', display: 'inline-block'}}>!deprecated!</p> join room, if room does not exist, create new one
							</td>
						</tr>
						<tr>
							<td>
								<code>/leave name</code>
							</td>
							<td>
								<p style={{color: 'red', display: 'inline-block'}}>!deprecated!</p>  leave room, ignored if you are not a part of the room / room doesn't exist (can't leave main room)
							</td>
						</tr>
						<tr>
							<td>
								<code>/name name</code>
							</td>
							<td>
							<p style={{color: 'red', display: 'inline-block'}}>!deprecated! removing soon</p> change your global nickname
							</td>
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
