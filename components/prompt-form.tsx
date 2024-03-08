import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { IoMdSend } from "react-icons/io";

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => void
  isLoading: boolean
  isDisabled: boolean
  repo_name: string
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
  isDisabled,
  repo_name
}: PromptProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
    >
      <div className=" flex flex-row overflow-hidden max-h-60 grow sm:rounded-md sm:border" style={{
        borderRadius: '1.5em',
        backdropFilter: 'blur(100px)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        marginBottom: '2em',
        boxShadow: '0 0 30px 5px rgba(0, 0, 0, 0.2)',
        width: '40em',
      }}>
        <Textarea
          disabled={isDisabled}
          ref={inputRef}
          tabIndex={0}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isDisabled ? `Please select a repository...` : `Ask "${repo_name}" a question...`}
          spellCheck={false}
          style={{
            width: '100%',
            resize: 'none',
            backgroundColor: 'transparent',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            paddingLeft: '3rem',
            paddingRight: '3rem',
            fontSize: '1rem', // equivalent to sm:text-sm
            outline: 'none', // Remove border highlight on focus
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!input?.trim()) {
                return;
              }
              setInput('');
              onSubmit(input);
            }
          }}
        />

        <div className="flex items-center">
          <Button
            type="submit"
            disabled={isLoading || input === ''}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              fontSize: '1rem',
              fontWeight: 600,
              marginRight: '1rem',
              // 50% opacity white outline  
              outline: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '20rem',
            }}
          >
            <IoMdSend style={{
              marginRight: '0.5rem'
            }} />
            <span className="">Query</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
