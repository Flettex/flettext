// import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

//(props: InferGetServerSidePropsType<typeof getServerSideProps>

export default function Signup() {
    const Router = useRouter();
    function gebi(id: string): HTMLInputElement {
        return document.getElementById(id) as HTMLInputElement;
    }
    return (
        <>
            <input id="i" type="number" />
            <button onClick={() =>
                fetch("/verify", {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify({
                        code: parseInt(gebi("i").value)
                    })
                }).then((res) => {
                    if (res.ok) Router.push("/chat");
                })
            }>Verify</button>
        </>
    )
}

// export const getServerSideProps: GetServerSideProps = async () => {
//     const captcha = await fetch("http://localhost:8080/login");
//     return {
//         props: {
//             imgSrc: await captcha.text()
//         }
//     }
//   }