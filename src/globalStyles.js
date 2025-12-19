import { createGlobalStyle } from 'styled-components';

const GlobalFonts = createGlobalStyle`
  /* Font declarations with preload for performance */
  @font-face {
    font-family: 'IBMPlexSans';
    src: url('/fonts/IBMPlexSans-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'IBMPlexSans';
    src: url('/fonts/IBMPlexSans-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'IBMPlexSans';
    src: url('/fonts/IBMPlexSans-SemiBold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
  
  @font-face {
    font-family: 'IBMPlexSans';
    src: url('/fonts/IBMPlexSans-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

  /* Global font application - excluding icon classes */
  *:not([class^="ri-"]):not([class*=" ri-"]):not(.ri) {
    font-family: 'IBMPlexSans', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }
  
  /* Root element declarations */
  :root {
    --font-family-base: 'IBMPlexSans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-family: var(--font-family-base) !important;
  }
  
  /* Base elements */
  html, body {
    font-family: var(--font-family-base) !important;
  }
  
  /* Force IBM Plex Sans on all common elements - excluding icons */
  body,
  h1, h2, h3, h4, h5, h6,
  p, span:not([class^="ri-"]):not([class*=" ri-"]), 
  div:not([class^="ri-"]):not([class*=" ri-"]), 
  a:not([class^="ri-"]):not([class*=" ri-"]), 
  button:not([class^="ri-"]):not([class*=" ri-"]),
  input, textarea, select, option,
  li, ul, ol, table, td, th, label, blockquote,
  nav, header, footer, section, article, aside, main,
  pre, code {
    font-family: var(--font-family-base) !important;
  }

  /* Target common class-based elements - excluding icon classes */
  .text-blue-500:not([class^="ri-"]):not([class*=" ri-"]), 
  .text-blue-600:not([class^="ri-"]):not([class*=" ri-"]), 
  .text-zinc-800:not([class^="ri-"]):not([class*=" ri-"]), 
  .text-white:not([class^="ri-"]):not([class*=" ri-"]),
  .font-semibold:not([class^="ri-"]):not([class*=" ri-"]), 
  .font-medium:not([class^="ri-"]):not([class*=" ri-"]), 
  .font-bold:not([class^="ri-"]):not([class*=" ri-"]), 
  .font-regular:not([class^="ri-"]):not([class*=" ri-"]),
  .text-\\[\\#2b2d2e\\]:not([class^="ri-"]):not([class*=" ri-"]), 
  button:not([class^="ri-"]):not([class*=" ri-"]), 
  .btn:not([class^="ri-"]):not([class*=" ri-"]), 
  .button:not([class^="ri-"]):not([class*=" ri-"]),
  nav button:not([class^="ri-"]):not([class*=" ri-"]), 
  input:not([class^="ri-"]):not([class*=" ri-"]), 
  select:not([class^="ri-"]):not([class*=" ri-"]), 
  textarea:not([class^="ri-"]):not([class*=" ri-"]) {
    font-family: var(--font-family-base) !important;
  }

  /* Target common tailwind font classes - excluding icons */
  .font-\\[\\'IBMPlexSans\\'\\]:not([class^="ri-"]):not([class*=" ri-"]), 
  .font-sans:not([class^="ri-"]):not([class*=" ri-"]), 
  .font-ibm:not([class^="ri-"]):not([class*=" ri-"]) {
    font-family: var(--font-family-base) !important;
  }

  /* IMPORTANT: Preserve Remix icon font for icon elements */
  i[class^="ri-"], i[class*=" ri-"], 
  span[class^="ri-"], span[class*=" ri-"],
  .ri, [class^="ri-"], [class*=" ri-"] {
    font-family: 'remixicon' !important;
  }
`;

export default GlobalFonts;