import { Component } from 'react';
import type { CommandOutputProps } from '@/types/terminal';
import Resume from '../resume/Resume';

export default class ResumeOutput extends Component<CommandOutputProps> {
  render() {
    return <Resume />;
  }
}
