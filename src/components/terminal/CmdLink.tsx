import { Button } from '@nipsys/lsd';
import type { JSX } from 'react';
import { $terminalInput, simulateInput } from '@/stores/terminal-store';
import type { CommandArgument, CommandInfo } from '@/types/terminal';

interface Props {
  cmdName?: string;
  cmdInfo?: CommandInfo;
  arg?: CommandArgument;
}

export default function CmdLink(props: Props) {
  const submitCmd = () => {
    const cmd = props.cmdName ?? props.cmdInfo?.name ?? '';
    if (!cmd) return;

    if (props.cmdInfo?.options?.length) {
      $terminalInput.set(`${cmd} `);
      return;
    }
    if (props.arg) {
      $terminalInput.set(`${cmd} --${props.arg.name}=`);
      return;
    }

    simulateInput(cmd);
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
      size="sm"
      onClick={submitCmd}
      className="text-xs w-fit!"
    >
      <span>{props.cmdName ?? props.cmdInfo?.name}</span>
      {cmdArgOptionRender()}
    </Button>
  );
}
