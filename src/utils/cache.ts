import { workspace } from "vscode"
import Notifier from "./notifier"
import { resolve as pathResolve } from 'path';
import { parseEngine } from "../parse-engine";
import { Command, Configuration } from "../enums";

let caching: boolean = false
export const cachedClassName: string[] = []

const notifier = new Notifier(Command.Refresh, 1)

/** 缓存classname */
export const run = () => {
	if (caching) return
	
	caching = true
	notifier.notify('database', '正在缓存ClassName...')
	try {
		const configurations = workspace.getConfiguration()
		const paths: string[] | undefined = configurations.get(Configuration.Paths)
		if (!Array.isArray(paths) || paths.length <= 0 || !workspace.workspaceFolders) {
			notifier.hide()
			return
		}
		const workspacePath = workspace.workspaceFolders[0].uri.path
		const foundClassName = paths
			.map(path => {
				const filePath = pathResolve(workspacePath, path)
				const classNameSet = parseEngine(filePath)
				return classNameSet
			})
			.reduce((list: string[], set) => {
				list.push(...set)
				return list
			}, [])
		cachedClassName.splice(0, cachedClassName.length, ...foundClassName)
		notifier.notify('zap', '点击可重新缓存ClassName')
	} catch (err) {
		console.error(err)
		notifier.notify('alert', '缓存ClassName失败(点击尝试重新缓存)')
	} finally {
		caching = false
	}
}