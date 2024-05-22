import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import axios from "axios";
import { BASE_URL } from "@/lib/constants";

export const authOptions = {
    // Configure one or more authentication providers
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: "/dashboard",
            checks: ['none']
        }),
        // ...add more providers here
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                const accessToken = account.access_token;
                const idToken = account.id_token;
                try {
                    const response = await axios.post(
                        BASE_URL + '/backend/social/login/google/',
                        {
                            access_token: accessToken,
                            id_token: idToken
                        }
                    );
                    user.accessToken = response.data.access_token;
                    user.userID = response.data.userID;
                    user.givenName = profile.given_name;
                    return true;
                } catch (error) {
                    return false;
                }
            }
            return false;
        },
        async jwt({ token, user }) {
            // Persist the OAuth access_token to the token right after signin
            if (user) {
                token.accessToken = user.accessToken;
                token.userID = user.userID;
                token.givenName = user.givenName;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken;
            session.userID = token.userID;
            session.givenName = token.givenName;
            return session;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl
        },
    }        
}

const handler = (req, res) => NextAuth(req, res, authOptions);
export default handler;