import type Stitches from '@stitches/react';
import React, { useState } from 'react';
import { styled } from '../utils/theme';
import { Box } from './box';

interface IButtonGroupProps {
    focusIndex?: number,
    css?: Stitches.CSS,
    children: React.ReactElement[]
}

export const Button = styled('button', {
    paddingTop: '0.1em',
    paddingBottom: '0.2em',
    paddingLeft: '0.9em',
    paddingRight: '0.9em',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '5px',
    variants: {
        variant: {
            enabled: {
                backgroundColor: 'white',
                border: '1px solid lightgray',
                '&:active': {
                    backgroundColor: 'rgb(246, 246, 246)',
                    border: '1px solid gray'
                },
                boxShadow: '0 0 0.5px lightgray'
            },
            disabled: {
                backgroundColor: 'transparent',
                border: '1px solid transparent', 
                '&:active': {
                    backgroundColor: 'rgb(246, 246, 246)',
                    border: '1px solid lightgray'
                },
                boxShadow: '0 0 1px #ffffff'
            }
        }
    },
    defaultVariants: {
        variant: 'enabled'
    }
});

const ButtonGroupInner = styled(Box, {
    backgroundColor: 'rgb(230, 230, 230)',
    borderRadius: '5px',
    display: 'flex',
    width: 'fit-content',
    height: 'fit-content'
});

export const ButtonGroup = (props: IButtonGroupProps) => {
    const [focusIndex, setFocusIndex] = useState<number>(props.focusIndex ?? 0);
    return (
        <ButtonGroupInner>
            {props.children.map((child, index) => (
                    <Box
                        css={{
                            [`& ${Button}`]: index !== focusIndex ? {
                                backgroundColor: 'transparent',
                                border: '1px solid transparent', 
                                borderInlineStart: focusIndex === index-1 ? undefined : index !== 0 ? '1px solid lightgray' : undefined,
                                borderRadius: '0',
                                '&:active': {
                                    backgroundColor: 'rgb(246, 246, 246)',
                                    border: '1px solid lightgray',
                                    borderRadius: '5px'
                                },
                                boxShadow: '0 0 1px #ffffff'
                            }: undefined,
                        }}
                        onClick={() => setFocusIndex(index)}
                        key={index}
                    >
                        {child}
                    </Box>
                )
            )}
        </ButtonGroupInner>
    )
}