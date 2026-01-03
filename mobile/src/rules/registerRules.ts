import { ruleManager } from './RuleManager'
import { NormalMovement } from './definitions/NormalMovement'

// Helper to register
const register = () => {
    try {
        ruleManager.register(new NormalMovement())

        console.log('Rules Registered!')

        console.log('Rules Registered!')
    } catch (e) {
        console.error('Failed to register rules', e)
    }
}

export default register
