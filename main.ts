namespace procedural {
    let parts: Image[][] = [];
    // TODO: create example parts in separate 'sheets.ts' file

    function generate(input: Image): Image {
        let precedenceMap = input.clone();
        precedenceMap.fill(0);
        let output = precedenceMap.clone();

        for (let i = 0; i < input.width; i++) {
            for (let j = 0; j < input.height; j++) {
                let color = input.getPixel(i, j)
                if (color && parts[color]) {
                    copyOver(i,
                            j,
                            color,
                            output,
                            Math.pickRandom(parts[color]),
                            precedenceMap
                            );
                }
            }
        }
        return output;
    }

    function copyOver(x: number,
                        y: number,
                        precedence: number,
                        target: Image,
                        toCopy: Image,
                        precedenceMap: Image) {
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

    function colorSwap(input: Image, colors?: number[]): Image {
        if (!colors || colors.length != 16) {
            // shuffle 1-14; leave black and clear as is
            colors = [];
            for (let i = 1; i < 0xf; ++i) {
                colors.push(i);
            }
            shuffle(colors);
            colors.insertAt(0, 0x0);
            colors.push(0xf);
        }
        let outImage = input.clone();
        for (let i = 0; i < outImage.width; i++) {
            for (let j = 0; j < outImage.height; j++) {
                outImage.setPixel(i, j, colors[outImage.getPixel(i, j)]);
            }
        }
        return outImage;
    }

    function shuffle(input: number[]): void {
        for (let i = 0; i < input.length; ++i) {
            let ind = Math.randomRange(0, input.length - 1);
            let store = input[i];
            input[i] = input[ind];
            input[ind] = store;
        }
    }

    function saveImage(input: Image): void {
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
}