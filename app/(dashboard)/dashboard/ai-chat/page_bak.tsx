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
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { IoIosArrowDroprightCircle } from "react-icons/io";



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


    useEffect(() => {
        const apiCall = setTimeout(() => {
            historyApiCall();
        }, 1000)
        return () => clearTimeout(apiCall)
    }, [messages])

    const historyApiCall = async () => {
        try {
            if (messages.length > 0 && messages[messages.length - 2]?.content) {
                const payload = {
                    title: messages[messages.length - 2]?.content,
                    ai_result: messages[messages.length - 1]?.content,
                    session: params?.session
                }
                await axios.post('/api/history', payload)
            }
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
            router.push(`/dashboard/ai-chat/${Math.random().toString(36).slice(2)}`)
        } catch (error) {
            console.log(" === Error ===> ", error)
        }
    }, 500)

    const submitChat = debounce(async (submitInput = null) => {
        setLoading(true)
        try {
            setMessages((prev) => ([...prev, {
                role: 'user',
                content: submitInput ? submitInput : input
            }]))
            setPrevInput(submitInput ? submitInput : input)
            setInput("")
            const res = await axios.post('/api/chat', {
                question: input,
                repoName: selectedOption?.value,
            })
            if (res.data?.data?.data) {
                const resData = res.data?.data?.data
                setMessages((prev) => ([...prev, {
                    role: 'ai',
                    content: resData?.result
                }]))
            }
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
        }, 1000)
    }
    const [sidebarOpen, setSidebarOpen] = useState(true); // State variable to track sidebar open/close

    // Function to toggle sidebar open/close
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };


    return (
        <DashboardShell>
            <div style={{ display: 'flex', overflow: sidebarOpen ? 'hidden' : 'hidden' }}>
                {/* Left side */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: sidebarOpen ? 0 : '-21vw', // Adjust width as needed
                        width: '21vw', // Adjust width as needed
                        height: '100%',
                        backgroundColor: '#1D1F2665', // Sidebar background color
                        backdropFilter: 'blur(25px)', // Sidebar background blur
                        transition: 'left 0.3s ease',
                        zIndex: 1000, // Ensure sidebar is on top of other content
                        padding: '1rem',
                        boxShadow: '0 0 40px 10px rgba(0, 0, 0, 0.2)', // Sidebar shadow
                        outline: "solid 1px rgba(255, 255, 255, 0.2)",
                    }}
                >                    {/* Chat history */}
                    <div className="ai-chat-container">
                        {/* Select repo */}
                        <div className="px-2 my-1 list-item">
                            <Select
                                placeholder="Select a Repo"
                                defaultValue={selectedOption}
                                onChange={setSelectedOption}
                                options={ingestedRepo.map((i: any) => ({
                                    label: i?.repo_name,
                                    value: i?.repo_name,
                                }))}
                                styles={{
                                    container: style => ({ ...style, width: '100%' }),
                                    control: provided => ({
                                        ...provided,
                                        backgroundColor: 'transparent',
                                        borderColor: '#333',
                                        color: '#fff',
                                        borderRadius: '0.7em',
                                        marginBottom: '1rem',
                                    }),
                                    singleValue: provided => ({ ...provided, color: '#fff' }),
                                    placeholder: provided => ({ ...provided, color: '#bbb' }),
                                    menu: provided => ({
                                        ...provided,
                                        backgroundColor: 'rgba(0, 0, 0, 0.0)',
                                        backdropFilter: 'blur(17px)',
                                        outline: 'solid 1px rgba(255, 255, 255, 0.2)',
                                        borderRadius: '1em',
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        color: '#fff',
                                        backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.07)' : provided.backgroundColor,
                                        cursor: 'pointer',
                                    }),
                                }}
                            />
                        </div>
                        {/* New Chat */}
                        <div className="px-2 my-1 list-item">
                            <Link
                                href={`/dashboard/ai-chat/${Math.random().toString(36).slice(2)}`}
                                className='h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                                style={{ outline: "solid 1px rgba(255, 255, 255, 0.2)", marginBottom: '1em' }}
                            >
                                <IconPlus className="-translate-x-2 stroke-2" />
                                New Chat
                            </Link>
                        </div>
                        {/* Session List */}
                        {sessionList.map((item: any, index: number) => (
                            <div key={index} className="space-x-1 px-2 my-1 list-item">
                                <Link
                                    href={`/dashboard/ai-chat/${item?.session}`}
                                    className='h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                                    style={{ outline: "solid 1px rgba(255, 255, 255, 0.2)" }}
                                >
                                    <Button variant="ghost" className="size-6 p-0">
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
                        ))}
                    </div>
                </div>
                {/* chat content, chat container */}
                <div style={{
                    overflowY: 'auto',
                    maxHeight: '80vh',
                    width: '100%',
                    paddingLeft: "21vw",
                }}>

                    {/* Chat messages */}
                    {currentChat.map((item: any, index) => (
                        <div key={index} style={{ paddingBottom: '2rem', width: '80%', maxWidth: '600px' }}>
                            <ChatMessage user={user} message={{ role: 'user', content: item.title }} />
                            <ChatMessage user={user} message={{ role: 'Ai', content: item.ai_result }} />
                        </div>
                    ))}
                    {/* Displaying messages */}
                    {messages.map((item: any, index: any) => (
                        <div className="container" key={index} style={{ width: '80%', maxWidth: '600px' }}>
                            <ChatMessage user={user} isStream message={{ role: item?.role, content: item.content }} />
                        </div>
                    ))}
                </div>

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
                    <div className="flex flex-col justify-center items-center">
                        <div className="flex items-center justify-center h-12">
                            {isLoading ? (
                                <Button
                                    variant="outline"
                                    onClick={() => stop()}
                                    style={{
                                        opacity: '90%',
                                        backdropFilter: 'blur(100px)',
                                        position: 'relative',
                                        zIndex: '1',
                                        // marginBottom: '2em',
                                    }}
                                >
                                    <IconStop className="mr-2" />
                                    Stop generating
                                </Button>
                            ) : prevInput !== "" && (
                                <Button
                                    variant="outline"
                                    onClick={() => regenerateResponse()}
                                    style={{
                                        opacity: '90%',
                                        backdropFilter: 'blur(100px)',
                                        position: 'relative',
                                        zIndex: '1',
                                        marginBottom: '2em',
                                    }}
                                >
                                    <IconRefresh className="mr-2" />
                                    Regenerate response
                                </Button>
                            )}
                        </div>
                    </div>
                    <PromptForm
                        isDisabled={!selectedOption}
                        onSubmit={submitChat}
                        input={input}
                        setInput={setInput}
                        isLoading={isLoading}
                        repo_name={selectedOption?.value}
                    />
                </div>
                <button
                    style={{
                        position: 'fixed',
                        top: 'calc(50% - 20px)', // Adjust the value as needed to vertically center the button
                        left: sidebarOpen ? 'calc(21vw + 10px)' : '10px', // Adjust the value to match the sidebar width
                        zIndex: 1100, // Ensure button is on top of sidebar
                        transition: 'left 0.3s ease', // Add transition effect for smooth movement
                    }}
                    onClick={toggleSidebar}
                >
                    {/* Render the arrow icon based on the sidebar state with opacity 80% */}
                    {sidebarOpen ? <IoIosArrowDropleftCircle size={"2em"} style={{ opacity: '0.8' }} /> : <IoIosArrowDroprightCircle size={"2em"} style={{ opacity: '0.8' }} />}
                </button>
            </div>
        </DashboardShell>
    )
}
