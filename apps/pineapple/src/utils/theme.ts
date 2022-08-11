import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
    theme: {
        colors: {
            gray400: 'gainsboro',
            gray500: 'lightgray',
        },
    },
    media: {
        bp1: '(min-width: 480px)',
    },
    utils: {
        marginX: (value: string) => ({ marginLeft: value, marginRight: value }),
        marginY: (value: string) => ({ marginTop: value, marginBottom: value }),
    },
});

export const globalStyles = globalCss({
    body: {
        backgroundColor: 'rgb(240, 240, 240)'
    }
});