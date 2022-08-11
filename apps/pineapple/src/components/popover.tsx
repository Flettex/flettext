import { styled } from '../utils/theme';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// no this is not really working

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = styled(PopoverPrimitive.Trigger, {
    backgroundColor: 'white',
    borderRadius: '5px',
    border: '1px solid lightgray',
    paddingTop: '0.1em',
    paddingBottom: '0.2em',
    paddingLeft: '0.9em',
    paddingRight: '0.9em',
    fontSize: '12px',
    cursor: 'pointer',
    '&:active': {
        backgroundColor: 'rgb(246, 246, 246)',
        border: '1px solid gray'
    },
});
export const PopoverContent = styled(PopoverPrimitive.Content, {
    backgroundColor: 'white',
    boxShadow: '0 2px 10px -3px rgb(0 0 0 / 20%)',
    borderRadius: '3px',
});