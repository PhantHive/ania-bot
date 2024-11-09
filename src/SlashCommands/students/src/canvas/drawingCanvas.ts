import {
    createCanvas,
    CanvasRenderingContext2D,
    Canvas,
    loadImage,
} from 'canvas';
import colors from '../colors.json';
import path from 'path';

interface CoordTopic {
    x: number;
    y: number;
}

const drawArchiveCanvas = async (
    title: string,
    topics: string[]
): Promise<Canvas> => {
    const canvas = createCanvas(800, 600); // Smaller canvas for minimalist design
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Load character image
    const characterImage = await loadImage(
        path.join(
            __dirname,
            '../../../../assets/image/feedback/feedback-lucky.png'
        )
    );

    // Clean, dark background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle top accent line
    ctx.beginPath();
    const accentGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    accentGradient.addColorStop(0, 'rgba(77, 240, 255, 0)');
    accentGradient.addColorStop(0.4, 'rgba(77, 240, 255, 0.2)');
    accentGradient.addColorStop(0.6, 'rgba(77, 240, 255, 0.2)');
    accentGradient.addColorStop(1, 'rgba(77, 240, 255, 0)');
    ctx.strokeStyle = accentGradient;
    ctx.lineWidth = 1;
    ctx.moveTo(0, 30);
    ctx.lineTo(canvas.width, 30);
    ctx.stroke();

    // Minimal top decoration
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(77, 240, 255, 0.3)';
    ctx.fillText('01 FF A2', 20, 20);
    ctx.fillText('D4 E5 96', canvas.width - 80, 20);

    // Title with subtle glow
    ctx.save();
    ctx.font = 'bold 40px Arial';
    ctx.shadowColor = '#4df0ff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title + ' ...', 30, 80);
    ctx.restore();

    // Draw minimal neon box
    const drawNeonBox = (
        x: number,
        y: number,
        width: number,
        height: number
    ) => {
        ctx.save();

        // Very subtle background
        ctx.fillStyle = 'rgba(77, 240, 255, 0.03)';
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();

        // Minimal neon border
        ctx.strokeStyle = 'rgba(77, 240, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Left accent line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(77, 240, 255, 0.6)';
        ctx.moveTo(x, y + height * 0.3);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 15, y);
        ctx.stroke();
        ctx.restore();
    };

    // Topics with cleaner layout
    const topicStartY = 120;
    const topicHeight = 50;
    const boxWidth = 300;

    topics.forEach((topic, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = 30 + col * (boxWidth + 20);
        const y = topicStartY + row * 65;

        drawNeonBox(x, y, boxWidth, topicHeight);

        // Clean, readable text
        ctx.save();
        ctx.font = 'bold 24px Arial';

        // Subtle shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${index + 1} • ${topic}`, x + 15, y + 32);
        ctx.restore();
    });

    // Draw character with smaller size
    const charHeight = 270; // Reduced size
    const aspectRatio = characterImage.width / characterImage.height;
    const charWidth = charHeight * aspectRatio;
    ctx.drawImage(
        characterImage,
        canvas.width - charWidth,
        canvas.height - charHeight,
        charWidth,
        charHeight
    );

    // Minimal search button
    const searchBtnY = canvas.height - 80;
    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(77, 240, 255, 0.05)';
    ctx.strokeStyle = 'rgba(77, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.roundRect(30, searchBtnY, 180, 40, 20);
    ctx.fill();
    ctx.stroke();

    // Button text
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('Need help?', 65, searchBtnY + 26);
    ctx.restore();

    // Minimal credits
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(77, 240, 255, 0.5)';
    ctx.fillText('// lucky.phearion.fr', 30, canvas.height - 20);

    return canvas;
};

export default drawArchiveCanvas;
