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

export default function DashboardPage() {
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
    setLoader(true)
    try {
      const token = localStorage.getItem("gh-token")
      const res = await axios.get('/api/repo/' + token).then(res => res.data)
      setRepoList(res.data)
    } catch (error) {
      console.log(" === 12 ===> error ==> useGitRepository ==> ", error)
      setRepoList([])
    } finally {
      setLoader(false)
    }
  }

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


  const tableRender = useMemo(() => {
    return repoList.map((repo: any, index) => {
      return (
        <tr key={index}>
          <th scope="row">{repo?.name}</th>
          <td>
            <a target="_blank" href={repo?.html_url} >{repo?.html_url}</a>
          </td>
          <td>{repo?.private ? 'Private' : 'Public'}</td>
          <td>
            {
              ingestingLoading?.[repo?.id] ?
                <BarLoader color="#00A4F1" />
                :
                <>
                  {
                    ingestedRepo.includes(repo?.git_url) ?
                      <Button variant="outline" onClick={() => {
                        setShowConfirmationModal(true);
                      }} style={{
                        borderRadius: '4rem',
                        backgroundColor: 'transparent',
                        color: 'var(--color-primary)',
                        paddingRight: '2rem',
                        paddingLeft: '2rem',
                        outline: "solid 2px #16D061A1",
                        margin: "1rem"
                      }}>Ingested</Button>
                      :
                      <Button
                        style={{
                          borderRadius: '4rem',
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary)',
                          paddingRight: '2rem',
                          paddingLeft: '2rem',
                          outline: "solid 1px rgba(255, 255, 255, 0.5)",
                          margin: "1rem"
                        }}
                        onClick={() => onRepoIngest(repo)}>Ingest</Button>
                  }
                </>
            }
          </td>
        </tr>
      );
    });
  }, [ingestingLoading, repoList, ingestedRepo]);



  return (
    <DashboardShell>
      <Modal
        isOpen={showConfirmationModal}
        onRequestClose={() => setShowConfirmationModal(false)}
        style={{
          content: {
            width: '28em', // Adjust width as needed
            height: '11em', // Let the height adjust based on content
            margin: 'auto', // Center horizontally
            overflow: "hidden", // Hide scroll bars
            borderRadius: '2em', // Add border radius for rounded corners
            boxShadow: '0 0px 6px rgba(0, 0, 0, 0.5)', // Add shadow for depth
            backgroundColor: 'rgba(0, 0, 0, 0.05)', // Add background color for dark mode
            display: 'flex', // Center text horizontally
            justifyContent: 'center', // Center text horizontally
            alignItems: 'center', // Center text vertically
            border: "2px solid #FFFFFF16",
            backdropFilter: 'blur(25px)', // Add backdrop filter to blur the background
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Add overlay color with transparency
            // backdropFilter: 'blur(20px)', // Add backdrop filter to blur the background
          },
        }}
      >
        <div className="text-center">
          <p>This repo has <strong>already</strong> been ingested.<br />Are you sure you want to ingest again{repoToIngest}?</p>
          <div className="mt-4">
            <Button style={{
              margin: 10,
              borderRadius: '2rem',
            }} variant="outline"
              onClick={() => setShowConfirmationModal(false)}>Nevermind</Button>
            <Button
              style={{
                margin: 10,
                borderRadius: '2rem',
              }}
              variant="outline"
              onClick={() => handleIngestConfirmation(repoToIngest)}
            >
              Proceed
            </Button>

          </div>
        </div>
      </Modal>

      <div style={{
        maxHeight: "100vh",
        overflow: "auto",
        paddingBottom: "15rem",
      }} className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div style={{ marginTop: 10, width: "100%", maxWidth: "45rem" }} className="container absolute flex justify-center items-center left-0 right-0">
          <Input style={{
            borderRadius: '1rem',
          }}
            value={publicRepo} onChange={(e) => setPublicRepo(e.target.value)} placeholder="Paste public Github repo... (e.g https://github.com/openai/whisper)" />
          {
            publicIngestingLoading ? <div className="flex justify-center items-center ml-6"><BarLoader color="#FFFFFFC8" /></div>
              :
              <Button style={{
                marginLeft: 10,
                borderRadius: '1rem',
              }} disabled={!publicRepo} onClick={() => onPublicRepoIngest(publicRepo)} variant="outline">Ingest</Button>
          }
        </div>
        <div style={{
          width: "80vw",
          margin: "0 auto", // Center the div horizontally
        }}>
          <div style={{ textAlign: "center", marginTop: "5em", fontSize: "1rem", fontWeight: "bold" }} className=" text-md text-gray-500">or choose your own repo below...</div> {/* Added text below the input field */}
          <table
            style={{
              marginTop: "2rem",
              marginLeft: "auto",
              marginRight: "auto",
              outline: "solid 1px rgba(255, 255, 255, 0.1)",
              borderRadius: "1em",
            }} // Centering the table
            className="w-full text-sm text-center rounded-xl overflow-hidden"
          >
            <thead className="text-md bg-gray-200 dark:bg-black dark:text-gray-300">
              <tr>
                <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600">Repo name</th>
                <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600">URL</th>
                <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600">Private/Public</th>
                <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600">Action</th>
              </tr>
            </thead>
            <tbody >
              {!loader && tableRender}
            </tbody>
          </table>
        </div>
        {
          !ghToken ? <div style={{ marginTop: 200 }} className="flex w-full justify-center mr-4">
            <Button onClick={() => tokenModal.onOpen()} variant="default"><Icons.gitHub className="mr-2 size-4" /> Set github Token</Button>
          </div>
            :
            loader && <div style={{ marginTop: 200 }} className="flex w-full justify-center mr-4">
              <MoonLoader
                color="#FFFFFFD8"
                size={30}
              />
            </div>
        }
      </div>
    </DashboardShell>
  )
}

