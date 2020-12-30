import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";

import { PrismaClient } from "@prisma/client";

import * as util from "../../../components/utility/server";

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

const options = {
  debug: false,

  secret: process.env.SECRET,

  providers: [
    Providers.Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      scope: "identify email guilds",
    }),
  ],

  adapter: Adapters.Prisma.Adapter({
    prisma,
    modelMapping: {
      User: "user",
      Account: "account",
      Session: "session",
      VerificationRequest: "verificationRequest",
      Guild: "guild",
    },
  }),

  session: {
    jwt: true,
  },

  callbacks: {
    jwt: async (token, user, account, profile, isNewUser) => {
      if (user) {
        let img = profile.avatar
          ? "http://cdn.discordapp.com/avatars/" +
            profile.id +
            "/" +
            profile.avatar +
            ".png"
          : "https://upload.wikimedia.org/wikipedia/commons/9/90/Discord-512.webp";

        token = {
          id: user.id,
          name: profile.username,
          image: img,
          email: profile.email,
        };

        const guilds = await util.getUserDiscordGuilds(user.accessToken);
        await util.updateGuilds(prisma, user, guilds);
      }

      return Promise.resolve(token);
    },

    session: async (session, user) => {
      // console.log("user", user);
      // console.log("session", session);

      session.user = user;
      return Promise.resolve(session);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
