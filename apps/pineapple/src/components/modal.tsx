import React, { useContext, useState } from "react";
import { styled } from "../utils/theme";
import { Box } from "./box";
import { Button } from "./button";

interface IModalProps {
    defaultShowing?: boolean,
    children?: any
}

interface IModalTriggerProps {
    children?: any
}

interface IModalBodyProps {
    children?: any
}

// children: React.ReactElement | React.ReactElement[] | string | undefined

interface IModalCtxStructure {
    showing: boolean,
    setShowing: React.Dispatch<React.SetStateAction<boolean>>
}

const structure: IModalCtxStructure = {
    showing: false,
    setShowing: (_val: boolean | ((_v: boolean) => boolean)) => {},
}

const ModalContext = React.createContext(structure);

export const Modal = (props: IModalProps) => {
    const [showing, setShowing] = useState<boolean>(props.defaultShowing ?? false);
    return (
        <ModalContext.Provider value={{
            showing,
            setShowing
        }}>
            {props.children}
        </ModalContext.Provider>
    )
}

export const ModalTrigger = (props: IModalTriggerProps) => {
    const ctx = useContext(ModalContext);
    return (
        <Button onClick={_ => ctx.setShowing((s: boolean) => !s)}>{props.children}</Button>
    )
}

export const ModalBody = (props: IModalBodyProps) => {
    const ctx = useContext(ModalContext)
    return (
        <>
            {ctx.showing && (
                <Box css={{
                    top: '0',
                    left: '0',
                    bottom: '0',
                    right: '0',
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}>
                    {props.children}
                </Box>
            )}
        </>
    )
}

export const ModalField = styled('section', {
    backgroundColor: 'white',
    width: '25em',
    height: '35em',
    borderRadius: '5%',
    padding: '1em'
});