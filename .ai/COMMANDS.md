# Command System Documentation

## Available Commands

- `help`: Shows available commands
- `contact`: Displays contact information
- `whoami`: Shows personal information
- `web3 mission`: Displays Web3 mission (TODO)
- `clear`: Clears terminal history
- `setlang`: Changes language (options: en, fr)

## Command Execution Flow

1. User enters command in terminal
2. Command is parsed in `terminal-utils.ts`
3. Matching command info is found in `commands.ts`
4. Associated output component is rendered

## Adding New Commands

1. Add command to `Command` enum in `types/terminal.ts`
2. Define command info in `constants/commands.ts`
3. Create output component in `components/cmd-outputs/`
4. Add any needed translations
