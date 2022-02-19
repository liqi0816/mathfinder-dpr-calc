import type { Ace } from 'ace-builds';
import { NestedHaystack } from './context';
import { TokenType } from '../editor/util';

const sign = (number: number): string => (number > 0 ? '+ ' : number < 0 ? '- ' : '');

export class MathfinderPolynomial {
    bonus: number = 0;
    dice: number[] = [];

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

    static merge(calculations: Iterable<MathfinderPolynomial>) {
        const ret = new MathfinderPolynomial();
        for (const calculation of calculations) {
            ret.bonus += calculation.bonus;
            calculation.dice.forEach((number, diceSize) => {
                if (number) {
                    ret.dice[diceSize] = (ret.dice[diceSize] ?? 0) + number;
                }
            });
        }
        return ret;
    }
}

export class MathfinderInputRow extends MathfinderPolynomial {
    comment?: string;

    toString() {
        return this.comment ? `${super.toString()} ${this.comment}` : super.toString();
    }

    static fromRow(row: Iterable<Ace.Token>, context?: NestedHaystack<MathfinderPolynomial>) {
        const ret = new MathfinderInputRow();

        const buffer = {
            sign: 1,
            number: undefined as number | undefined,
            diceSize: undefined as number | undefined,
            flush() {
                if (this.diceSize) {
                    ret.dice[this.diceSize] = (ret.dice[this.diceSize] ?? 0) + this.sign * (this.number ?? 1);
                } else {
                    ret.bonus += (this.number ?? 0) * this.sign;
                }
                this.sign = 1;
                this.number = undefined;
                this.diceSize = undefined;
            },
        };

        for (const token of row) {
            const { type, value } = token;
            if (type === TokenType.numeric) {
                buffer.number = Number(token.value);
            } else if (type === TokenType.operator) {
                buffer.flush();
                if (value === '+') {
                    buffer.sign = 1;
                } else if (value === '-') {
                    buffer.sign = -1;
                }
            } else if (type === TokenType.func) {
                if (value.startsWith('d')) {
                    buffer.diceSize = Number(value.slice(1));
                }
            } else if (type === TokenType.variable) {
            } else if (type === TokenType.comment) {
                ret.comment = value.trim().replace(/[^\p{Letter} ]/gu, '');
            }
        }
        buffer.flush();
        return ret;
    }

    static *fromBlock(block: Iterable<Iterable<Ace.Token>>) {
        for (const row of block) yield MathfinderInputRow.fromRow(row);
    }
}

export function parseBlock(block: Iterable<Iterable<Ace.Token>>) {
    return MathfinderPolynomial.merge(MathfinderInputRow.fromBlock(block));
}
