'use client';
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { debounce } from 'lodash'
import Link from "next/link";
import { toast } from "@/components/ui/use-toast"
import { IconMessage, IconPlus, IconRefresh, IconShare, IconStop, IconTrash } from '@/components/ui/icons'
import { useRouter } from "next/navigation";
import Select from 'react-select';
import "./style.css"
import { ChatMessage } from "@/components/ui/chat-message";
import { Button } from "@/components/ui/button";
import { PromptForm } from "@/components/prompt-form";

export default function AiChat({ params, user }) {
    const router = useRouter()
    const [input, setInput] = useState("")
    const [sessionList, setSessionList] = useState([])
    const [currentChat, setCurrentChat] = useState([])
    const [ingestedRepo, setIngestedRepo] = useState<any>([])
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [messages, setMessages] = useState<any>([]);
    const [isLoading, setLoading] = useState<boolean>(false)
    const [prevInput, setPrevInput] = useState<any>("")

    useEffect(() => {
        const getSessions = async () => {
            try {
                const response = await axios.get(`/api/session/${params.session}`);
                if (response?.data) {
                    const resData: any = response.data
                    setSessionList(resData?.responseData)
                    setCurrentChat(resData?.currentChat)
                }
            } catch (error) {
                console.log(" === Error ===> ", error)
            }
        }
        getSessions()
    }, [params.session])

    useEffect(() => {
        const getIngestedRepo = async () => {
            try {
                const res = await axios.get('/api/ingest')
                setIngestedRepo((res.data?.data ?? []))
            } catch (error) {
                console.log(" === 37 ===> error ==> getIngestedRepo ==> ", error)
            }
        }
        getIngestedRepo()
    }, [])


    // useEffect(() => {
    //     const apiCall = setTimeout(() => {
    //         historyApiCall();
    //     }, 1000)
    //     return () => clearTimeout(apiCall)
    // }, [messages])

    const historyApiCall = async (payload: any) => {
        try {
            await axios.post('/api/history', payload)
        } catch (error) {
            console.log(" === Error ===> ", error)
        }
    }


    const onDeleteSessions = debounce(async (session) => {
        try {
            await axios.delete(`/api/session/${session}`);
            toast({
                title: "Session successfully deleted",
                description: "You session and chat history has been deleted.",
            })
            router.push(`/dashboard/chat/${Math.random().toString(36).slice(2)}`)
        } catch (error) {
            console.log(" === Error ===> ", error)
        }
    }, 500)
    const [isBotReplying, setIsBotReplying] = useState<boolean>(false);

    const submitChat = debounce(async (submitInput = null) => {
        setLoading(true)
        setIsBotReplying(true) // Set this when the chat is submitted
        try {
            setMessages((prev) => ([...prev, {
                role: 'user',
                content: submitInput ? submitInput : input
            }]))

            setPrevInput(submitInput ? submitInput : input)
            const res = await axios.post('/api/chat', {
                question: input,
                repoName: selectedOption?.value,
            })
            if (res.data?.data?.data) {
                console.log("DATA HERE", res.data?.data?.data)
                const resData = res.data?.data?.data

                // Extract source_documents and prepare source list
                const sourceDocuments = resData?.source_documents;
                // Process source file names
                const sourceFiles = sourceDocuments?.map(doc => {
                    // Remove 'repodata_txt/' prefix and trim the extra '.txt' extension
                    let source = doc.metadata.source.replace('repodata_txt/', '');
                    source = source.replace(/\.txt$/, '');
                    return source;
                });

                // Append sources to the result message
                const messageContent = `${resData}`;

                setMessages((prev) => ([...prev, {
                    role: 'ai',
                    content: messageContent // Use the modified content with sources
                }]))

                // Modify the payload to include sources if needed
                const payload = {
                    title: input,
                    ai_result: messageContent, // This now includes the result and sources
                    session: params?.session
                }
                historyApiCall(payload)
                setIsBotReplying(false) // Reset this when the bot's response is received
            }
            setInput("")

        } catch (error) {
            console.log(" === 37 ===> error ==> getIngestedRepo ==> ", error)
        } finally {
            setLoading(false)
        }
    }, 100)


    const regenerateResponse = () => {
        setInput(prevInput)
        setTimeout(() => {
            submitChat(prevInput)
        }, 100)
    }

    console.log(" ==== currentChat ====> ", currentChat)
    const [selectedRepo, setSelectedRepo] = useState(null);

    return (
        <DashboardShell>
            <div>
                <div className="flex" >
                    <div className="flex flex-col h-full history-container" style={{
                        paddingLeft: '1em',
                    }}>
                        <div className="chat-container">
                            <div className="px-2 my-1 list-item" >
                                <Select
                                    placeholder="Select a Repo"
                                    value={selectedOption}
                                    onChange={(option) => {

                                        if (option) {
                                            setSelectedOption(option);
                                        }
                                    }}
                                    options={ingestedRepo.map((i: any) => ({
                                        label: i?.repo_name,
                                        value: i?.repo_name,
                                    }))}
                                    styles={{
                                        container: (style) => ({
                                            ...style,
                                            width: '100%',
                                        }),
                                        control: (provided) => ({
                                            ...provided,
                                            backgroundColor: 'transparent', // dark mode background color
                                            borderColor: '#333', // border color
                                            color: '#fff', // text color
                                            borderRadius: '0.7em', // border radius
                                            marginBottom: '1rem',

                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            color: '#fff', // text color
                                        }),
                                        placeholder: (provided) => ({
                                            ...provided,
                                            color: '#bbb', // placeholder text color
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            backgroundColor: 'rgba(0, 0, 0, 0.0)', // 10% opacity black
                                            backdropFilter: 'blur(17px)', // backdrop filter
                                            outline: "solid 1px rgba(255, 255, 255, 0.2)",
                                            borderRadius: "1em",

                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            color: '#fff', // text color
                                            backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.07)' : provided.backgroundColor, // Change background color to red when focused
                                            cursor: 'pointer', // Change background color to red when focused
                                            borderRadius: "0.5em",
                                        }),
                                    }}
                                />
                            </div>

                            <div className="px-2 my-1 list-item">
                                <Link
                                    href={`/dashboard/chat/${Math.random().toString(36).slice(2)}`}
                                    className='h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                                    style={{
                                        outline: "solid 1px rgba(255, 255, 255, 0.2)",
                                        marginBottom: '1em'
                                    }}
                                >
                                    <IconPlus className="-translate-x-2 stroke-2" />
                                    New Chat
                                </Link>
                            </div>

                            {
                                sessionList?.map((item: any, index: number) => {
                                    return (

                                        <div key={index} className="space-x-1 px-2 my-1 list-item">
                                            <Link
                                                href={`/dashboard/chat/${item?.session}`}
                                                className='h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                                                style={{
                                                    outline: "solid 1px rgba(255, 255, 255, 0.2)",
                                                }}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    className="size-6 p-0"
                                                >
                                                    <IconMessage className="mr-2 size-6" />
                                                </Button>

                                                <span className="truncate mr-2">{item?.title}</span>
                                                <div className="flex flex-row">
                                                    <Button
                                                        variant="ghost"
                                                        className="size-auto p-0"
                                                        onClick={() => onDeleteSessions(item?.session)}
                                                    >
                                                        <IconTrash />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </Link>

                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div style={{
                        overflow: 'auto',
                        height: '100vh',
                        paddingBottom: '20%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        scrollbarWidth: 'none', /* For Firefox */
                        msOverflowStyle: 'none', /* For Internet Explorer and Edge */
                        WebkitOverflowScrolling: 'touch', /* For smooth scrolling on iOS */
                    }} className="flex flex-col container">
                        {
                            (currentChat ?? []).map((item: any, index) => {
                                return (
                                    <div key={index} style={{
                                        paddingBottom: '2rem',
                                        width: '70%', // Update width to 100%
                                    }}>
                                        <ChatMessage user={user} message={{
                                            role: 'user',
                                            content: item.title
                                        }} />
                                        <ChatMessage user={user} message={{
                                            role: 'Ai',
                                            content: item.ai_result
                                        }} />
                                    </div>
                                )
                            })
                        }
                        {messages.map((item: any, index: any) => (
                            <div key={index} style={{
                                paddingBottom: '2rem',
                                width: '70%', // Update width to 100%
                            }}>
                                <ChatMessage user={user} isStream message={{ role: item?.role, content: item.content }} />
                            </div>
                        ))}

                        {/* Chat input */}

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            outline: "red 0px solid",
                            position: "fixed",
                            bottom: "0",
                            left: "50%",
                            transform: "translateX(-50%)",
                            paddingBottom: "1em",
                            paddingTop: "1em",
                            width: "100%",
                        }}>
                            {/* Action buttons */}
                            {/* <div className="flex flex-col justify-center items-center">
                                <div className="flex items-center justify-center h-12">
                                    {isBotReplying ? ( // If the bot is still generating a response
                                        <Button
                                            variant="outline"
                                            onClick={() => stop()} // Implement the stop function to interrupt the bot's response
                                            style={{
                                                opacity: '90%',
                                                backdropFilter: 'blur(100px)',
                                                position: 'relative',
                                                zIndex: '1',
                                            }}
                                        >
                                            <IconStop className="mr-2" />
                                            Stop generating
                                        </Button>
                                    ) : ( // If the bot has finished generating a response
                                        <Button
                                            variant="outline"
                                            onClick={() => regenerateResponse()} // Call regenerateResponse to generate a new response
                                            style={{
                                                opacity: '90%',
                                                backdropFilter: 'blur(100px)',
                                                position: 'relative',
                                                zIndex: '1',
                                                marginBottom: '2em',
                                            }}
                                            disabled={!prevInput} // Disable the button if there is no previous input
                                        >
                                            <IconRefresh className="mr-2" />
                                            Regenerate response
                                        </Button>
                                    )}
                                </div>
                            </div> */}
                            <PromptForm
                                isDisabled={!selectedOption}
                                onSubmit={submitChat}
                                input={input}
                                setInput={setInput}
                                isLoading={isLoading}
                                repo_name={selectedOption?.value}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </DashboardShell>
    )
}
