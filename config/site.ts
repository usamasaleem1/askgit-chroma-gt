import { env } from "@/env.mjs";
import { SiteConfig } from "types"

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "AskGit",
  description:
    "Chat with your Repo using",
  url: site_url,
  ogImage: `${site_url}/og.jpg`,
  links: {
    twitter: "",
    github: "",
  },
  mailSupport: "",
  emailFrom:  "",
}
