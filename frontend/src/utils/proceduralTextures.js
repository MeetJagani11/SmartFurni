/**
 * proceduralTextures.js
 * In-memory procedural texture generator for Three.js.
 * Fast, crisp at all angles, zero network latency, no CORS issues.
 */
import * as THREE from 'three';

const textureCache = new Map();

/**
 * Creates or retrieves a realistic hardwood parquet / plank floor texture
 */
export function getFloorTexture(repeatX = 4, repeatY = 4) {
    const key = `floor_${repeatX}_${repeatY}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base warm natural oak tone
    ctx.fillStyle = '#cbb292';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankHeight = 64;
    const plankWidth = 256;
    const rows = 1024 / plankHeight;

    const woodColors = [
        '#c4aa8a', '#d0b99c', '#ba9e7d', '#cdb496', '#be9f7e', '#d5bf9e', '#b59775'
    ];

    for (let r = 0; r < rows; r++) {
        const y = r * plankHeight;
        const offset = (r % 2 === 0) ? 0 : plankWidth / 2;

        for (let x = -offset; x < 1024 + plankWidth; x += plankWidth) {
            const colorIdx = Math.floor(Math.abs(Math.sin(r * 12.9898 + x * 78.233)) * woodColors.length);
            ctx.fillStyle = woodColors[colorIdx];
            ctx.fillRect(x, y, plankWidth - 2, plankHeight - 2);

            // Subtle wood grain lines inside each plank
            ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
            for (let g = 0; g < 6; g++) {
                const gy = y + 4 + g * 9;
                ctx.fillRect(x, gy, plankWidth - 2, 2);
            }

            // Plank border seam (bevel shadow)
            ctx.strokeStyle = '#8f7354';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, plankWidth - 2, plankHeight - 2);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    textureCache.set(key, texture);
    return texture;
}

/**
 * Creates or retrieves a fine woven fabric texture
 */
export function getFabricTexture(baseHex = '#3b4252', highlightHex = '#4c566a') {
    const key = `fabric_${baseHex}_${highlightHex}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);

    // Cross-weave pattern
    ctx.fillStyle = highlightHex;
    for (let x = 0; x < 256; x += 4) {
        for (let y = 0; y < 256; y += 4) {
            if ((x + y) % 8 === 0) {
                ctx.fillRect(x, y, 2, 2);
            }
        }
    }

    // Subtle noise overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 600; i++) {
        const nx = Math.random() * 256;
        const ny = Math.random() * 256;
        ctx.fillRect(nx, ny, 1.5, 1.5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    textureCache.set(key, texture);
    return texture;
}

/**
 * Creates or retrieves a polished natural wood grain texture for furniture tops and legs
 */
export function getWoodTexture(woodHex = '#5c4033') {
    const key = `wood_${woodHex}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = woodHex;
    ctx.fillRect(0, 0, 512, 512);

    // Flowing organic wood grain lines
    for (let i = 0; i < 40; i++) {
        const y = i * 13;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
            150, y + (Math.random() - 0.5) * 20,
            350, y + (Math.random() - 0.5) * 20,
            512, y
        );
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    textureCache.set(key, texture);
    return texture;
}

/**
 * Creates or retrieves a subtle plaster/paint wall texture
 */
export function getWallTexture() {
    const key = 'wall_paint';
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm contemporary wall base
    ctx.fillStyle = '#f6f5f1';
    ctx.fillRect(0, 0, 512, 512);

    // Micro plaster noise
    for (let i = 0; i < 1500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)';
        ctx.fillStyle = brightness;
        ctx.fillRect(x, y, 1.5, 1.5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    textureCache.set(key, texture);
    return texture;
}
