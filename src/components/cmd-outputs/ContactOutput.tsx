import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import Contact from '../contact/Contact';

export default class ContactOutput extends Component<CommandOutputProps> {
  render() {
    return <Contact />;
  }
}
