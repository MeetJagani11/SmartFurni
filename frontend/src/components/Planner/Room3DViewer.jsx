import React, { useMemo } from 'react';
import CanvasWrapper from './CanvasWrapper';
import Model from './Model';
import { getFloorTexture, getWallTexture } from '../../utils/proceduralTextures';
import * as THREE from 'three';

/**
 * RoomEnvironment - Realistic Floor, Walls, Baseboards, and Architectural Accents
 */
const RoomEnvironment = ({ width, length }) => {
    const roomW = width || 5;
    const roomL = length || 5;
    const wallHeight = 2.8;
    const wallThickness = 0.12;
    const baseboardHeight = 0.12;
    const baseboardDepth = 0.025;

    // Generate seamless floor plank texture proportional to room size
    const floorTexture = useMemo(() => {
        return getFloorTexture(Math.max(2, Math.round(roomW * 0.8)), Math.max(2, Math.round(roomL * 0.8)));
    }, [roomW, roomL]);

    const wallTexture = useMemo(() => {
        return getWallTexture();
    }, []);

    const wallMaterial = useMemo(() => (
        <meshStandardMaterial
            color="#f4f1ea"
            map={wallTexture}
            roughness={0.88}
            metalness={0.02}
        />
    ), [wallTexture]);

    const baseboardMaterial = useMemo(() => (
        <meshStandardMaterial
            color="#ffffff"
            roughness={0.3}
            metalness={0.05}
        />
    ), []);

    return (
        <group>
            {/* 1. Realistic Hardwood Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
                <planeGeometry args={[roomW, roomL]} />
                <meshStandardMaterial
                    map={floorTexture}
                    roughness={0.35}
                    metalness={0.05}
                />
            </mesh>

            {/* 2. Back Wall */}
            <mesh position={[0, wallHeight / 2, -roomL / 2 - wallThickness / 2]} receiveShadow castShadow>
                <boxGeometry args={[roomW + wallThickness * 2, wallHeight, wallThickness]} />
                {wallMaterial}
            </mesh>

            {/* Back Wall Baseboard (Skirting Board) */}
            <mesh position={[0, baseboardHeight / 2, -roomL / 2 + baseboardDepth / 2]} castShadow receiveShadow>
                <boxGeometry args={[roomW, baseboardHeight, baseboardDepth]} />
                {baseboardMaterial}
            </mesh>

            {/* Back Wall Crown Molding */}
            <mesh position={[0, wallHeight - 0.04, -roomL / 2 + 0.03]} castShadow>
                <boxGeometry args={[roomW, 0.08, 0.06]} />
                {baseboardMaterial}
            </mesh>

            {/* 3. Left Wall */}
            <mesh position={[-roomW / 2 - wallThickness / 2, wallHeight / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[wallThickness, wallHeight, roomL]} />
                {wallMaterial}
            </mesh>

            {/* Left Wall Baseboard */}
            <mesh position={[-roomW / 2 + baseboardDepth / 2, baseboardHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[baseboardDepth, baseboardHeight, roomL]} />
                {baseboardMaterial}
            </mesh>

            {/* Left Wall Crown Molding */}
            <mesh position={[-roomW / 2 + 0.03, wallHeight - 0.04, 0]} castShadow>
                <boxGeometry args={[0.06, 0.08, roomL]} />
                {baseboardMaterial}
            </mesh>

            {/* 4. Right Wall */}
            <mesh position={[roomW / 2 + wallThickness / 2, wallHeight / 2, 0]} receiveShadow castShadow>
                <boxGeometry args={[wallThickness, wallHeight, roomL]} />
                {wallMaterial}
            </mesh>

            {/* Right Wall Baseboard */}
            <mesh position={[roomW / 2 - baseboardDepth / 2, baseboardHeight / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[baseboardDepth, baseboardHeight, roomL]} />
                {baseboardMaterial}
            </mesh>

            {/* Right Wall Crown Molding */}
            <mesh position={[roomW / 2 - 0.03, wallHeight - 0.04, 0]} castShadow>
                <boxGeometry args={[0.06, 0.08, roomL]} />
                {baseboardMaterial}
            </mesh>

            {/* 5. Architectural Left Window Frame & Sunlight */}
            <group position={[-roomW / 2 + 0.02, wallHeight * 0.58, 0]} rotation={[0, Math.PI / 2, 0]}>
                {/* Outer Frame */}
                <mesh castShadow>
                    <boxGeometry args={[1.8, 1.4, 0.04]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
                </mesh>
                {/* Window Pane (Frosted Light) */}
                <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[1.7, 1.3]} />
                    <meshStandardMaterial
                        color="#e0f2fe"
                        roughness={0.1}
                        metalness={0.1}
                        transparent
                        opacity={0.85}
                    />
                </mesh>
                {/* Window Muntin Bars */}
                <mesh position={[0, 0, 0.02]}>
                    <boxGeometry args={[1.7, 0.03, 0.02]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                    <boxGeometry args={[0.03, 1.3, 0.02]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
                </mesh>
            </group>
        </group>
    );
};

/**
 * Room3DViewer - Main 3D Orchestrator
 */
const Room3DViewer = ({ items, roomWidth = 5, roomLength = 5 }) => {
    // 1. Data Flow Transformation & Normalization
    const normalizedItems = useMemo(() => {
        if (!items) return [];
        return items.map(item => ({
            ...item,
            // Convert canvas coordinates (0..roomWidth) to 3D centered origin coordinates
            x: (Number(item.x) || 0) - (Number(roomWidth) / 2 || 0),
            y: (Number(item.y) || 0) - (Number(roomLength) / 2 || 0)
        }));
    }, [items, roomWidth, roomLength]);

    // 2. Prevent rendering until data is ready
    if (roomWidth === undefined || roomLength === undefined) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-sm">Initializing 3D environment...</p>
            </div>
        );
    }

    return (
        <CanvasWrapper roomWidth={roomWidth} roomLength={roomLength}>
            {/* Realistic Room with Floor, Walls, Baseboards */}
            <RoomEnvironment width={roomWidth} length={roomLength} />

            {/* Dynamic 3D Models */}
            {normalizedItems.map((item, index) => (
                <Model
                    key={item.id || item._id || item.product_id || index}
                    item={item}
                />
            ))}
        </CanvasWrapper>
    );
};

export default Room3DViewer;
