import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function IndexPage() {
    return (
        <>
            <div style={{
                backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0) ), url('/bg.jpg')",
                height: "100vh",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
                <section style={{
                    paddingTop: "20vh",
                }}>
                    <div className="container flex max-w-[64rem] flex-col items-center gap-5 text-center">
                        <h1
                            className="animate-fade-up text-balance font-urban text-4xl font-extrabold tracking-tight opacity-0 sm:text-5xl md:text-6xl lg:text-7xl"
                            style={{ animationDelay: "0.25s", animationFillMode: "forwards", textShadow: "2px 2px 4px rgba(0,0,0,0.9)" }}
                        >
                            Chat with your Repo using{" "}
                            <span className="text-gradient_indigo-purple font-extrabold" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.0)" }}>
                                AskGit
                            </span>
                        </h1>

                        <div
                            className="max-w-[72rem] animate-fade-up text-balance leading-normal text-muted-foreground opacity-0 sm:text-xl sm:leading-8"
                            style={{
                                animationDelay: "0.35s", animationFillMode: "forwards", fontWeight: "700", backdropFilter: "blur(15px)",
                                outline: "solid 1px rgba(255, 255, 255, 0.2)",
                                paddingLeft: "2rem",
                                paddingRight: "2rem",
                                paddingTop: "1rem",
                                paddingBottom: "1rem",
                                borderRadius: "1em",
                                backgroundColor: "rgba(0, 0, 0, 0.05)", // Adjust transparency as needed
                                marginTop: "1rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <p>
                                Speed run code reviews. Chat with your GitHub Repo using AI
                            </p>
                        </div>

                        <div
                            className="flex animate-fade-up justify-center space-x-2 opacity-0 md:space-x-4"
                            style={{ animationDelay: "0.4s", animationFillMode: "forwards", textShadow: "1px 1px 2px rgba(0,0,0,0.2)", position: "relative", backdropFilter: "blur(10px)", zIndex: 1, borderRadius: "5em", }}
                        >
                            <Link href="/dashboard" aria-label="Start" style={{
                                textShadow: "0px 0px 4px rgba(0,0,0,0.1)",
                                // boxShadow: "0 0 30px 10px rgba(0, 0, 0, 1)",
                                borderRadius: "5em",
                                backgroundColor: "rgba(255, 255, 255, 0.12)", // Adjust transparency as needed
                                zIndex: 1, // Ensure the button is on top of the blurred background
                                color: "white",
                                paddingLeft: "2.5rem", // Increased padding
                                paddingRight: "2.5rem", // Increased padding
                                paddingTop: "0.7rem", // Increased padding
                                paddingBottom: "0.7rem", // Increased padding
                                fontSize: "1.1rem", // Increased font size
                                fontWeight: "700",
                                opacity: "0.9",
                                border: "solid 1px rgba(255, 255, 255, 0.6)",
                            }}>
                                Start Chatting
                            </Link>
                        </div>


                    </div>
                </section >
            </div >
        </>
    );
}
