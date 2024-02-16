import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// Handles POST requests to /api
export async function POST(request: Request) {
    try {
        const { title, ai_result, session } = await request.json()
        const user: any = await getCurrentUser()
        const payload: any = {
            title: title,
            user_id: user?.id,
            ai_result: ai_result,
            session: session
        }
        const newItem = await prisma.chatHistory.create({
            data: payload
        })
        // ...
    } catch (error) {
        console.log(" ====== Error ======> ", error);
    }
    return NextResponse.json({ message: "Added", status: 200 });
}