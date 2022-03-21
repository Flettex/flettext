import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import * as cookie from "cookie";

const Logout: NextPage = () => {
  return <>{"In progress..."}</>;
}

export default Logout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader(
    "Set-Cookie",
    cookie.serialize("_rftcp", "", {
      path: "/",
      maxAge: 0,
    })
  );
  return {
    props: {
      cookies: ctx.req.cookies,
    },
  };
};
