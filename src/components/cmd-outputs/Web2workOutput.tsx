import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import Web2work from '../web2work/Web2work';

export default class Web2workOutput extends Component<CommandOutputProps> {
  render() {
    return <Web2work />;
  }
}
