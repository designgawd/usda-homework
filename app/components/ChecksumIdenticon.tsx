import { useEffect, useRef } from "react";

export default function ChecksumIdenticon({ checksum, sizes, pixelSizes }: { checksum: string, sizes: number, pixelSizes: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = sizes || 3;
        const pixelSize = pixelSizes || 10;
        canvas.width = size * pixelSize;
        canvas.height = size * pixelSize;

        const bytes =
            checksum.match(/.{2}/g)?.map((h) => parseInt(h, 16)) || [];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < Math.ceil(size / 2); x++) {
                const i = y * size + x;
                if (i >= bytes.length) break;
                const value = bytes[i];
                const filled = value % 2 === 0;

                if (filled) {
                    ctx.fillStyle = `hsl(${value % 360}, 70%, 60%)`;
                    ctx.fillRect(
                        x * pixelSize,
                        y * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                    ctx.fillRect(
                        (size - x - 1) * pixelSize,
                        y * pixelSize,
                        pixelSize,
                        pixelSize
                    );
                }
            }
        }
    }, [checksum, sizes, pixelSizes]);

    return <canvas ref={canvasRef} className="border rounded" />;
}
