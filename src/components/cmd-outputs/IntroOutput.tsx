import figlet from 'figlet';
import standard from 'figlet/importable-fonts/Standard';
import { Component } from 'react';
import { Command, type CommandOutputProps } from '@/types/terminal';
import CmdLink from '../terminal/CmdLink';

export default class IntroOutput extends Component<CommandOutputProps> {
  readonly nickname = 'nipsysdev';

  readonly state = {
    figletText: '',
  };

  componentDidMount() {
    figlet.parseFont('Standard', standard);
    figlet.text(
      this.nickname,
      {
        font: 'Standard',
      },
      (_, data) => this.setState({ figletText: data }),
    );
  }

  render() {
    return (
      <div className="flex flex-col">
        <div className="mb-2 hidden font-mono text-(length:--lsd-subtitle4-fontSize) leading-none whitespace-break-spaces md:block">
          {this.state.figletText}
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
