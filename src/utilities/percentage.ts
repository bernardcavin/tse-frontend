export function getColorFromPercentage(percentage: number): string {
    if (percentage < 0 || percentage > 100) {
        throw new Error("Percentage must be between 0 and 100");
    }

    let red, green, blue;

    if (percentage <= 50) {
        red = 255;
        green = Math.floor((percentage / 50) * 255);
        blue = 0;
    } else {
        red = Math.floor((1 - (percentage - 50) / 50) * 255);
        green = 255;
        blue = 0;
    }

    return `rgb(${red}, ${green}, ${blue})`;
}

export default getColorFromPercentage;