import axios from "axios";
import { useEffect, useState } from "react";


export function useGitRepository() {
    const [repoList, setRepoList] = useState([])

    useEffect(() => {
        (async () => {
            await getRepoList();
        })();
    }, [])

    const getRepoList = async () => {
        try {
            const response = await axios.get('/api/repo');
            setRepoList(response.data.data);
        } catch (error) {
            console.log(" === 12 ===> error ==> useGitRepository ==> ", error);
            setRepoList([]);
        }
    }

    const ingestRepo = async (repo: string) => {
        const data = JSON.stringify({
            "repoUrl": `https://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@${repo.replaceAll("git://", "")}`
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://127.0.0.1:8000/downloadrepo',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        return axios.request(config);
    }

    const sentMessage = async (message: string, repo: string) => {
        const payload = {
            "question": message,
            "repoName": repo
        };
        return axios.post("http://127.0.0.1:8000/chat", payload);
    }
    return { getRepoList, ingestRepo, sentMessage, repoList };
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
