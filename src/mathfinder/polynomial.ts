import type { Ace } from 'ace-builds';
import { TokenType } from '../editor/util';

export class MathfinderPolynomialError extends Error {
    name = MathfinderPolynomialError.name;
}

const sign = (number: number): string => (number > 0 ? '+ ' : number < 0 ? '- ' : '');

export class MathfinderPolynomial {
    constructor(public bonus: number = 0, public dice: number[] = []) {}

    toAverage() {
        let ret = this.bonus;
        for (const [diceSize, number = 0] of this.dice.entries()) {
            ret += number * ((1 + diceSize) / 2);
        }
        return ret;
    }

    toString() {
        return [
            ...this.dice.map(
                (number, diceSize) =>
                    number && `${sign(number)}${number === 1 || number === -1 ? '' : Math.abs(number)}d${diceSize}`
            ),
            this.bonus && `${sign(this.bonus)}${Math.abs(this.bonus)}`,
        ]
            .filter(Boolean)
            .join(' ')
            .replace(/^[+] /, '')
            .replace(/^[-] /, '-');
    }

    add(calculation: MathfinderPolynomial, multiplier: number = 1) {
        this.bonus += multiplier * calculation.bonus;
        calculation.dice.forEach((number, diceSize) => {
            if (number) {
                this.dice[diceSize] = (this.dice[diceSize] ?? 0) + multiplier * number;
            }
        });
        return this;
    }

    static merge(calculations: Iterable<MathfinderPolynomial>) {
        const ret = new MathfinderPolynomial();
        for (const calculation of calculations) {
            ret.add(calculation);
        }
        return ret;
    }
}

class InputRowBuffer {
    sign: number = 1;
    number?: number = undefined;
    diceSize?: number = undefined;
    variable?: MathfinderPolynomial = undefined;

    flush(row: MathfinderInputRow) {
        if (this.diceSize) {
            row.dice[this.diceSize] = (row.dice[this.diceSize] ?? 0) + this.sign * (this.number ?? 1);
        } else if (this.variable) {
            row.add(this.variable, this.sign * (this.number ?? 1));
        } else {
            row.bonus += this.sign * (this.number ?? 0);
        }
        this.sign = 1;
        this.number = undefined;
        this.diceSize = undefined;
        this.variable = undefined;
    }
}

export class MathfinderInputRow extends MathfinderPolynomial {
    comment?: string;

    toString() {
        return this.comment ? `${super.toString()} ${this.comment}` : super.toString();
    }

    static fromRow(row: Iterable<Ace.Token>, variableResolver?: (token: Ace.Token) => MathfinderPolynomial | undefined) {
        const ret = new MathfinderInputRow();
        const buffer = new InputRowBuffer();
        for (const token of row) {
            const { type, value } = token;
            if (type === TokenType.Numeric) {
                buffer.number = Number(token.value);
            } else if (type === TokenType.Operator) {
                buffer.flush(ret);
                if (value === '+') {
                    buffer.sign = 1;
                } else if (value === '-') {
                    buffer.sign = -1;
                }
            } else if (type === TokenType.Func) {
                if (value.startsWith('d')) {
                    buffer.diceSize = Number(value.slice(1));
                }
            } else if (type === TokenType.Variable) {
                if (variableResolver) {
                    const variable = variableResolver(token);
                    if (variable) {
                        buffer.variable = variable;
                    } else {
                        throw new MathfinderPolynomialError(
                            `Please provide variable ${value}\n(token: ${JSON.stringify(token)})`
                        );
                    }
                }
            } else if (type === TokenType.Comment) {
                ret.comment = value.trim().replace(/[^\p{Letter} ]/gu, '');
            }
        }
        buffer.flush(ret);
        return ret;
    }

    static *fromBlock(block: Iterable<Iterable<Ace.Token>>) {
        for (const row of block) yield MathfinderInputRow.fromRow(row);
    }
}

export function parseBlock(block: Iterable<Iterable<Ace.Token>>) {
    return MathfinderPolynomial.merge(MathfinderInputRow.fromBlock(block));
}
