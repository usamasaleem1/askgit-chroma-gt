import { getCurrentUser } from "@/lib/session";
import AiChat from "./page";

export default async function ChatLayout({ ...props }) {
    const user = await getCurrentUser()
    return (
        <div>
            <AiChat user={user} params={props.params} {...props} />
        </div>
    )
}