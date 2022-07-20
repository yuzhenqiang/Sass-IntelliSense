import { CompletionItem, CompletionItemKind, Disposable, languages, Position, Range, TextDocument } from "vscode";
import { cachedClassName } from "./cache";

const completionTriggerChars = ['"', "'", " ", "."]

export const registerCompletionProvider = (
	languageSelector: string,
	classMatchRegex: RegExp,
	classPrefix = "",
	splitChar = " "
) => languages.registerCompletionItemProvider(languageSelector, {
	provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
		const start: Position = new Position(position.line, 0);
		const range: Range = new Range(start, position);
		const text: string = document.getText(range);

		// Check if the cursor is on a class attribute and retrieve all the css rules in this class attribute
		const rawClasses: RegExpMatchArray | null = text.match(classMatchRegex);
		if (!rawClasses || rawClasses.length === 1) {
			return [];
		}

		// Will store the classes found on the class attribute
		const classesOnAttribute = rawClasses[1].split(splitChar);

		// Creates a collection of CompletionItem based on the classes already cached
		const completionItems = cachedClassName.map((className) => {
			const completionItem = new CompletionItem(className, CompletionItemKind.Variable);
			const completionClassName = `${classPrefix}${className}`;

			completionItem.filterText = completionClassName;
			completionItem.insertText = completionClassName;

			return completionItem;
		});

		// Removes from the collection the classes already specified on the class attribute
		for (const classOnAttribute of classesOnAttribute) {
			for (let j = 0; j < completionItems.length; j++) {
				if (completionItems[j].insertText === classOnAttribute) {
					completionItems.splice(j, 1);
				}
			}
		}

		return completionItems;
	},
}, ...completionTriggerChars);

export function unregisterProviders(disposables: Disposable[]) {
	disposables.forEach(disposable => disposable.dispose());
	disposables.length = 0;
}