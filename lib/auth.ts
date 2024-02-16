import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, profile, account }) {
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
      }

     

      return token
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.id) {
        session.user.id = String(token.id)
      }
      let user: any
      let repoList: any[] = []
      
      // const dbUser = await prisma.user.findFirst({
      //   where: {
      //     email: token.email,
      //   },
      // })

      // console.log(" ==== dbUser === ", dbUser)

      const finalResponse = {
        ...session,
        userDetail: user,
        repoList: repoList
      }
      return finalResponse
    },
    authorized({ auth }) {
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/login' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
