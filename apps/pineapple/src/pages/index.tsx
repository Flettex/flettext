import {useEffect, useState} from "react";
import type { NextPage } from "next";

import { Center } from "@chakra-ui/react";

import InputField from "../components/inputField";

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
        <InputField />
      </Center>
    </>
  );
};

export default Display;


// export function getServerSideProps() {

// }