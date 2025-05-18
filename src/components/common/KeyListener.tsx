import { useAppContext } from '@/contexts/AppContext'

export const KeyListener = () => {
  const { setLastKeyDown } = useAppContext()
  return (
    <button
      className="fixed -bottom-5 opacity-0"
      onKeyDown={setLastKeyDown}
      onBlur={(e) => e.target.focus()}
      autoFocus
    />
  )
}
