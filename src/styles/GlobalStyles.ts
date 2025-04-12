import { createGlobalStyle } from "styled-components";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const GlobalStyle = createGlobalStyle`
  :root {
  font-size: 16px;
    --font-family: ${notoSans.style.fontFamily};
    --font-weight-ultralight: 200;
    --font-weight-light: 300;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    background-color: black;
    margin: 0;
    padding: 0;
    font-family: var(--font-family);
    color: white;
    font-weight: var(--font-weight-regular); /* default */
  }
`;

export default GlobalStyle;
