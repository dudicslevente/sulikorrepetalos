import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/bejelentkezes",
  },
});

export const config = {
  matcher: [
    "/((?!bejelentkezes|regisztracio|api|_next/static|_next/image|favicon.ico).*)",
  ],
};