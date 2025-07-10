import { Button } from '@acid-info/lsd-react/client/Button';
import type { JSX } from 'react';
import { useTerminalContext } from '@/contexts/TerminalContext';
import type { CommandArgument, CommandInfo } from '@/types/terminal';

interface Props {
  cmdName?: string;
  cmdInfo?: CommandInfo;
  arg?: CommandArgument;
}

export default function CmdLink(props: Props) {
  const { setInput, setSimulatedCmd } = useTerminalContext();

  const submitCmd = () => {
    const cmd = props.cmdName ?? props.cmdInfo?.name ?? '';
    if (!cmd) return;

    if (props.cmdInfo?.options?.length) {
      setInput(`${cmd} `);
      return;
    }
    if (props.arg) {
      setInput(`${cmd} --${props.arg.name}=`);
      return;
    }

    setSimulatedCmd(cmd);
  };

  const cmdArgOptionRender = (): JSX.Element | undefined => {
    if (!props.cmdInfo) return;

    if (props.arg?.options) {
      let options = props.arg.options.slice(0, 6).join('|');
      options += props.arg.options.length > 6 ? '|...' : '';
      return (
        <>
          --{props.arg.name}=<span>{options}</span>
        </>
      );
    }

    if (props.cmdInfo.options) {
      const options = props.cmdInfo.options.join('|');
      return <span>&nbsp;{options}</span>;
    }

    return;
  };

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={submitCmd}
      className="text-xs w-fit!"
    >
      <span>{props.cmdName ?? props.cmdInfo?.name}</span>
      {cmdArgOptionRender()}
    </Button>
  );
}
