import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows, Environment } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

/**
 * CanvasWrapper - A safe container for the R3F Canvas.
 * It provides the necessary environment, controls, and suspense boundaries.
 */
const CanvasWrapper = ({ children, cameraPos = [0, 5, 8], fov = 45 }) => {
    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', position: 'relative' }}>
            <Canvas 
                shadows 
                camera={{ position: cameraPos, fov: fov }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#f8fafc');
                }}
            >
                {/* Global Suspense for async assets inside the Canvas */}
                <Suspense fallback={null}>
                    {/* Standard lighting and environment */}
                    <Sky sunPosition={[10, 20, 10]} />
                    <ambientLight intensity={0.4} />
                    <directionalLight
                        castShadow
                        position={[5, 8, 5]}
                        intensity={1.5}
                        shadow-mapSize={[1024, 1024]}
                    />
                    
                    {/* Default environment for better materials */}
                    <Environment preset="city" />

                    {/* The actual 3D content */}
                    {children}

                    {/* Common visual helpers */}
                    <ContactShadows 
                        position={[0, -0.01, 0]} 
                        opacity={0.4} 
                        scale={20} 
                        blur={2} 
                        far={4.5} 
                    />

                    <OrbitControls
                        makeDefault
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2 - 0.05}
                        maxDistance={25}
                        minDistance={2}
                    />
                </Suspense>
            </Canvas>
            
            {/* Optional Overlay Loader (synced with Suspense if needed) */}
            <div id="r3f-loader-root" />
        </div>
    );
};

export default CanvasWrapper;
