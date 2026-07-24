import { Button } from '@nipsys/lsd';
import type { JSX } from 'react';
import { $terminalInput, simulateInput } from '@/stores/terminal-store';
import type { CommandArgument, CommandInfo } from '@/types/terminal';

interface Props {
  cmdName?: string;
  cmdInfo?: CommandInfo;
  arg?: CommandArgument;
  primary?: boolean;
}

export default function CmdLink(props: Props) {
  const submitCmd = () => {
    const cmd = props.cmdName ?? props.cmdInfo?.name ?? '';
    if (!cmd) return;

    if (props.cmdInfo?.options?.length || props.cmdInfo?.usage) {
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

    const parts: JSX.Element[] = [];
    for (const flag of props.cmdInfo.options ?? []) {
      parts.push(<span key={flag}>&nbsp;[{flag}]</span>);
    }
    if (props.cmdInfo.usage) {
      parts.push(<span key="usage">&nbsp;{props.cmdInfo.usage}</span>);
    }

    // biome-ignore lint/complexity/noUselessFragments: Fragment wrapping actually needed
    return parts.length ? <>{parts}</> : undefined;
  };

  return (
    <Button
      variant={props.primary ? 'filled' : 'outlined'}
      size="sm"
      onClick={submitCmd}
      className="text-xs w-fit! min-h-11 sm:min-h-8"
    >
      <span>{props.cmdName ?? props.cmdInfo?.name}</span>
      {cmdArgOptionRender()}
    </Button>
  );
}
