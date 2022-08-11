import { styled } from "../utils/theme";

// no this is not working

const InputCheckbox = (props: any) => <input type="checkbox" {...props} />

export const Checkbox = styled(InputCheckbox, {
    borderRadius: '4px',
    border: '10px solid white',
});