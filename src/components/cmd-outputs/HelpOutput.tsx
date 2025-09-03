import { Typography } from '@nipsysdev/lsd-react/client/Typography';
import { Component } from 'react';
import { Commands } from '@/constants/commands';
import type { CommandOutputProps } from '@/types/terminal';
import CmdLink from '../terminal/CmdLink';

export default class HelpOutput extends Component<CommandOutputProps> {
  render() {
    return (
      <div className="flex flex-col gap-y-(--lsd-spacing-8)">
        {Commands.map((cmd) => (
          <div
            key={cmd.name}
            className="my-1 flex flex-col leading-5 gap-y-(--lsd-spacing-4)"
          >
            <Typography variant="subtitle3">
              - {this.props.t(`cmds.${cmd.name}.description`)}
            </Typography>
            <CmdLink cmdInfo={cmd} />

            {(cmd.arguments ?? []).map((arg) => (
              <div key={arg.name} className="mt-3 flex flex-col leading-5">
                <Typography variant="subtitle3">
                  - {this.props.t(`cmds.${cmd.name}.argsDesc.${arg.name}`)}
                </Typography>

                <CmdLink cmdInfo={cmd} arg={arg} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
