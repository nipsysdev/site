import { Component } from 'react';
import { Commands } from '@/constants/commands';
import type { CommandOutputProps } from '@/types/terminal';
import CmdLink from '../terminal/CmdLink';

export default class HelpOutput extends Component<CommandOutputProps> {
	render() {
		return Commands.map((cmd) => (
			<div key={cmd.name} className="my-1 flex flex-col leading-5">
				<span className="text-sm">
					- {this.props.t(`cmds.${cmd.name}.description`)}
				</span>
				<CmdLink cmdInfo={cmd} />

				{(cmd.arguments ?? []).map((arg) => (
					<div key={arg.name} className="mt-3 flex flex-col leading-5">
						<span className="text-sm">
							- {this.props.t(`cmds.${cmd.name}.argsDesc.${arg.name}`)}
						</span>

						<CmdLink cmdInfo={cmd} arg={arg} />
					</div>
				))}
			</div>
		));
	}
}
