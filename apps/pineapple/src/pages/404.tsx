import { Box, Divider, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import cakeLie from "../../public/cakeLie.jpg";

export default function ErrorPage() {
  return (
    <Flex
      textAlign={"center"}
      flexDir={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      height={"100vh"}
    >
      <Flex marginBottom={5}>
        <Text fontSize={"2vw"}>{"404"}</Text>
        <Divider orientation="vertical" marginLeft={4} marginRight={4} />
      </Flex>
    </Flex>
  );
}
