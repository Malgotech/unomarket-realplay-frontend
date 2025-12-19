import { Magic } from "magic-sdk";
import { OAuthExtension } from '@magic-ext/oauth2';

const magic = new Magic("pk_live_CCEB66B991376700", {
  extensions: [new OAuthExtension()],
});

export default magic;