import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { httpClient } from "@/lib/httpClient";

// Node's axios doesn't persist cookies between requests the way a browser
// does, even with withCredentials: true - that flag is a browser-only XHR
// concept. The verify flow depends on the refresh-token cookie login sets,
// so the e2e suite needs a real cookie jar wired in to behave like a browser.
wrapper(httpClient);
httpClient.defaults.jar = new CookieJar();
