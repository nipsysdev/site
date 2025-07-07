import { useAppContext } from '@/contexts/AppContext';

export const KeyListener = () => {
  const { setLastKeyDown } = useAppContext();
  return (
    <div className="fixed -bottom-5 opacity-0" popover="manual">
      <button
        onKeyDown={setLastKeyDown}
        onBlur={(e) => e.target.focus()}
        type="button"
        autoFocus
      />
    </div>
  );
};
