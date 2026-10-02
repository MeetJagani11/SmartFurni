import React, { useMemo } from 'react';
import CanvasWrapper from './CanvasWrapper';
import Model from './Model';

/**
 * RoomEnvironment - Helper for floor and walls
 */
const RoomEnvironment = ({ width, length }) => {
    const roomW = width || 1;
    const roomL = length || 1;
    const wallHeight = 2.5;
    const wallThickness = 0.1;

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
                <planeGeometry args={[roomW, roomL]} />
                <meshStandardMaterial color="#e2e8f0" />
            </mesh>

            {/* Back Wall */}
            <mesh position={[0, wallHeight / 2, -roomL / 2 - wallThickness / 2]} receiveShadow castShadow>
                <boxGeometry args={[roomW + wallThickness * 2, wallHeight, wallThickness]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>

            {/* Left Wall */}
            <mesh position={[-roomW / 2 - wallThickness / 2, wallHeight / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[wallThickness, wallHeight, roomL]} />
                <meshStandardMaterial color="#f1f5f9" />
            </mesh>

            {/* Right Wall */}
            <mesh position={[roomW / 2 + wallThickness / 2, wallHeight / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[wallThickness, wallHeight, roomL]} />
                <meshStandardMaterial color="#f1f5f9" />
            </mesh>
        </group>
    );
};

/**
 * Room3DViewer - Main 3D Orchestrator
 * Trace: Room3DViewer → CanvasWrapper → Model → primitive
 */
const Room3DViewer = ({ items, roomWidth, roomLength }) => {
    // 1. Data Flow Transformation & Normalization
    const normalizedItems = useMemo(() => {
        if (!items) return [];
        return items.map(item => ({
            ...item,
            // Convert canvas coordinates to 3D world coordinates (center origin)
            x: (Number(item.x) || 0) - (Number(roomWidth) / 2 || 0),
            y: (Number(item.y) || 0) - (Number(roomLength) / 2 || 0)
        }));
    }, [items, roomWidth, roomLength]);

    // 2. Prevent rendering until data is ready (H)
    if (roomWidth === undefined || roomLength === undefined) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm">Initializing 3D environment...</p>
            </div>
        );
    }

    return (
        <CanvasWrapper>
            {/* Static Room Elements */}
            <RoomEnvironment width={roomWidth} length={roomLength} />

            {/* Dynamic Models with deep guards */}
            {normalizedItems.map((item, index) => (
                <Model 
                    key={item.id || item._id || index} 
                    item={item} 
                />
            ))}
        </CanvasWrapper>
    );
};

export default Room3DViewer;
