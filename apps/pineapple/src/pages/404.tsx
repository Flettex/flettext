import { Box, Divider, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import cakeLie from "../../public/cakeLie.jpg";

export default function ErrorPage() {
    return (
        <Flex textAlign={"center"} flexDir={"column"} justifyContent={"center"} alignItems={"center"} height={"100vh"}>
            <Flex marginBottom={5}>
                <Text fontSize={"2vw"}>{"404"}</Text>
                <Divider orientation="vertical" marginLeft={4} marginRight={4} />
                <Text fontSize={"2vw"}>
                    {"Uh oh! This page could not be found. Search for your cakes elsewhere!"}
                </Text>
            </Flex>
            <Box position="relative" width="50vw" height="40vh">
                <Image src={cakeLie} alt="cake" layout="fill" objectFit="contain" />
            </Box>
        </Flex>
    )
}