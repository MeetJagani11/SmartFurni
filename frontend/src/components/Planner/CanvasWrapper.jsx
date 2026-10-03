import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';

/**
 * CanvasWrapper - A high-fidelity interior container for React Three Fiber.
 * Provides architectural studio lighting, realistic soft shadows, and adaptive camera framing.
 */
const CanvasWrapper = ({ children, roomWidth = 5, roomLength = 5 }) => {
    // Dynamic camera placement scaled to room size
    const cameraSettings = useMemo(() => {
        const maxDim = Math.max(roomWidth, roomLength);
        return {
            position: [roomWidth * 0.7, maxDim * 0.72 + 1.2, roomLength * 0.95 + 1.2],
            fov: 42,
            target: [0, 0.5, 0]
        };
    }, [roomWidth, roomLength]);

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9', position: 'relative' }}>
            <Canvas
                shadows
                camera={{
                    position: cameraSettings.position,
                    fov: cameraSettings.fov
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#e2e8f0');
                }}
            >
                {/* Global Suspense for 3D assets */}
                <Suspense fallback={null}>
                    {/* 1. Interior Studio Lighting Setup */}
                    {/* Soft Ambient Fill */}
                    <ambientLight color="#ffffff" intensity={0.7} />

                    {/* Primary Directional Window Sunlight */}
                    <directionalLight
                        castShadow
                        position={[-roomWidth * 0.8, 4.5, roomLength * 0.3]}
                        intensity={1.8}
                        color="#fff9f0"
                        shadow-mapSize={[2048, 2048]}
                        shadow-bias={-0.0001}
                        shadow-camera-left={-roomWidth}
                        shadow-camera-right={roomWidth}
                        shadow-camera-top={roomLength}
                        shadow-camera-bottom={-roomLength}
                        shadow-camera-near={0.5}
                        shadow-camera-far={25}
                    />

                    {/* Warm Ceiling Recessed Spot / Point Light */}
                    <pointLight
                        position={[0, 3.2, 0]}
                        intensity={0.65}
                        color="#ffedd5"
                        distance={18}
                        decay={2}
                    />

                    {/* Soft Bounced Fill from Opposite Side */}
                    <directionalLight
                        position={[roomWidth * 0.8, 3, roomLength * 0.8]}
                        intensity={0.4}
                        color="#e2e8f0"
                    />

                    {/* 2. The 3D Scene Content */}
                    {children}

                    {/* 3. Soft Realistic Floor Contact Shadows */}
                    <ContactShadows
                        position={[0, 0.002, 0]}
                        opacity={0.65}
                        scale={Math.max(roomWidth, roomLength) * 1.8}
                        blur={1.6}
                        far={3.5}
                        color="#0f172a"
                    />

                    {/* 4. Smooth Camera Orbit Controls */}
                    <OrbitControls
                        makeDefault
                        target={cameraSettings.target}
                        enableDamping={true}
                        dampingFactor={0.06}
                        minPolarAngle={0.1}
                        maxPolarAngle={Math.PI / 2 - 0.04}
                        minDistance={1.8}
                        maxDistance={35}
                    />
                </Suspense>
            </Canvas>

            {/* Optional Overlay Loader */}
            <div id="r3f-loader-root" />
        </div>
    );
};

export default CanvasWrapper;
