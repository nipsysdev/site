import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import AboutMe from '../about-me/AboutMe';

export default class WhoamiOutput extends Component<CommandOutputProps> {
	render() {
		return <AboutMe />;
	}
}
