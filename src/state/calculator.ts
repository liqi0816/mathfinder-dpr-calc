import type { Ace } from 'ace-builds';

export class NormalizedCalculation {
    bonus = 0;
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
            ...this.dice.map((number, diceSize) =>
                number > 1
                    ? `+ ${number}d${diceSize}`
                    : number === 1
                    ? `+ d${diceSize}`
                    : number < 0
                    ? `- ${-number}d${diceSize}`
                    : ''
            ),
            this.bonus > 0 ? `+ ${this.bonus}` : this.bonus < 0 ? `- ${-this.bonus}` : '',
        ]
            .filter(Boolean)
            .join(' ')
            .replace(/^[+] /, '')
            .replace(/^[-] /, '-');
    }

    static merge(calculations: Iterable<NormalizedCalculation>) {
        const ret = new NormalizedCalculation();
        for (const calculation of calculations) {
            ret.bonus += calculation.bonus;
            for (const [diceSize, number = 0] of calculation.dice.entries()) {
                ret.dice[diceSize] = (ret.dice[diceSize] ?? 0) + number;
            }
        }
        return ret;
    }
}

export class NormalizedRow extends NormalizedCalculation {
    comment?: string;

    toString() {
        return this.comment ? `${super.toString()} ${this.comment}` : super.toString();
    }

    static fromRow(row: Iterable<Ace.Token>) {
        const ret = new NormalizedRow();

        const buffer = {
            sign: 1,
            number: undefined as number | undefined,
            diceSize: undefined as number | undefined,
            flush() {
                if (this.diceSize) {
                    ret.dice[this.diceSize] ??= 0;
                    ret.dice[this.diceSize] += (this.number ?? 1) * this.sign;
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
            if (type === 'constant.numeric') {
                buffer.number = Number(token.value);
            } else if (type === 'keyword.operator') {
                buffer.flush();
                if (value === '+') {
                    buffer.sign = 1;
                } else if (value === '-') {
                    buffer.sign = -1;
                }
            } else if (type === 'entity.name.function') {
                if (value.startsWith('d')) {
                    buffer.number = 1;
                    buffer.diceSize = Number(value.slice(1));
                }
            } else if (token.type === 'comment.line') {
                ret.comment = value.trim().replace(/[^\p{Letter} ]/gu, '');
            }
        }
        buffer.flush();
        return ret;
    }

    static *fromBlock(block: Iterable<Iterable<Ace.Token>>) {
        for (const row of block) yield NormalizedRow.fromRow(row);
    }
}

export function calculateBlock(block: Iterable<Iterable<Ace.Token>>) {
    return NormalizedRow.merge(NormalizedRow.fromBlock(block)).toAverage();
}
