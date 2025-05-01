'use client'
import {
  Tabcard,
  TabcardList,
  TabcardTrigger,
  TabcardContent,
} from '@srcpunks/src_ui'

export default function Home() {
  return (
    <main className="flex h-full items-center justify-center">
      <Tabcard defaultValue="tab1" className="min-w-[400px]">
        <TabcardList>
          <TabcardTrigger value="tab1">terminal</TabcardTrigger>
          <TabcardTrigger value="tab2">whoami</TabcardTrigger>
          <TabcardTrigger value="tab3">blog</TabcardTrigger>
          <TabcardTrigger value="tab4">contact</TabcardTrigger>
        </TabcardList>
        <TabcardContent value="tab1">Tab1 Content</TabcardContent>
        <TabcardContent value="tab2">Tab2 Content</TabcardContent>
        <TabcardContent value="tab3">Tab3 Content</TabcardContent>
        <TabcardContent value="tab4">Tab4 Content</TabcardContent>
      </Tabcard>
    </main>
  )
}
