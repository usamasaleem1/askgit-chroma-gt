



'use client';
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import BarLoader from "react-spinners/BarLoader";
import MoonLoader from "react-spinners/MoonLoader";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTokenModal } from "@/hooks/use-signin-modal";
import { Icons } from "@/components/shared/icons";
import { Input } from "@/components/ui/input";
import Modal from 'react-modal';
import { RiErrorWarningLine } from "react-icons/ri";

export default function DashboardPage() {
  const [isHovering, setIsHovering] = useState(true);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [repoToIngest, setRepoToIngest] = useState(null);
  const [repoList, setRepoList] = useState([])
  const [ingestedRepo, setIngestedRepo] = useState<any>([])
  const [loader, setLoader] = useState(true)
  const [ingestingLoading, setIngestingLoading] = useState({})
  const [publicIngestingLoading, setPublicIngestingLoading] = useState(false)
  const [ghToken, setGhToken] = useState<string>("")
  const tokenModal = useTokenModal()
  const [publicRepo, setPublicRepo] = useState("")
  const [isTokenValid, setIsTokenValid] = useState(true); // New state variable to track token validity

  useEffect(() => {
    const getGhToken = async () => {
      const res = localStorage.getItem('gh-token')
      console.log(" === response ====> ", res)
      if (!res) {
        tokenModal.onOpen()
      }
    }
    getGhToken()
  }, [])

  useEffect(() => {
    const token: any = localStorage.getItem("gh-token")
    setGhToken(token)
    if (token !== null && !tokenModal.isOpen)
      getRepoList()
  }, [tokenModal.isOpen])

  const getRepoList = async () => {
    setLoader(true);
    try {
      const token = localStorage.getItem("gh-token");
      const res = await axios.get('/api/repo/' + token).then(res => res.data);
      setRepoList(res.data);
      setIsTokenValid(true); // Set token as valid when data is successfully fetched
    } catch (error) {
      console.log(" === 12 ===> error ==> useGitRepository ==> ", error);
      setRepoList([]);
      setIsTokenValid(false); // Set token as invalid if there is an error
    } finally {
      setLoader(false);
    }
  };


  useEffect(() => {
    const getIngestedRepo = async () => {
      try {
        const res = await axios.get('/api/ingest')
        setIngestedRepo((res.data?.data ?? []).map(i => i?.repo_url))
      } catch (error) {
        console.log(" === 37 ===> error ==> getIngestedRepo ==> ", error)
      }
    }
    getIngestedRepo()
  }, [])

  const onRepoIngest = async (item: any) => {

    setIngestingLoading(prev => ({
      ...prev,
      [item?.id]: true
    }))
    try {
      const token = localStorage.getItem("gh-token")
      const res = await axios.post('/api/ingest', {
        repoUrl: item.git_url,
        repoName: item.name,
        token: token
      })
      setIngestedRepo(pre => ([...pre, item.git_url]))
    } catch (error) {
      console.log(" === 12 ===> error ==> useGitRepository ==> ", error)
    } finally {
      setIngestingLoading(prev => ({
        ...prev,
        [item?.id]: false
      }))
    }
  }

  const handleIngestConfirmation = async (repo) => {
    console.log(" === 12 ===> repo ==> ", repo)
    // Close the confirmation modal
    setShowConfirmationModal(false);
    // Run the ingest script
    await onRepoIngest(repo);
  };


  const handleIngestButtonClick = (repo) => {
    // Set the repo to ingest
    setRepoToIngest(repo);
    // Show the confirmation modal
    setShowConfirmationModal(true);
  };

  const onPublicRepoIngest = async (url: any) => {
    if (!url) return null;
    const match = url.match(
      /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
    );
    if (!match || !(match.groups?.owner && match.groups?.name)) return null;

    setPublicIngestingLoading(true)
    try {
      const token = localStorage.getItem("gh-token")
      await axios.post('/api/ingest', {
        repoUrl: url,
        repoName: match?.groups?.name,
        token: token,
        isPublic: true
      });

      // Fetch the updated list of repositories after ingestion
      await getRepoList();

      // Clear the input field
      setPublicRepo("");
    } catch (error) {
      console.log(" === 12 ===> error ==> useGitRepository ==> ", error)
    } finally {
      setPublicIngestingLoading(false);
    }
  }

  const tableCellStyle = {
    margin: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // This will center the content horizontally
  };

  const tableRender = useMemo(() => {
    return repoList.map((repo: any, index) => {
      return (
        <>
          <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <th scope="row">{repo?.name}</th>
            <td style={tableCellStyle}>
              <a target="_blank" href={repo?.html_url} >{repo?.html_url}</a>
            </td>
            <td >{repo?.private ? 'Private' : 'Public'}</td>
            <td style={tableCellStyle}>
              {
                ingestingLoading?.[repo?.id] ?
                  <div style={tableCellStyle}>
                    <BarLoader color="#00A4F1" />
                  </div>
                  :
                  <>
                    {
                      ingestedRepo.includes(repo?.git_url) ?
                        <Button
                          variant="outline"
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          onClick={() => {
                            isHovering ? onRepoIngest(repo) : setShowConfirmationModal(true);
                          }}
                          style={{
                            borderRadius: '4rem',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary)',
                            paddingRight: '2rem',
                            paddingLeft: '2rem',
                            outline: "solid 2px #169E6C",
                          }}
                        >
                          {isHovering ? "Reingest" : "Ingested"}
                        </Button>
                        :
                        <Button
                          style={{
                            borderRadius: '4rem',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary)',
                            paddingRight: '2rem',
                            paddingLeft: '2rem',
                            outline: "solid 1px rgba(255, 255, 255, 0.5)",
                          }}
                          onClick={() => onRepoIngest(repo)}>Ingest</Button>
                    }
                  </>
              }
            </td>
          </tr>
          {index < repoList.length - 1 && <tr><td colSpan={4} style={{ height: '1px', backgroundColor: 'rgba(250, 250, 250, 0.12)' }}></td></tr>}
        </>
      );
    });
  }, [ingestingLoading, repoList, ingestedRepo]);



  return (
    <DashboardShell>


      {
        ghToken === null || ghToken === "0" ? (
          <div style={{ textAlign: "center", fontSize: "1rem", fontWeight: "normal", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 35%" }}>
            <RiErrorWarningLine style={{ fontSize: "4rem", marginBottom: "2rem", color: "rgba(255, 255, 255, 0.90)" }} />
            <div style={{ marginBottom: "2rem" }}>
              <strong>Your GitHub Token is not set.</strong> It should look like "ghp_XXXXXXXXXXXXXXXXXX". <br />Please click the button below to set it up.<br />
            </div>
            <Button variant={"outline"} className="rounded-3xl border-white border-2" onClick={() => tokenModal.onOpen()} >
              <Icons.gitHub className="mr-2 size-5" /> Set GitHub Token
            </Button>
          </div>
        ) : !isTokenValid ? (
          <div style={{ textAlign: "center", fontSize: "1rem", fontWeight: "normal", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 35%" }}>
            <RiErrorWarningLine style={{ fontSize: "4rem", marginBottom: "2rem", color: "rgba(255, 255, 255, 0.90)" }} />
            <div style={{ marginBottom: "2rem" }}>
              <strong>You haven't entered a valid GitHub Token.</strong> It should look like "ghp_XXXXXXXXXXXXXXXXXX". <br />Please click the button below to set it up.<br />
            </div>
            <Button variant={"outline"} className="rounded-3xl border-white border-2" onClick={() => tokenModal.onOpen()} >
              <Icons.gitHub className="mr-2 size-5" /> Set GitHub Token
            </Button>
          </div>
        ) : (
          <div style={{ maxHeight: "100vh", overflow: "auto", paddingBottom: "15rem", paddingTop: "1em" }} className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div style={{ marginTop: 10, width: "100%", maxWidth: "45rem" }} className="container absolute flex justify-center items-center left-0 right-0">
              <Input style={{
                borderRadius: '1rem',
                outline: "solid 1px rgba(255, 255, 255, 0.3)",
              }}
                value={publicRepo} onChange={(e) => setPublicRepo(e.target.value)} placeholder="Chat with public GitHub repo... (e.g https://github.com/openai/whisper)" />
              {
                publicIngestingLoading ? <div className="flex justify-center items-center ml-6"><BarLoader color="#FFFFFFC8" /></div>
                  :
                  <Button style={{
                    marginLeft: 10,
                    borderRadius: '1rem',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary)',
                    paddingRight: '2rem',
                    paddingLeft: '2rem',
                    outline: "solid 1px rgba(255, 255, 255, 0.3)",
                  }} disabled={!publicRepo} onClick={() => onPublicRepoIngest(publicRepo)} variant="outline">Ingest</Button>
              }
            </div>

            {
              loader ? (
                <div style={{ marginTop: 200 }} className="flex w-full justify-center">
                  <MoonLoader color="#FFFFFFD8" size={30} />
                </div>
              ) : repoList.length > 0 ? (
                <div style={{
                  width: "80vw",
                  margin: "0 auto", // Center the div horizontally
                  justifyContent: "center", // Center the child div horizontally
                }}>
                  <div style={{ textAlign: "center" }}> {/* This div will center the inner div */}
                    <div style={{
                      display: "inline-block", // This div will wrap the content
                      marginTop: "5em",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      backgroundColor: "#FFFFFF0C",
                      paddingLeft: "2em",
                      paddingRight: "2em",
                      paddingTop: "1em",
                      paddingBottom: "1em",
                      borderRadius: "1.5em",
                      border: "1px solid #FFFFFF1C"
                    }} className="text-sm text-gray-400">or choose your own repo below...
                    </div>
                  </div>
                  <table
                    style={{
                      marginTop: "2rem",
                      marginLeft: "auto",
                      marginRight: "auto",
                      outline: "solid 1px rgba(255, 255, 255, 0.2)",
                      borderRadius: "2em",
                    }} // Centering the table
                    className="w-full text-sm text-center rounded-xl overflow-hidden"
                  >
                    <thead className="text-md bg-gray-200 dark:bg-black dark:text-gray-400">
                      <tr>
                        <th className="px-8 py-6 border-b border-gray-300 dark:border-gray-600">Repo name</th>
                        <th className="px-8 py-6 border-b border-gray-300 dark:border-gray-600">GitHub URL</th>
                        <th className="px-8 py-6 border-b border-gray-300 dark:border-gray-600">Private/Public</th>
                        <th className="px-8 py-6 border-b border-gray-300 dark:border-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody >
                      {!loader && tableRender}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", fontSize: "1rem", fontWeight: "normal", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 35%" }}>
                  <RiErrorWarningLine style={{ fontSize: "4rem", marginBottom: "2rem", color: "rgba(255, 255, 255, 0.90)" }} />
                  <div style={{ marginBottom: "2rem" }}>
                    <strong>You haven't entered your GitHub Token yet or it has expired.</strong> It should look like "ghp_XXXXXXXXXXXXXXXXXX". <br />Please click the button below to set it up. <br /><br />If you think this is a mistake, refresh the page to try again.<br />
                  </div>
                  <Button variant={"outline"} className="rounded-3xl border-white border-2" onClick={() => tokenModal.onOpen()} >
                    <Icons.gitHub className="mr-2 size-5" /> Set GitHub Token
                  </Button>
                </div>
              )
            }
          </div>
        )
      }
    </DashboardShell>
  )
}


