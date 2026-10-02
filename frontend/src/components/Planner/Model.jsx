import React, { Suspense, useMemo, useEffect } from 'react';
import { useGLTF, useTexture, Box } from '@react-three/drei';
import * as THREE from 'three';

// Safe placeholder texture
const PLACEHOLDER_TEXTURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * Main Model Component
 */
const Model = ({ item }) => {

  /* =========================
     ✅ ALL HOOKS AT TOP
  ========================= */

  const position = useMemo(() => {
    return [
      Number(item?.x) || 0,
      (Number(item?.height) || 0.8) / 2,
      Number(item?.y) || 0
    ];
  }, [item?.x, item?.y, item?.height]);

  const rotation = useMemo(() => {
    return [
      0,
      -(Number(item?.rotation) || 0) * (Math.PI / 180),
      0
    ];
  }, [item?.rotation]);

  /* =========================
     ✅ SAFE GUARD AFTER HOOKS
  ========================= */

  if (!item || typeof item !== "object") {
    console.warn("Model: invalid item", item);
    return null;
  }

  const width = Number(item.width) || 0.5;
  const height = Number(item.height) || 0.8;
  const length = Number(item.length) || 0.5;
  const color = item.color || "#ff8c42";

  /* =========================
     ✅ RENDER
  ========================= */

  return (
    <group position={position} rotation={rotation}>
      <Suspense
        fallback={
          <Box args={[width, height, length]}>
            <meshStandardMaterial
              color={color}
              opacity={0.3}
              transparent
            />
          </Box>
        }
      >

        {/* ✅ GLTF MODEL */}
        {item?.modelPath && typeof item.modelPath === "string" ? (
          <SafeGltf path={item.modelPath} />
        ) : item?.image ? (

          /* ✅ TEXTURED BOX */
          <TexturedBox
            width={width}
            height={height}
            length={length}
            image={item.image}
            color={color}
          />
        ) : (

          /* ✅ SIMPLE BOX */
          <Box args={[width, height, length]} castShadow receiveShadow>
            <meshStandardMaterial color={color} />
          </Box>
        )}

      </Suspense>
    </group>
  );
};

/* =========================
   ✅ SAFE GLTF LOADER
========================= */

const SafeGltf = ({ path }) => {
  // Always call hook with valid fallback
  const safePath = path && typeof path === "string" ? path : "/dummy.glb";

  const { scene } = useGLTF(safePath);

  if (!path || !scene) {
    console.warn("Invalid GLTF:", path);
    return null;
  }

  return (
    <primitive
      object={scene}
      dispose={null}
      castShadow
      receiveShadow
    />
  );
};

/* =========================
   ✅ SAFE TEXTURE BOX
========================= */

const TexturedBox = ({ width, height, length, image, color }) => {

  // Always call hook with fallback
  const texture = useTexture(image || PLACEHOLDER_TEXTURE);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <Box args={[width, height, length]} castShadow receiveShadow>
      <meshStandardMaterial
        color={image ? "#ffffff" : color}
        map={texture}
      />
    </Box>
  );
};

export default Model;