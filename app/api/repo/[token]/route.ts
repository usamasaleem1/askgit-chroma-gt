import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'


export async function GET(request: any, context: any) {
    const { params } = context
    let message: string
    let status: number
    let data: any
    try {
        let page = 1;
        let repos: any[] = [];
        let hasMoreRepos = true;

        while (hasMoreRepos) {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `https://api.github.com/user/repos?per_page=100&page=${page}`,
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: 'Bearer ' + params.token,
                    'X-GitHub-Api-Version': '2022-11-28',
                    Cookie: 'logged_in=no',
                }
            }
            const response = await axios.request(config);
            const newRepos = response.data;
            repos.push(...newRepos);

            if (newRepos.length < 100) {
                hasMoreRepos = false;
            } else {
                page++;
            }
        }

        data = repos;
        message = 'Repo list successfully';
        status = 200;
    } catch (error) {
        console.error('Error fetching repo list:', error);
        message = 'Something went wrong';
        status = error.response?.status || 500;
        data = []; // Ensure data is always an array
    }
    return NextResponse.json({ message: message, status: status, data: data });
}
