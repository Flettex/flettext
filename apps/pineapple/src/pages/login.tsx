import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import * as cookie from "cookie"
import { FormControl } from '@chakra-ui/react';

export default function Login() {
    return (
        <>
            <FormControl>
                
            </FormControl>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    ctx.res.setHeader("Set-Cookie", cookie.serialize("_rftcp", "t", {
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "strict",
        // maxAge: 7 * 24 * 60 * 60
    }));
    return {
      props: {
        cookies: ctx.req.cookies
      }
    }
}