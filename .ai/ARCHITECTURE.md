# Project Architecture

## Key Components

- `TerminalEmulator`: Main terminal interface component
- `TerminalContext`: Manages terminal state (history, input, etc.)
- `AppContext`: Manages app-wide state (key presses, etc.)
- `cmd-outputs/`: Output components for each command
- `i18n/`: Internationalization setup

## State Management

- `TerminalContext` handles:
  - Command history
  - Current input
  - Simulated commands
- `AppContext` handles:
  - Key presses
  - Terminal focus state

## Internationalization

- Uses next-intl for translations
- Supported languages: English (en), French (fr)
- Translation files in `i18n/messages/`
