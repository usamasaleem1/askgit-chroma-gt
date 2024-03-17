import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import _ from "lodash"
import { auth } from "@/lib/auth";


// Handles GET requests to /api
export async function GET(request: Request, context: any) {
    let responseData: any = undefined;
    let currentData: any = undefined;
    let message: String = "";
    let status: number = 200
    const session: any = await auth()
    try {
        const { params } = context

        const response = await prisma.chatHistory.findMany({})

        const currentRes = await prisma.chatHistory.findMany({
            where: {
                session: params.session,
                user_id: session.user.id,
            }
        })
        currentData = currentRes
        responseData = _.uniqBy(response, 'session')
        message = "Successfully recived"
        status = 200
    } catch (error) {
        console.log(" ====== Error ======> ", error);
        responseData = {}
        message = "Something went wrong"
        status = 500
    }
    return NextResponse.json({ status: status, message: message, responseData: responseData, currentChat: currentData });
}

export async function DELETE(request: Request, context: any) {
    let message: String = "";
    let status: number = 200
    try {
        const { params } = context

        await prisma.chatHistory.deleteMany({
            where: {
                session: params.session
            }
        })

        message = "Delete successfully"
        status = 200
    } catch (error) {
        console.log(" ====== Error ======> ", error);
        message = "Something went wrong"
        status = 500
    }
    return NextResponse.json({ status: status, message: message });

}
