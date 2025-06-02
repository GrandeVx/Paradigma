// Client-side exports only
export { signIn, signUp, useSession , signOut , authClient, emailOtp } from "./lib/auth-client";

// Server-side exports should be imported directly from ./lib/auth
// export { auth } from "./lib/auth"; // Remove this to prevent client bundling