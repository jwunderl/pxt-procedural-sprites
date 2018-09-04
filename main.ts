namespace procedural {
    export class SpriteGenerator {
        private parts: Image[][];
        private previous: Image[];
        private colors: number[];
        // TODO: create example parts in separate 'sheets.ts' file

        // Maybe give an enum with a handful of default parts sheets,
        // and optionally accept one of those?
        constructor() {
            this.parts = [];
            this.previous = undefined;
            this.colors = [];
            for (let i = 0; i <= 0xF; i++) {
                this.colors.push(i);
            }
        }

        generate(input: Image, swapColors?: boolean, usePrevious?: boolean): Image {
            let precedenceMap = input.clone();
            precedenceMap.fill(0);
            let output = precedenceMap.clone();

            let chosen: Image[] = [];
            if (usePrevious && this.previous) {
                chosen = this.previous
            } else {
                for (let color = 0; color < this.parts.length; color++) {
                    if (this.parts[color]) {
                        chosen[color] = Math.pickRandom(this.parts[color]);
                    }
                }
            }
            this.previous = chosen;

            for (let i = 0; i < input.width; i++) {
                for (let j = 0; j < input.height; j++) {
                    let color = input.getPixel(i, j)
                    if (color && chosen[color]) {
                        copyOver(i,
                            j,
                            color,
                            output,
                            chosen[color],
                            precedenceMap
                        );
                    }
                }
            }

            if (swapColors) return this.colorSwap(output);
            else return output;
        }

        colorSwap(input: Image): Image {
            let outImage = input.clone();
            for (let i = 0; i < outImage.width; i++) {
                for (let j = 0; j < outImage.height; j++) {
                    outImage.setPixel(i, j, this.colors[outImage.getPixel(i, j)]);
                }
            }
            return outImage;
        }

        setColors(colors?: number[]): void {
            if (!colors || colors.length != 16) {
                // shuffle 1-14; leave black and clear as is
                this.colors = [];
                for (let i = 1; i < 0xf; ++i) {
                    this.colors.push(i);
                }
                shuffle(this.colors);
                this.colors.insertAt(0, 0x0);
                this.colors.push(0xf);
            } else {
                this.colors = colors;
            }
        }

        getColors(): number[] {
            return this.colors;
        }

        addPart(color: number, part: Image): void {
            if (invalidColor(color) || !part) return;

            if (!this.parts[color]) this.parts[color] = [part];
            else this.parts[color].push(part);
        }

        setParts(color: number, parts: Image[]): void {
            if (invalidColor(color) || !parts) return;
            for (let part of parts) {
                if (!part) return;
            }
            this.parts[color] = parts;
        }
    }

    export function createSpriteGenerator(): SpriteGenerator {
        return new SpriteGenerator();
    }

    export function saveImage(input: Image): void {
        let output = "img`\n";
        for (let row = 0; row < input.height; row++) {
            for (let col = 0; col < input.width; col++) {
                let val = input.getPixel(col, row);
                output += ((val < 0xa) ?
                    val + ""
                    : "ABCDEF".charAt(val % 10))
                    + " ";
            }
            output += "\n";
        }
        console.log(output + "`");
    }

    function copyOver(x: number,
        y: number,
        precedence: number,
        target: Image,
        toCopy: Image,
        precedenceMap: Image): void {
        x -= toCopy.width / 2
        y -= toCopy.height / 2;
        for (let i = 0; i < toCopy.width; i++) {
            for (let j = 0; j < toCopy.height; j++) {
                const outX = x + i;
                const outY = y + j;
                const color = toCopy.getPixel(i, j);
                const currPrec = precedenceMap.getPixel(outX, outY);
                if (color && currPrec <= precedence) {
                    target.setPixel(outX, outY, color);
                    precedenceMap.setPixel(outX, outY, precedence);
                }
            }
        }
    }

    function shuffle(input: number[]): void {
        for (let i = 0; i < input.length; ++i) {
            let ind = Math.randomRange(0, input.length - 1);
            let store = input[i];
            input[i] = input[ind];
            input[ind] = store;
        }
    }

    function invalidColor(color: number): boolean {
        return color < 0 || color > 0xf;
    }
}