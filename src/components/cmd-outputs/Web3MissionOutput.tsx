import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import Web3Mission from '../web3-mission/Web3Mission';

export default class Web3MissionOutput extends Component<CommandOutputProps> {
  render() {
    return <Web3Mission />;
  }
}
