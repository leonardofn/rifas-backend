// Códigos de cor para o terminal
const reset = '\x1b[0m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const blue = '\x1b[34m';
const bold = '\x1b[1m';

class Logger {
  static log(message: string): void {
    process.stdout.write(`${bold}${message}${reset}\n`);
  }

  static logSuccess(message: string): void {
    process.stdout.write(`${green}${bold}${message}${reset}\n`);
  }

  static logInfo(message: string): void {
    process.stdout.write(`${blue}${bold}${message}${reset}\n`);
  }

  static logWarning(message: string): void {
    process.stdout.write(`${yellow}${bold}${message}${reset}\n`);
  }

  static logError(message: string): void {
    process.stderr.write(`${red}${bold}${message}${reset}\n`);
  }
}

export default Logger;
