import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'


export async function GET(request: any, context: any) {
    const { params } = context
    let message: string
    let status: number
    let data: any
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.github.com/user/repos',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: 'Bearer ' + params.token,
                'X-GitHub-Api-Version': '2022-11-28',
                Cookie: 'logged_in=no'
            }
        }
        const response = await axios.request(config)
        data = response.data
        message = 'Repo list successfully'
        status = 200
    } catch (error) {
        console.log(' ==== errror ===> ', error)
        message = 'Something went wrong'
        status = 500
    }
    return NextResponse.json({ message: message, status: status, data: data })
}
