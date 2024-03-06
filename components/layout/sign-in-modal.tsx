"use client";

import { useState } from "react";

import { Icons } from "@/components/shared/icons";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useLogoutModal, useSigninModal, useTokenModal } from "@/hooks/use-signin-modal";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Link2, LogOut } from "lucide-react";
import { Input } from "../ui/input";
import axios from "axios";

export const SignInModal = () => {
  const signInModal = useSigninModal();
  const [signInClicked, setSignInClicked] = useState(false);

  return (
    <Modal showModal={signInModal.isOpen} setShowModal={signInModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a>
          <h3 className="font-urban text-2xl font-bold">Sign In</h3>
          <p className="text-sm text-gray-500">
            This is strictly for demo purposes - only your email and profile
            picture will be stored.
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
          <Button
            variant="default"
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              signIn("google", { redirect: false }).then(() =>
                // TODO: fix this without setTimeOut(), modal closes too quickly. Idea: update value before redirect
                setTimeout(() => {
                  signInModal.onClose();
                }, 1000)
              );
            }}
          >
            {signInClicked ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}{" "}
            Sign In with Google
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const SetTokenModal = () => {
  const signInModal = useTokenModal();
  const [token, setToken] = useState<string>("")
  const [signInClicked, setSignInClicked] = useState(false);
  const [error, setError] = useState<string>("")


  const validateToken = async () => {
    setSignInClicked(true)
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.github.com/octocat',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Cookie': 'logged_in=no'
        }
      };
      const response = await axios.request(config)
      console.log(" === response === > ", response);
      localStorage.setItem('gh-token', token)
      signInModal.onClose()
    } catch (error) {
      console.log(" === error === > ", error);
      setError("Token not valid please try again")
      localStorage.removeItem('gh-token'); // Clear the invalid token
      signInModal.onOpen(); // Prompt the user to enter a new token
    } finally {
      // setSignInClicked(false)
    }
  }

  return (
    <Modal showModal={signInModal.isOpen} setShowModal={signInModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a>
          <h3 className="font-urban text-2xl font-bold">Enter your Github Pesonal Access Token</h3>
          <p className="text-sm text-gray-500">
            You need an Github personal access token to use AskGit. Your token is secure and is stored locally on your browser and
            never sent anywhere else.
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
          <Input value={token} placeholder="ghb_XXXXXXXXXXXXXXXXXX" onChange={(event) => setToken(event.target.value)} />
          <p className="text-sm text-center text-red-500">{error}</p>
          <Button
            variant="default"
            disabled={signInClicked}
            onClick={validateToken}
          >
            {signInClicked ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.gitHub className="mr-2 size-4" />
            )}{" "}
            Set token
          </Button>
          <Link target="_blank" className="flex justify-center" href="https://github.com/settings/tokens">
            <Link2 />
            <span style={{ marginLeft: 10 }}>Get your PAT from Github Dashboard</span>
          </Link>
          <div className="text-center">
            <span>—</span>
          </div>
          <div className="text-center">
            <span>1. Choose Generate New Token (Classic)</span>
          </div>
          <div className="text-center">
            <span>2. Select 'Repo' (all)</span>
          </div>

        </div>
      </div>
    </Modal >
  );
};



export const LogoutModal = () => {
  const signInModal = useLogoutModal();
  const [signInClicked, setSignInClicked] = useState(false);

  return (
    <Modal showModal={signInModal.isOpen} setShowModal={signInModal.onClose}>
      <div className="w-full" style={{
        backgroundColor: "rgba(17, 17, 17, 0.7)", // Changed to a darker background color
        // backdropFilter: "blur(8px)"
      }}>
        <div className="flex flex-col items-center justify-center space-y-3 border-b px-4 py-6 pt-8 text-center md:px-16" style={{
          backgroundColor: "rgba(17, 17, 17, 0.1)", // Changed to a darker background color
        }}>
          <a href={siteConfig.url}>
            <Icons.warning className="size-10 text-white-700" />
          </a>
          <h3 className="font-urban text-2xl font-bold" style={{
            color: "rgba(255, 255, 255, 0.9)" // Changed text color to a lighter shade for dark mode
          }}>Are you sure you want to logout?</h3>
          <p className="text-sm" style={{
            color: "rgba(255, 255, 255, 0.7)" // Changed text color to a lighter shade for dark mode
          }}>
            Your Github personal access will be removed from your browser. You can always sign in again.
          </p>
        </div>

        <div className="flex flex-col space-y-4 px-4 py-8 md:px-16">
          <Button
            variant="default"
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              localStorage.clear()
              signOut({
                callbackUrl: `${window.location.origin}/`,
              })
            }}
          >
            {signInClicked ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 size-4" />
            )}{" "}
            Log out
          </Button>
        </div>
      </div>
    </Modal >
  );
};
