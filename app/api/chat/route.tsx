

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'


// Handles POST requests to /api
export async function POST(request: NextRequest) {
  let message: string
  let status: number
  let data: any
  try {
    const body: any = await request.json();
    const repo = body?.repoUrl
    const repoName = body?.repoName
    const question = body?.question
    let payload = {
      "question": question,
      "repoName": repoName
    }

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${process.env.API_URL}chat`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    };

    const callRes = await axios.request(config)
    data = callRes.data
    message = 'question repo created successfully'
    status = 200
    return NextResponse.json({ message: message, status: status, data: data });
    // ...
  } catch (error) {
    console.log(" ====== Error ======> ", error);
    message = 'Ingested repo error'
    status = 501
    data = null
    return NextResponse.json({ message: message, status: status, data: data });
  }
  // return "This is message"

}
