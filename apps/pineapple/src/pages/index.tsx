import Link from "next/link";
// import { ButtonGroup, Button } from "../components/button";
// import { Checkbox } from "../components/checkbox";
// import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { globalStyles } from "../utils/theme";

export default function Home() {
    globalStyles();
    return (
        <>
            <h1>
                {"Welcome to extremely low budget chat app."}
                {"We are open source and non-profit"}
            </h1>
            <Link href="/chat"><a>{"Me when I want to try this trash chat app I'm probably never using ever again"}</a></Link>
            <br />
            <Link href="/login"><a>{"Me when login"}</a></Link>
            <br />
            <Link href="/signup"><a>{"Me when signup"}</a></Link>
            <br />
            <Link href="/logout"><a>{"Don't logout bro alts aren't allowed"}</a></Link>
        </>
    )
}

// export default function Home() {
//     globalStyles()
//     return (
//         <>
//             <Popover>
//                 <PopoverTrigger>
//                     Trigger
//                 </PopoverTrigger>
//                 <PopoverContent>
//                     Hello
//                 </PopoverContent>
//             </Popover>
//             <Button onClick={() => alert("test")}>Test</Button>
//             <ButtonGroup css={{
//                 flexDirection: 'row'
//             }}>
//                 <Button>
//                     Balls0
//                 </Button>
//                 <Button>
//                     Balls1
//                 </Button>
//                 <Button>
//                     Balls2
//                 </Button>
//             </ButtonGroup>
//             <Checkbox type="checkbox" id="chk" />
//         </>
//     );
// }