import {useEffect, useState} from "react";
import type { NextPage } from "next";

import { Center } from "@chakra-ui/react";

const Display: NextPage = () => {
  const [token, setToken] = useState<string>("");
  useEffect((): any => {
    const tok = localStorage.getItem("token") || "Not found";
    if (tok) setToken(tok);
    localStorage.removeItem("token");
    window.addEventListener("beforeunload", () => {
      if (tok) localStorage.setItem("token", tok);
    });
  }, []);
  return (
    <>
      <Center h="100vh">
        {token}
      </Center>
    </>
  );
};

export default Display;
