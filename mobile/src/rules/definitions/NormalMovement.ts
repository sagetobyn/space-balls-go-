import { BaseRule, InputState } from '../Rule'
import { Vector2 } from '../../core/Vector2'

export class NormalMovement extends BaseRule {
    constructor() {
        super('normal_movement', 'Normal Movement', 'Move the dot to the exit.')
    }

    modifyInput(input: Vector2, dt: number, state: InputState): Vector2 {
        return input // No modification
    }
}
