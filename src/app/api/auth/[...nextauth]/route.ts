import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// cosnt handler = NextAuth({
//     providers:[
//         GoogleProvider({

//         })
//     ]
// })
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
