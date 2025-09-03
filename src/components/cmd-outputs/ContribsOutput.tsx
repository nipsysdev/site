import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import Contribs from '../contribs/Contribs';

export default class ContribsOutput extends Component<CommandOutputProps> {
  render() {
    return <Contribs />;
  }
}
