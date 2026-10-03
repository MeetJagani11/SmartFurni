import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { getWoodTexture, getFabricTexture } from '../../utils/proceduralTextures';

/**
 * Common leg component for tables, sofas, beds, chairs
 */
const FurnitureLeg = ({ position, height = 0.15, radiusTop = 0.025, radiusBottom = 0.018, material }) => (
    <mesh position={position} castShadow receiveShadow>
        <cylinderGeometry args={[radiusTop, radiusBottom, height, 16]} />
        {material || <meshStandardMaterial color="#2d221b" roughness={0.4} metalness={0.1} />}
    </mesh>
);

/**
 * 1. Realistic 3D Sofa (3-Seater, 2-Seater, Sectional)
 */
export const Sofa3D = ({ width = 2.1, length = 0.9, height = 0.85, palette }) => {
    const legH = 0.12;
    const baseH = 0.14;
    const seatH = 0.16;
    const backH = height - legH - baseH - seatH;
    const armW = Math.min(0.18, width * 0.1);
    const seatingW = width - armW * 2;
    const seatDepth = length - 0.22;
    const is3Seater = width >= 1.8;
    const numCushions = is3Seater ? 3 : (width >= 1.3 ? 2 : 1);
    const cushionW = (seatingW - 0.02 * (numCushions - 1)) / numCushions;

    const fabricMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.primary}
            roughness={0.85}
            metalness={0.05}
        />
    ), [palette.primary]);

    const accentMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.accent}
            roughness={0.8}
            metalness={0.05}
        />
    ), [palette.accent]);

    const woodLegMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood}
            roughness={0.35}
            metalness={0.1}
        />
    ), [palette.wood]);

    return (
        <group>
            {/* 4 Wooden/Metal Tapered Legs */}
            <FurnitureLeg position={[-width / 2 + 0.1, legH / 2, -length / 2 + 0.1]} height={legH} material={woodLegMat} />
            <FurnitureLeg position={[width / 2 - 0.1, legH / 2, -length / 2 + 0.1]} height={legH} material={woodLegMat} />
            <FurnitureLeg position={[-width / 2 + 0.1, legH / 2, length / 2 - 0.1]} height={legH} material={woodLegMat} />
            <FurnitureLeg position={[width / 2 - 0.1, legH / 2, length / 2 - 0.1]} height={legH} material={woodLegMat} />

            {/* Base Platform */}
            <RoundedBox
                args={[width, baseH, length]}
                radius={0.02}
                smoothness={4}
                position={[0, legH + baseH / 2, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Seat Cushions */}
            {Array.from({ length: numCushions }).map((_, i) => {
                const cx = -seatingW / 2 + cushionW / 2 + i * (cushionW + 0.02);
                return (
                    <RoundedBox
                        key={`cushion_${i}`}
                        args={[cushionW, seatH, seatDepth]}
                        radius={0.04}
                        smoothness={4}
                        position={[cx, legH + baseH + seatH / 2, 0.08]}
                        castShadow
                        receiveShadow
                    >
                        {fabricMat}
                    </RoundedBox>
                );
            })}

            {/* Backrest Main Frame */}
            <RoundedBox
                args={[width, height - legH, 0.18]}
                radius={0.03}
                smoothness={4}
                position={[0, legH + (height - legH) / 2, -length / 2 + 0.09]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Plump Backrest Pillows */}
            {Array.from({ length: numCushions }).map((_, i) => {
                const cx = -seatingW / 2 + cushionW / 2 + i * (cushionW + 0.02);
                return (
                    <RoundedBox
                        key={`back_cushion_${i}`}
                        args={[cushionW * 0.96, backH * 0.9, 0.14]}
                        radius={0.05}
                        smoothness={4}
                        position={[cx, legH + baseH + seatH + backH / 2 - 0.02, -length / 2 + 0.2]}
                        rotation={[-0.08, 0, 0]}
                        castShadow
                        receiveShadow
                    >
                        {fabricMat}
                    </RoundedBox>
                );
            })}

            {/* Left Armrest */}
            <RoundedBox
                args={[armW, height * 0.72 - legH, length]}
                radius={0.04}
                smoothness={4}
                position={[-width / 2 + armW / 2, legH + (height * 0.72 - legH) / 2, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Right Armrest */}
            <RoundedBox
                args={[armW, height * 0.72 - legH, length]}
                radius={0.04}
                smoothness={4}
                position={[width / 2 - armW / 2, legH + (height * 0.72 - legH) / 2, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Decorative Throw Pillows */}
            <RoundedBox
                args={[0.34, 0.34, 0.1]}
                radius={0.05}
                smoothness={4}
                position={[-seatingW / 2 + 0.18, legH + baseH + seatH + 0.12, 0]}
                rotation={[0.1, 0.4, 0.15]}
                castShadow
            >
                {accentMat}
            </RoundedBox>

            <RoundedBox
                args={[0.34, 0.34, 0.1]}
                radius={0.05}
                smoothness={4}
                position={[seatingW / 2 - 0.18, legH + baseH + seatH + 0.12, 0]}
                rotation={[0.1, -0.4, -0.15]}
                castShadow
            >
                {accentMat}
            </RoundedBox>
        </group>
    );
};

/**
 * 2. Realistic 3D Bed (King, Queen, Single)
 */
export const Bed3D = ({ width = 1.9, length = 2.1, height = 1.05, palette }) => {
    const frameH = 0.28;
    const legH = 0.08;
    const mattressH = 0.24;
    const headboardH = height - legH;
    const headboardThick = 0.12;
    const mattressW = width - 0.1;
    const mattressL = length - headboardThick - 0.08;

    const woodMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood}
            roughness={0.4}
            metalness={0.05}
        />
    ), [palette.wood]);

    const mattressMat = useMemo(() => (
        <meshStandardMaterial
            color="#f8fafc"
            roughness={0.9}
            metalness={0.02}
        />
    ), []);

    const duvetMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.primary}
            roughness={0.8}
            metalness={0.05}
        />
    ), [palette.primary]);

    const runnerMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.accent}
            roughness={0.75}
            metalness={0.05}
        />
    ), [palette.accent]);

    const pillowMat = useMemo(() => (
        <meshStandardMaterial
            color="#ffffff"
            roughness={0.85}
            metalness={0.02}
        />
    ), []);

    return (
        <group>
            {/* Bed Legs */}
            <FurnitureLeg position={[-width / 2 + 0.08, legH / 2, -length / 2 + 0.08]} height={legH} radiusTop={0.035} radiusBottom={0.03} material={woodMat} />
            <FurnitureLeg position={[width / 2 - 0.08, legH / 2, -length / 2 + 0.08]} height={legH} radiusTop={0.035} radiusBottom={0.03} material={woodMat} />
            <FurnitureLeg position={[-width / 2 + 0.08, legH / 2, length / 2 - 0.08]} height={legH} radiusTop={0.035} radiusBottom={0.03} material={woodMat} />
            <FurnitureLeg position={[width / 2 - 0.08, legH / 2, length / 2 - 0.08]} height={legH} radiusTop={0.035} radiusBottom={0.03} material={woodMat} />

            {/* Bed Frame Platform */}
            <RoundedBox
                args={[width, frameH, length]}
                radius={0.02}
                smoothness={4}
                position={[0, legH + frameH / 2, 0]}
                castShadow
                receiveShadow
            >
                {woodMat}
            </RoundedBox>

            {/* Headboard */}
            <RoundedBox
                args={[width + 0.04, headboardH, headboardThick]}
                radius={0.03}
                smoothness={4}
                position={[0, legH + headboardH / 2, -length / 2 + headboardThick / 2]}
                castShadow
                receiveShadow
            >
                {woodMat}
            </RoundedBox>

            {/* Headboard Upholstered Inset Panel */}
            <RoundedBox
                args={[width - 0.12, headboardH * 0.75, 0.04]}
                radius={0.03}
                smoothness={4}
                position={[0, legH + headboardH * 0.55, -length / 2 + headboardThick + 0.01]}
                castShadow
            >
                {duvetMat}
            </RoundedBox>

            {/* Mattress */}
            <RoundedBox
                args={[mattressW, mattressH, mattressL]}
                radius={0.04}
                smoothness={4}
                position={[0, legH + frameH + mattressH / 2 - 0.04, 0.04]}
                castShadow
                receiveShadow
            >
                {mattressMat}
            </RoundedBox>

            {/* Quilt / Duvet covering bottom 65% */}
            <RoundedBox
                args={[mattressW + 0.02, 0.08, mattressL * 0.65]}
                radius={0.03}
                smoothness={4}
                position={[0, legH + frameH + mattressH + 0.01, 0.04 + mattressL * 0.18]}
                castShadow
                receiveShadow
            >
                {duvetMat}
            </RoundedBox>

            {/* Decorative Bed Runner */}
            <RoundedBox
                args={[mattressW + 0.03, 0.02, 0.45]}
                radius={0.01}
                smoothness={4}
                position={[0, legH + frameH + mattressH + 0.055, 0.04 + mattressL * 0.38]}
                castShadow
            >
                {runnerMat}
            </RoundedBox>

            {/* Pillows */}
            {width > 1.4 ? (
                <>
                    {/* Left Sleeping Pillow */}
                    <RoundedBox
                        args={[0.65, 0.16, 0.42]}
                        radius={0.06}
                        smoothness={4}
                        position={[-0.42, legH + frameH + mattressH + 0.08, -length / 2 + headboardThick + 0.35]}
                        rotation={[0.22, 0, 0]}
                        castShadow
                    >
                        {pillowMat}
                    </RoundedBox>
                    {/* Right Sleeping Pillow */}
                    <RoundedBox
                        args={[0.65, 0.16, 0.42]}
                        radius={0.06}
                        smoothness={4}
                        position={[0.42, legH + frameH + mattressH + 0.08, -length / 2 + headboardThick + 0.35]}
                        rotation={[0.22, 0, 0]}
                        castShadow
                    >
                        {pillowMat}
                    </RoundedBox>
                    {/* Left Accent Cushion */}
                    <RoundedBox
                        args={[0.4, 0.4, 0.1]}
                        radius={0.05}
                        smoothness={4}
                        position={[-0.38, legH + frameH + mattressH + 0.14, -length / 2 + headboardThick + 0.55]}
                        rotation={[0.3, 0, 0]}
                        castShadow
                    >
                        {runnerMat}
                    </RoundedBox>
                    {/* Right Accent Cushion */}
                    <RoundedBox
                        args={[0.4, 0.4, 0.1]}
                        radius={0.05}
                        smoothness={4}
                        position={[0.38, legH + frameH + mattressH + 0.14, -length / 2 + headboardThick + 0.55]}
                        rotation={[0.3, 0, 0]}
                        castShadow
                    >
                        {runnerMat}
                    </RoundedBox>
                </>
            ) : (
                <RoundedBox
                    args={[0.7, 0.16, 0.42]}
                    radius={0.06}
                    smoothness={4}
                    position={[0, legH + frameH + mattressH + 0.08, -length / 2 + headboardThick + 0.35]}
                    rotation={[0.22, 0, 0]}
                    castShadow
                >
                    {pillowMat}
                </RoundedBox>
            )}
        </group>
    );
};

/**
 * 3. Realistic 3D Dining Table & Desks
 */
export const DiningTable3D = ({ width = 1.6, length = 0.9, height = 0.76, palette }) => {
    const topThickness = 0.045;
    const legH = height - topThickness;
    const legW = 0.065;
    const insetX = width / 2 - 0.1;
    const insetZ = length / 2 - 0.1;

    const tableTopMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.primary || palette.wood}
            roughness={0.3}
            metalness={0.05}
        />
    ), [palette.primary, palette.wood]);

    const tableLegMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood || palette.metal}
            roughness={0.35}
            metalness={0.1}
        />
    ), [palette.wood, palette.metal]);

    return (
        <group>
            {/* Tabletop */}
            <RoundedBox
                args={[width, topThickness, length]}
                radius={0.015}
                smoothness={4}
                position={[0, height - topThickness / 2, 0]}
                castShadow
                receiveShadow
            >
                {tableTopMat}
            </RoundedBox>

            {/* Apron Underframe */}
            <RoundedBox
                args={[width - 0.16, 0.06, length - 0.16]}
                radius={0.01}
                smoothness={4}
                position={[0, height - topThickness - 0.03, 0]}
                castShadow
            >
                {tableLegMat}
            </RoundedBox>

            {/* 4 Sturdy Tapered Table Legs */}
            <FurnitureLeg position={[-insetX, legH / 2, -insetZ]} height={legH} radiusTop={legW / 2} radiusBottom={legW / 3} material={tableLegMat} />
            <FurnitureLeg position={[insetX, legH / 2, -insetZ]} height={legH} radiusTop={legW / 2} radiusBottom={legW / 3} material={tableLegMat} />
            <FurnitureLeg position={[-insetX, legH / 2, insetZ]} height={legH} radiusTop={legW / 2} radiusBottom={legW / 3} material={tableLegMat} />
            <FurnitureLeg position={[insetX, legH / 2, insetZ]} height={legH} radiusTop={legW / 2} radiusBottom={legW / 3} material={tableLegMat} />
        </group>
    );
};

/**
 * 4. Realistic 3D Coffee Table
 */
export const CoffeeTable3D = ({ width = 1.15, length = 0.6, height = 0.44, palette }) => {
    const topThickness = 0.035;
    const legH = height - topThickness;

    const topMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood || palette.primary}
            roughness={0.3}
            metalness={0.05}
        />
    ), [palette.wood, palette.primary]);

    const legMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.metal || '#1a202c'}
            roughness={0.25}
            metalness={0.8}
        />
    ), [palette.metal]);

    return (
        <group>
            {/* Table Top */}
            <RoundedBox
                args={[width, topThickness, length]}
                radius={0.02}
                smoothness={4}
                position={[0, height - topThickness / 2, 0]}
                castShadow
                receiveShadow
            >
                {topMat}
            </RoundedBox>

            {/* Bottom Storage Shelf */}
            <RoundedBox
                args={[width * 0.85, 0.02, length * 0.85]}
                radius={0.01}
                smoothness={4}
                position={[0, height * 0.35, 0]}
                castShadow
                receiveShadow
            >
                {topMat}
            </RoundedBox>

            {/* 4 Hairpin / Metal Legs */}
            <FurnitureLeg position={[-width / 2 + 0.08, legH / 2, -length / 2 + 0.08]} height={legH} radiusTop={0.018} radiusBottom={0.012} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.08, legH / 2, -length / 2 + 0.08]} height={legH} radiusTop={0.018} radiusBottom={0.012} material={legMat} />
            <FurnitureLeg position={[-width / 2 + 0.08, legH / 2, length / 2 - 0.08]} height={legH} radiusTop={0.018} radiusBottom={0.012} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.08, legH / 2, length / 2 - 0.08]} height={legH} radiusTop={0.018} radiusBottom={0.012} material={legMat} />
        </group>
    );
};

/**
 * 5. Realistic 3D Armchair / Recliner
 */
export const Armchair3D = ({ width = 0.9, length = 0.88, height = 0.92, palette }) => {
    const legH = 0.14;
    const baseH = 0.16;
    const seatH = 0.15;
    const armW = 0.16;
    const seatW = width - armW * 2;

    const fabricMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.primary}
            roughness={0.8}
            metalness={0.05}
        />
    ), [palette.primary]);

    const legMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood}
            roughness={0.35}
            metalness={0.1}
        />
    ), [palette.wood]);

    const pillowMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.accent}
            roughness={0.8}
            metalness={0.05}
        />
    ), [palette.accent]);

    return (
        <group>
            {/* 4 Angled Peg Legs */}
            <FurnitureLeg position={[-width / 2 + 0.1, legH / 2, -length / 2 + 0.1]} height={legH} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.1, legH / 2, -length / 2 + 0.1]} height={legH} material={legMat} />
            <FurnitureLeg position={[-width / 2 + 0.1, legH / 2, length / 2 - 0.1]} height={legH} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.1, legH / 2, length / 2 - 0.1]} height={legH} material={legMat} />

            {/* Base Support */}
            <RoundedBox
                args={[width, baseH, length]}
                radius={0.03}
                smoothness={4}
                position={[0, legH + baseH / 2, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Deep Seat Cushion */}
            <RoundedBox
                args={[seatW, seatH, length - 0.18]}
                radius={0.04}
                smoothness={4}
                position={[0, legH + baseH + seatH / 2, 0.06]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* High Ergonomic Backrest */}
            <RoundedBox
                args={[width, height - legH, 0.18]}
                radius={0.04}
                smoothness={4}
                position={[0, legH + (height - legH) / 2, -length / 2 + 0.09]}
                rotation={[-0.08, 0, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Left Armrest */}
            <RoundedBox
                args={[armW, height * 0.68 - legH, length]}
                radius={0.04}
                smoothness={4}
                position={[-width / 2 + armW / 2, legH + (height * 0.68 - legH) / 2, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Right Armrest */}
            <RoundedBox
                args={[armW, height * 0.68 - legH, length]}
                radius={0.04}
                smoothness={4}
                position={[width / 2 - armW / 2, legH + (height * 0.68 - legH) / 2, 0]}
                castShadow
                receiveShadow
            >
                {fabricMat}
            </RoundedBox>

            {/* Lumbar Accent Cushion */}
            <RoundedBox
                args={[0.38, 0.26, 0.1]}
                radius={0.04}
                smoothness={4}
                position={[0, legH + baseH + seatH + 0.12, -length / 2 + 0.22]}
                rotation={[0.1, 0, 0]}
                castShadow
            >
                {pillowMat}
            </RoundedBox>
        </group>
    );
};

/**
 * 6. Realistic 3D Wardrobe / Storage / TV Unit / Cabinet
 */
export const Storage3D = ({ width = 1.25, length = 0.6, height = 1.85, palette, isTvUnit = false }) => {
    const plinthH = 0.08;
    const bodyH = height - plinthH;
    const numDoors = width >= 1.6 ? 3 : 2;
    const doorW = (width - 0.04) / numDoors;

    const bodyMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood || palette.primary}
            roughness={0.4}
            metalness={0.05}
        />
    ), [palette.wood, palette.primary]);

    const doorMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.secondary || palette.primary}
            roughness={0.35}
            metalness={0.05}
        />
    ), [palette.secondary, palette.primary]);

    const handleMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.metal || '#d4af37'}
            roughness={0.2}
            metalness={0.9}
        />
    ), [palette.metal]);

    return (
        <group>
            {/* Plinth Base */}
            <RoundedBox
                args={[width - 0.06, plinthH, length - 0.06]}
                radius={0.01}
                smoothness={4}
                position={[0, plinthH / 2, 0]}
                castShadow
                receiveShadow
            >
                {bodyMat}
            </RoundedBox>

            {/* Main Cabinet Body */}
            <RoundedBox
                args={[width, bodyH, length]}
                radius={0.02}
                smoothness={4}
                position={[0, plinthH + bodyH / 2, 0]}
                castShadow
                receiveShadow
            >
                {bodyMat}
            </RoundedBox>

            {/* Inset Door Panels with Shadow Gaps */}
            {Array.from({ length: numDoors }).map((_, i) => {
                const dx = -width / 2 + doorW / 2 + 0.02 + i * doorW;
                return (
                    <group key={`door_${i}`}>
                        <RoundedBox
                            args={[doorW - 0.01, bodyH - 0.04, 0.02]}
                            radius={0.01}
                            smoothness={4}
                            position={[dx, plinthH + bodyH / 2, length / 2 + 0.01]}
                            castShadow
                            receiveShadow
                        >
                            {doorMat}
                        </RoundedBox>

                        {/* Metal Handles */}
                        <mesh
                            position={[
                                i % 2 === 0 ? dx + doorW * 0.35 : dx - doorW * 0.35,
                                plinthH + bodyH * 0.55,
                                length / 2 + 0.03
                            ]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.008, 0.008, isTvUnit ? 0.08 : 0.22, 12]} />
                            {handleMat}
                        </mesh>
                    </group>
                );
            })}

            {/* For TV Unit: Add Ultra-slim modern TV screen & soundbar on top */}
            {isTvUnit && (
                <group position={[0, height, 0]}>
                    {/* TV Stand Base */}
                    <RoundedBox args={[0.5, 0.015, 0.2]} radius={0.005} smoothness={4} position={[0, 0.01, 0]} castShadow>
                        {handleMat}
                    </RoundedBox>
                    {/* TV Neck */}
                    <mesh position={[0, 0.08, -0.02]} castShadow>
                        <boxGeometry args={[0.08, 0.14, 0.04]} />
                        {handleMat}
                    </mesh>
                    {/* TV Screen */}
                    <RoundedBox args={[width * 0.8, 0.55, 0.03]} radius={0.01} smoothness={4} position={[0, 0.42, 0]} castShadow>
                        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
                    </RoundedBox>
                    {/* Soundbar */}
                    <RoundedBox args={[width * 0.6, 0.05, 0.07]} radius={0.01} smoothness={4} position={[0, 0.03, 0.1]} castShadow>
                        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
                    </RoundedBox>
                </group>
            )}
        </group>
    );
};

/**
 * 7. Realistic 3D Chair / Office Chair
 */
export const Chair3D = ({ width = 0.55, length = 0.55, height = 0.86, palette, isOffice = false }) => {
    const seatH = 0.46;
    const legH = seatH - 0.05;

    const seatMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.primary}
            roughness={0.7}
            metalness={0.05}
        />
    ), [palette.primary]);

    const legMat = useMemo(() => (
        <meshStandardMaterial
            color={isOffice ? '#1a202c' : palette.wood}
            roughness={0.35}
            metalness={isOffice ? 0.8 : 0.1}
        />
    ), [isOffice, palette.wood]);

    return (
        <group>
            {/* 4 Tapered Legs */}
            <FurnitureLeg position={[-width / 2 + 0.06, legH / 2, -length / 2 + 0.06]} height={legH} radiusTop={0.02} radiusBottom={0.014} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.06, legH / 2, -length / 2 + 0.06]} height={legH} radiusTop={0.02} radiusBottom={0.014} material={legMat} />
            <FurnitureLeg position={[-width / 2 + 0.06, legH / 2, length / 2 - 0.06]} height={legH} radiusTop={0.02} radiusBottom={0.014} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.06, legH / 2, length / 2 - 0.06]} height={legH} radiusTop={0.02} radiusBottom={0.014} material={legMat} />

            {/* Cushioned Seat */}
            <RoundedBox
                args={[width, 0.06, length]}
                radius={0.025}
                smoothness={4}
                position={[0, seatH, 0]}
                castShadow
                receiveShadow
            >
                {seatMat}
            </RoundedBox>

            {/* Ergonomic Curved Backrest */}
            <RoundedBox
                args={[width * 0.9, height - seatH - 0.06, 0.04]}
                radius={0.02}
                smoothness={4}
                position={[0, seatH + (height - seatH) / 2, -length / 2 + 0.04]}
                rotation={[-0.06, 0, 0]}
                castShadow
                receiveShadow
            >
                {seatMat}
            </RoundedBox>
        </group>
    );
};

/**
 * 8. Universal High-Quality Modern Furniture Fallback
 */
export const GenericModern3D = ({ width = 0.8, length = 0.8, height = 0.75, palette }) => {
    const legH = 0.12;
    const bodyH = height - legH;

    const mainMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.primary}
            roughness={0.5}
            metalness={0.05}
        />
    ), [palette.primary]);

    const legMat = useMemo(() => (
        <meshStandardMaterial
            color={palette.wood || palette.metal}
            roughness={0.35}
            metalness={0.2}
        />
    ), [palette.wood, palette.metal]);

    return (
        <group>
            {/* 4 Modern Corner Legs */}
            <FurnitureLeg position={[-width / 2 + 0.08, legH / 2, -length / 2 + 0.08]} height={legH} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.08, legH / 2, -length / 2 + 0.08]} height={legH} material={legMat} />
            <FurnitureLeg position={[-width / 2 + 0.08, legH / 2, length / 2 - 0.08]} height={legH} material={legMat} />
            <FurnitureLeg position={[width / 2 - 0.08, legH / 2, length / 2 - 0.08]} height={legH} material={legMat} />

            {/* Sleek Beveled Body */}
            <RoundedBox
                args={[width, bodyH, length]}
                radius={0.03}
                smoothness={4}
                position={[0, legH + bodyH / 2, 0]}
                castShadow
                receiveShadow
            >
                {mainMat}
            </RoundedBox>
        </group>
    );
};
