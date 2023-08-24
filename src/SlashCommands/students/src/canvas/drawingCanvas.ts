import { createCanvas, CanvasRenderingContext2D, Canvas } from 'canvas';
import colors from '../colors.json';

interface CoordTopic {
    x: number;
    y: number;
}

// auto ajust the text size to fit the canvas
/*
const autoSizeAjust = async (ctx, size, text) => {

    let fontSize = size;

    do {

        ctx.font = `bold ${fontSize -= 5}px Arial`;

    } while (ctx.measureText(text).width > 500);

    console.log(fontSize);

    return ctx.font;

}
*/

const drawArchiveCanvas = async (
    title: string,
    topics: string[]
): Promise<Canvas> => {
    const canvas = createCanvas(700, 750);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = colors['lines'];
    ctx.lineWidth = 3;
    ctx.moveTo(15, 5);
    ctx.arcTo(695, 5, 695, 745, 15);
    ctx.arcTo(695, 745, 5, 745, 15);
    ctx.arcTo(5, 745, 5, 5, 15);
    ctx.arcTo(5, 5, 695, 5, 15);
    ctx.stroke();
    ctx.clip();

    ctx.save();

    ctx.beginPath();
    ctx.globalAlpha = 0.7;
    let gradient = ctx.createLinearGradient(0, 750, 0, 0);
    gradient.addColorStop(0, colors['main']);
    gradient.addColorStop(1, colors['second']);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 700, 750);
    ctx.globalAlpha = 1;
    ctx.closePath();

    // Title
    ctx.beginPath();
    ctx.font = 'bold 55px Arial';
    ctx.fillStyle = colors['text'];
    ctx.shadowBlur = 5;
    ctx.shadowColor = colors['text'];
    ctx.fillText(
        title,
        canvas.width / 2 - ctx.measureText(title).width / 2,
        canvas.height * 0.12
    );
    ctx.shadowBlur = 0;
    ctx.closePath();

    ctx.strokeStyle = colors['lines'];

    // decorative lines
    ctx.beginPath();
    // left line
    ctx.moveTo(0, canvas.height * 0.2);
    ctx.lineWidth = 5;
    ctx.lineTo(canvas.width / 2 - 22, canvas.height * 0.2);
    ctx.stroke();
    ctx.closePath();

    // left arc
    ctx.beginPath();
    ctx.arc(
        canvas.width / 2 - 7,
        canvas.height * 0.2,
        15,
        1.5 * Math.PI,
        0.5 * Math.PI,
        true
    );
    ctx.stroke();
    ctx.closePath();

    // right line
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height * 0.2);
    ctx.lineWidth = 5;
    ctx.lineTo(canvas.width / 2 + 22, canvas.height * 0.2);
    ctx.stroke();
    ctx.closePath();

    // right arc
    ctx.beginPath();
    ctx.strokeStyle = colors['lines'];
    ctx.arc(
        canvas.width / 2 + 7,
        canvas.height * 0.2,
        15,
        1.5 * Math.PI,
        0.5 * Math.PI
    );
    ctx.stroke();
    ctx.closePath();

    // choices
    ctx.beginPath();
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = colors['text'];

    const availableSpace = canvas.width * 0.5;
    const firstHalf = Math.round(topics.length / 2);
    let elementPlace = availableSpace / firstHalf / 2 + 0.25 * canvas.width;

    const coordTopics: CoordTopic[] = [];

    topics.forEach((topic, index) => {
        // Calculate coordinate for first half
        if (index < firstHalf) {
            const x = canvas.width * 0.05;
            const y = elementPlace * (1 + index * 0.5);
            coordTopics.push({ x, y });

            // Calculate coordinate for second half
        } else {
            const i = index - firstHalf;
            const x = canvas.width * 0.6;
            const y = elementPlace * (1 + i * 0.5);
            coordTopics.push({ x, y });
        }
    });

    topics.forEach((topic, index) => {
        ctx.fillText(
            `${index + 1} • ${topic}`,
            coordTopics[index].x,
            coordTopics[index].y
        );
    });

    ctx.closePath();

    // decorative lines bottom
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors['lines'];
    ctx.moveTo(0, canvas.height * 0.88);
    ctx.lineTo(canvas.width, canvas.height * 0.88);
    ctx.moveTo(0, canvas.height * 0.9);
    ctx.lineTo(canvas.width, canvas.height * 0.9);
    ctx.stroke();
    ctx.closePath();

    // credits
    ctx.beginPath();
    ctx.font = 'italic 25px Arial';
    ctx.fillStyle = colors['lines'];
    let credit = 'Phearion x IRIS Robotics';
    ctx.fillText(
        credit,
        canvas.width / 2 - ctx.measureText(credit).width / 2,
        canvas.height * 0.955
    );
    ctx.closePath();

    ctx.save();

    return canvas;
};

export default drawArchiveCanvas;
