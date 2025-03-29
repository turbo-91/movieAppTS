import { createGlobalStyle } from "styled-components";
import { Noto_Sans } from "next/font/google";

const montserrat = Noto_Sans({ subsets: ["latin"] });

const GlobalStyle = createGlobalStyle`
 body {
 background-color: black;   
 margin: 0;
    font-family: ${montserrat.style.fontFamily}; 
    color: white;
    padding: 2rem;
  }
`;

export default GlobalStyle;
