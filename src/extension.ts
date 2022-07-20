import { commands, window, ExtensionContext, workspace, Disposable } from 'vscode';
import { registerCompletionProvider, unregisterProviders } from './utils/completionProvider';
import { run } from './utils/cache'
import { Command, Configuration } from './enums';

const htmlDisposables: Disposable[] = [];
const cssDisposables: Disposable[] = [];
const javaScriptDisposables: Disposable[] = [];
const emmetDisposables: Disposable[] = [];

const registerHTMLProviders = (disposables: Disposable[]) =>
	workspace.getConfiguration()
		?.get<string[]>(Configuration.HTMLLanguages)
		?.forEach((extension) => {
			disposables.push(registerCompletionProvider(extension, /class=["|']([\w- ]*$)/));
			disposables.push(registerCompletionProvider(extension, /(:class)=["|'].*["|']/i));
		});

const registerCSSProviders = (disposables: Disposable[]) =>
	workspace.getConfiguration()
		.get<string[]>(Configuration.CSSLanguages)
		?.forEach((extension) => {
			// The @apply rule was a CSS proposal which has since been abandoned,
			// check the proposal for more info: http://tabatkins.github.io/specs/css-apply-rule/
			// Its support should probably be removed
			disposables.push(registerCompletionProvider(extension, /@apply ([.\w- ]*$)/, "."));
		});

const registerJavaScriptProviders = (disposables: Disposable[]) =>
	workspace.getConfiguration()
		.get<string[]>(Configuration.JavaScriptLanguages)
		?.forEach((extension) => {
			disposables.push(registerCompletionProvider(extension, /className=["|']([\w- ]*$)/));
			disposables.push(registerCompletionProvider(extension, /class=["|']([\w- ]*$)/));
		});

function registerEmmetProviders(disposables: Disposable[]) {
	const emmetRegex = /(?=\.)([\w-. ]*$)/;

	const registerProviders = (modes: string[]) => {
		modes.forEach((language) => {
			disposables.push(registerCompletionProvider(language, emmetRegex, "", "."));
		});
	};

	const htmlLanguages = workspace.getConfiguration().get<string[]>(Configuration.HTMLLanguages);
	if (htmlLanguages) {
		registerProviders(htmlLanguages);
	}

	const javaScriptLanguages = workspace.getConfiguration().get<string[]>(Configuration.JavaScriptLanguages);
	if (javaScriptLanguages) {
		registerProviders(javaScriptLanguages);
	}
}


export function activate(context: ExtensionContext) {
	const disposables: Disposable[] = [];
	workspace.onDidChangeConfiguration(async (e) => {
		try {
			if (e.affectsConfiguration(Configuration.Paths)) {
				run()
			}
			if (e.affectsConfiguration(Configuration.EnableEmmetSupport)) {
				const isEnabled = workspace.getConfiguration()
					.get<boolean>(Configuration.EnableEmmetSupport);
				isEnabled ? registerEmmetProviders(emmetDisposables) : unregisterProviders(emmetDisposables);
			}

			if (e.affectsConfiguration(Configuration.HTMLLanguages)) {
				unregisterProviders(htmlDisposables);
				registerHTMLProviders(htmlDisposables);
			}

			if (e.affectsConfiguration(Configuration.CSSLanguages)) {
				unregisterProviders(cssDisposables);
				registerCSSProviders(cssDisposables);
			}

			if (e.affectsConfiguration(Configuration.JavaScriptLanguages)) {
				unregisterProviders(javaScriptDisposables);
				registerJavaScriptProviders(javaScriptDisposables);
			}
		} catch (err) {
			window.showErrorMessage(err instanceof Error ? err.message : 'Failed to automatically reload the extension after the configuration change')
		}
	}, null, disposables)
	context.subscriptions.push(...disposables);

	context.subscriptions.push(commands.registerCommand(Command.Refresh, run));

	if (workspace.getConfiguration().get<boolean>(Configuration.EnableEmmetSupport)) {
		registerEmmetProviders(emmetDisposables);
	}

	registerHTMLProviders(htmlDisposables);
	registerCSSProviders(cssDisposables);
	registerJavaScriptProviders(javaScriptDisposables);

	run()
}

// this method is called when your extension is deactivated
export function deactivate() {
	unregisterProviders(htmlDisposables)
	unregisterProviders(cssDisposables)
	unregisterProviders(javaScriptDisposables)
	unregisterProviders(emmetDisposables)
}
