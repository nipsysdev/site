import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import Web3work from '../web3work/Web3work';

export default class Web3workOutput extends Component<CommandOutputProps> {
  render() {
    return <Web3work />;
  }
}
