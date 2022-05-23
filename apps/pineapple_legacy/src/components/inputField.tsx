import { useEventListener } from '@chakra-ui/react';
import React from 'react';

const InputField = () => {
    const [value, setValue] = React.useState<string>("");
    useEventListener("keydown", (e) => {
        setValue(value => {
            if (e.key === "Backspace") {
                return value?.slice(0, value.length-1);
            } else if (e.key === "Enter") {
                return value + "\n";
            } else {
                return value + e.key;
            }
        });
    })
    return (
        <div>{value}</div>
    )
}

export default InputField;