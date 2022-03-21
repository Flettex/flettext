import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools"

const styles = {
  global: (props : any) => ({
    body: {
      bg: mode('#fff', '#202023')(props)
    }
  })
}

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config, styles });

export default theme;
