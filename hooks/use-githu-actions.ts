import axios from "axios";
import { useEffect, useState } from "react";


export function useGitRepository() {
    const [repoList, setRepoList] = useState([])

    useEffect(() => {
        getRepoList()
    }, [])

    const getRepoList = async () => {
        try {
            const res = await axios.get('/api/repo').then((response) => response.data)
            setRepoList(res.data)
        } catch (error) {
            console.log(" === 12 ===> error ==> useGitRepository ==> ", error)
            setRepoList([])
        }
    }

    const ingestRepo = (repo: string) => {
        let data = JSON.stringify({
            "repoUrl": `https://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@${repo.replaceAll("git://", "")}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/downloadrepo',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        return axios.request(config)
    }

    const sentMessage = (message: string, repo: string) => {
        const payload = {
            "question": message,
            "repoName": repo
        }
        return axios.post("http://127.0.0.1:8000/chat", payload)
    }
    return { getRepoList, ingestRepo, sentMessage, repoList }
}

export async function useAuthDetail() {
    const [authDetail, setAuthDetail] = useState<any>();
    // const authRes = await auth()

    // console.log(" === =authRes === ", authRes)

    // useEffect(() => {
    //     setAuthDetail(authRes)
    // }, [authRes])

    return authDetail
}