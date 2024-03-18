import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { prisma } from "@/lib/db";
import { auth } from '@/lib/auth';


// Handles POST requests to /api
export async function POST(request: NextRequest) {
    let message: string
    let status: number
    try {
        const session: any = await auth()
        const body: any = await request.json();
        const repo = body?.repoUrl
        const repoName = body?.repoName
        const token = body?.token
        const isPublic = body?.isPublic || false
        console.log(" ==== isPublic ==== ", isPublic)
        let data = JSON.stringify({
            "repoUrl": isPublic ? repo : `https://${token}@${repo.replaceAll("git://", "")}`
        });

        console.log(" ==== ingest REPO === ", data)

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.API_URL}downloadrepo`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const callRes = await axios.request(config)

        let ingestConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.API_URL}ingesting`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "repoName": repoName
            })
        };

        await axios.request(ingestConfig)
        console.log(" ==== ingest DONE === ")
        const payload: any = {
            repo_url: repo,
            repo_name: repoName,
            user_id: session?.user.id
        }
        await prisma.ingestedRepo.create({
            data: payload
        })
        message = 'Ingested repo created successfully'
        status = 200
        // ...
    } catch (error) {
        console.log(" ====== Error ======> ", error);
        message = 'Ingested repo error'
        status = 501
    }
    return NextResponse.json({ message: message, status: status });
}

export async function GET() {
    let message: string;
    let status: number;
    let data: any;
    const session: any = await auth();
    try {
        const res = await prisma.ingestedRepo.groupBy({
            by: ['repo_name'],
            where: {
                user_id: session.user.id,
            },
            _max: {
                repo_url: true,
                // You can add other fields you might need, but only aggregations
            },
        });
        // Transform the result to fit your data structure if needed
        data = res.map(item => ({
            repo_name: item.repo_name,
            repo_url: item._max.repo_url, // This will give you the maximum URL, adjust as needed
            // Include other fields as necessary
        }));
        message = 'Repositories fetched successfully';
        status = 200;
    } catch (error) {
        console.error("Error fetching unique repositories:", error);
        data = [];
        message = 'Something went wrong';
        status = 501;
    }
    return NextResponse.json({ message: message, status: status, data: data });
}

