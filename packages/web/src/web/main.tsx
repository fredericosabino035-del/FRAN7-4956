import {authClient} from "./lib/auth";
await authClient.managedAuth.handleRedirect();
await import("./__main");
