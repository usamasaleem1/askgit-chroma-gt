// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import { Icons } from '../shared/icons'
import { useEffect, useRef, useState } from 'react'
import { UserAvatar } from '../shared/user-avatar'
import { FaRobot } from "react-icons/fa";
import { MdCode } from "react-icons/md";

export interface ChatMessageProps {
  message: any,
  isStream?: boolean
  user: any
}

export function ChatMessage({ message, isStream = false, user, ...props }: ChatMessageProps) {
  const [streamedText, setStreamedText] = useState('');
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [text] = useState(message.content);
  const charactersPerUpdate = 3; // Increase the number of characters added per update
  const speed = 1; // Increase the speed of the animation

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const updatesCount = Math.floor(elapsed / speed);

    if (updatesCount > 0) {
      setStreamedText((prevText) => {
        const nextText = text.substring(0, prevText.length + charactersPerUpdate * updatesCount);
        return nextText;
      });
      startTimeRef.current = timestamp;
    }

    if (streamedText.length < text.length) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (message.role === 'user') {
      setStreamedText(message.content);
    } else if (isStream) {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [message, isStream]); // Updated dependencies


  return (
    <div
      className={cn('group relative mb-4 flex items-start')}

      {...props}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 select-none items-center justify-center rounded-lg border shadow',
          message.role === 'user'
            ? ''
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <UserAvatar
          user={{ name: user?.name || null, image: user?.image || null }}
          className="size-8"
        /> : <MdCode />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            // Modify the style of paragraphs to ensure full width
            p({ children }) {
              return <p className="mb-2 last:mb-0" style={{ width: '100%' }}>{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 cursor-default animate-pulse">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {isStream ? streamedText : message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
