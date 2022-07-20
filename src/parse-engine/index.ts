import { parse, Rule, Media } from "css";
import { compile } from "sass";


export function parseEngine (path: string) {
  const { css } = compile(path, { style: 'compressed' })
  const ast = parse(css)
  const classNameSet: Set<string> = new Set()

  const classNameRegex = /[.]([\w-]+)/g;
  const addClassName = (rule: Rule) => {
    rule.selectors?.forEach((selector: string) => {
      let item: RegExpExecArray | null = classNameRegex.exec(selector);
      while (item) {
        classNameSet.add(item[1])
        item = classNameRegex.exec(selector);
      }
    })
  }

  // go through each of the rules or media query...
  ast.stylesheet?.rules.forEach((rule: Rule & Media) => {
    // ...of type rule
    if (rule.type === "rule") {
      addClassName(rule);
    }
    // of type media queries
    if (rule.type === "media") {
      // go through rules inside media queries
      rule.rules?.forEach((rule: Rule) => addClassName(rule))
    }
  })

  return classNameSet
}