import type {
	GetServerSideProps,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import { useState, useEffect } from "react";
import NextLink from "next/link";
import { Button, Input } from "@chakra-ui/react";

interface Msg {
  content: string
}

const ChatApp: NextPage = ({
	refreshToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inpVal, setInpVal] = useState<string>("");
  useEffect(() => {
      let socket = new WebSocket(`ws://localhost:8080/ws`);
      setSocket(socket);

      socket.onopen = () => {
        console.log("opened");
        setConnected(true);
      }

      socket.onmessage = (ev) => {
        console.log(ev);
        const event = JSON.parse(ev.data);
        console.log('Received: ' + event.data.content, 'message');
        setMessages(messages => [...messages, {
          content: event.data.content
        }]);
      }

      socket.onclose = () => {
        setSocket(null);
        setConnected(false);
        console.log('Disconnected')
      }

      return () => {
        socket.close();
        setConnected(false);
        setSocket(null);
      };
  }, []);
	return (
    <>
      {
        socket && connected ? 
          <>
            {"Connected!\n"}
            {messages.map((item: Msg, index: number) => (
              <div key={index}>
                {item.content}
              </div>
            ))}
            <Input value={inpVal} onChange={(e) => setInpVal(e.target.value)} />
            <Button onClick={() => [socket.send(inpVal), console.log(inpVal)]}>Message</Button>
          </>
        :
          <>
            {"Connecting..."}
          </>
      }
    </>
  );
};

export default ChatApp;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	if (!ctx.req.cookies._rftcp) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}
	return {
		props: {
			refreshToken: ctx.req.cookies._rftcp,
		},
	};
};
