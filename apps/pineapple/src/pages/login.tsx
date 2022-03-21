import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import * as cookie from "cookie";
import { FormControl } from "@chakra-ui/react";

const Login: NextPage = () => {
  return (
    <>
      <FormControl></FormControl>
    </>
  );
}

export default Login;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader(
    "Set-Cookie",
    cookie.serialize("_rftcp", "t", {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      // maxAge: 7 * 24 * 60 * 60
    })
  );
  return {
    props: {
      cookies: ctx.req.cookies,
    },
  };
};
