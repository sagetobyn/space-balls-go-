import { Rule } from './Rule'

export class RuleManager {
    private rules: Map<string, Rule> = new Map()
    activeRuleId: string | null = null

    register(rule: Rule) {
        this.rules.set(rule.id, rule)
    }

    getContent(id: string): Rule | undefined {
        return this.rules.get(id)
    }

    setActive(id: string) {
        this.activeRuleId = id
        console.log(`Active Rule: ${id}`)
    }

    getActive(): Rule | undefined {
        if (!this.activeRuleId) return undefined
        return this.rules.get(this.activeRuleId)
    }

    getRules(): Rule[] {
        return Array.from(this.rules.values())
    }
}

export const ruleManager = new RuleManager()
