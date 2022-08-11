import { ButtonGroup, Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { globalStyles } from "../utils/theme";

export default function Home() {
    globalStyles()
    return (
        <>
            <Popover>
                <PopoverTrigger>
                    Trigger
                </PopoverTrigger>
                <PopoverContent>
                    Hello
                </PopoverContent>
            </Popover>
            <Button onClick={() => alert("test")}>Test</Button>
            <ButtonGroup css={{
                flexDirection: 'row'
            }}>
                <Button>
                    Balls0
                </Button>
                <Button>
                    Balls1
                </Button>
                <Button>
                    Balls2
                </Button>
            </ButtonGroup>
            <Checkbox type="checkbox" id="chk" />
        </>
    );
}