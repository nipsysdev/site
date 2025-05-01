'use client'
import {
  Tabcard,
  TabcardList,
  TabcardTrigger,
  TabcardContent,
} from '@srcpunks/src_ui'

export default function TerminalWindow({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Tabcard
      value="active"
      className="size-full max-h-[768px] max-w-[1024px] overflow-hidden"
    >
      <TabcardList>
        <TabcardTrigger value="active">terminal</TabcardTrigger>
        <TabcardTrigger value="inactive">whoami</TabcardTrigger>
        <TabcardTrigger value="inactive">blog</TabcardTrigger>
        <TabcardTrigger value="inactive">contact</TabcardTrigger>
      </TabcardList>
      <TabcardContent value="active">{children}</TabcardContent>
    </Tabcard>
  )
}
