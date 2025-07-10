import { Component } from 'react';
import asciiArt from '@/assets/ascii-art';
import { Command, type CommandOutputProps } from '@/types/terminal';
import CmdLink from '../terminal/CmdLink';

export default class IntroOutput extends Component<CommandOutputProps> {
  render() {
    return (
      <div className="flex flex-col">
        <div className="mb-2 hidden font-mono text-(length:--lsd-subtitle4-fontSize) leading-none whitespace-break-spaces md:block">
          {asciiArt}
        </div>

        <p className="mb-3">
          {this.props.t.rich('cmds.intro.welcome', {
            name: (name) => <span className="font-bold">{name}</span>,
          })}
        </p>

        <p>{this.props.t('cmds.intro.site_intro_1')}</p>
        <p>
          {this.props.t.rich('cmds.intro.site_intro_2', {
            cmd: () => <CmdLink cmdName={Command.Help} />,
          })}
        </p>
      </div>
    );
  }
}
