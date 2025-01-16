import { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import Image from 'next/image';
import bg from '@/public/bg.jpg';

export const metadata: Metadata = {
  title: "AskGit - Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div>
      <div className="desktop-content">
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <Image src={bg} alt="Background" layout="fill" objectFit="cover" quality={100} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0))', zIndex: 0, }} />
          <section style={{ paddingTop: "20vh", }}>
            <div className="container flex max-w-[64rem] flex-col items-center gap-5 text-center">
              <h1 className="animate-fade-up text-balance font-urban text-4xl font-extrabold tracking-tight opacity-0 sm:text-5xl md:text-6xl lg:text-7xl" style={{ animationDelay: "0.25s", animationFillMode: "forwards", textShadow: "2px 0px 40px 5px rgba(0,0,0,0.9)" }} >
                Welcome to{" "}
                <span className="text-gradient_indigo-purple font-extrabold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.0)" }}>
                  AskGit
                </span>
              </h1>
              <div className="max-w-[72rem] animate-fade-up text-balance leading-normal text-muted-foreground opacity-0 sm:text-xl sm:leading-8" style={{ animationDelay: "0.35s", animationFillMode: "forwards", fontWeight: "700", backdropFilter: "blur(15px)", outline: "solid 1px rgba(255, 255, 255, 0.2)", paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "1rem", paddingBottom: "1rem", borderRadius: "1em", backgroundColor: "rgba(0, 0, 0, 0.05)", marginTop: "1rem", marginBottom: "1rem", }} >
                <p> To get startedx, login with your GitHub Account </p>
              </div>
              <div className="flex animate-fade-up justify-center space-x-2 opacity-0 md:space-x-4" style={{ animationDelay: "0.4s", animationFillMode: "forwards", textShadow: "1px 1px 2px rgba(0,0,0,0.2)", position: "relative", backdropFilter: "blur(10px)", zIndex: 1, borderRadius: "5em", }} >
                <UserAuthForm />
              </div>
            </div>
          </section>
          <div className="video-container" style={{ position: 'relative', paddingTop: '56.25%', marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            <iframe className="responsive-iframe" style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '40%', height: '40%', border: 'none', }} src="https://www.youtube.com/embed/ZSdY7KFPKN4?" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen >
            </iframe>
          </div>
        </div>
      </div>
      <div className="mobile-message">
        <div style={{
          height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexDirection: 'column', backgroundColor: '#191A1D'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFFFFF67' }}>AskGit</h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '1rem', textAlign: 'center', padding: "2em" }}>🖥️<br></br><br></br>Please switch to a larger screen to chat with your GitHub Repository.
          </p>
        </div>
      </div>
      <style >{`
        @media (max-width: 767px) {
          .desktop-content {
            display: none;
          }
          .mobile-message {
            display: block;
          }
        }
        @media (min-width: 768px) {
          .desktop-content {
            display: block;
          }
          .mobile-message {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
