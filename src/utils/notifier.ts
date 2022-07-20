import { window, StatusBarItem, StatusBarAlignment } from "vscode";

class Notifier {
  public statusBarItem: StatusBarItem;
  private timeoutId: NodeJS.Timer | null;

  constructor(command?: string, alignment?: StatusBarAlignment, priority?: number) {
    this.statusBarItem = window.createStatusBarItem(alignment, priority);
    this.statusBarItem.command = command;
    this.statusBarItem.show();
    this.timeoutId = null;
  }

  public notify(icon: string, text: string, autoHide = true): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.statusBarItem.text = `$(${icon}) ${text}`;
    this.statusBarItem.tooltip = undefined;

    if (autoHide) {
      this.timeoutId = setTimeout(() => {
        this.statusBarItem.text = `$(${icon})`;
        this.statusBarItem.tooltip = text;
      }, 5000);
    }
  }

  public hide () {
    this.statusBarItem.hide()
  }
}

export default Notifier;
