import React, { Suspense, useMemo } from 'react';
import { useGLTF, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import {
    detectFurnitureCategory,
    getRealisticDimensions,
    getFurnitureColorPalette,
    FURNITURE_CATEGORIES
} from '../../utils/furnitureDimensions';
import {
    Sofa3D,
    Bed3D,
    DiningTable3D,
    CoffeeTable3D,
    Armchair3D,
    Storage3D,
    Chair3D,
    GenericModern3D
} from './ProceduralFurniture';

/**
 * Main Model Component
 */
const Model = ({ item }) => {
    /* =========================
       ✅ 1. ALL HOOKS AT TOP
    ========================= */
    const { width, length, height, category } = useMemo(() => {
        return getRealisticDimensions(item);
    }, [item]);

    const palette = useMemo(() => {
        return getFurnitureColorPalette(item);
    }, [item]);

    const position = useMemo(() => {
        return [
            Number(item?.x) || 0,
            0, // All procedural models rest naturally on the floor at y=0
            Number(item?.y) || 0
        ];
    }, [item?.x, item?.y]);

    const rotation = useMemo(() => {
        return [
            0,
            -(Number(item?.rotation) || 0) * (Math.PI / 180),
            0
        ];
    }, [item?.rotation]);

    /* =========================
       ✅ 2. SAFE GUARD
    ========================= */
    if (!item || typeof item !== "object") {
        return null;
    }

    /* =========================
       ✅ 3. RENDER 3D MODEL
    ========================= */
    return (
        <group position={position} rotation={rotation}>
            <Suspense
                fallback={
                    <RoundedBox
                        args={[width, height, length]}
                        radius={0.02}
                        position={[0, height / 2, 0]}
                    >
                        <meshStandardMaterial
                            color={palette.primary}
                            opacity={0.4}
                            transparent
                        />
                    </RoundedBox>
                }
            >
                {/* 1. GLTF 3D Model file if available */}
                {item?.modelPath && typeof item.modelPath === "string" ? (
                    <SafeGltf path={item.modelPath} />
                ) : (
                    /* 2. Category-Specific Procedural 3D Furniture */
                    <CategoryModel
                        category={category}
                        width={width}
                        length={length}
                        height={height}
                        palette={palette}
                    />
                )}
            </Suspense>
        </group>
    );
};

/**
 * Router component for Category 3D Models
 */
const CategoryModel = ({ category, width, length, height, palette }) => {
    switch (category) {
        case FURNITURE_CATEGORIES.SOFA_3_SEATER:
        case FURNITURE_CATEGORIES.SOFA_2_SEATER:
            return <Sofa3D width={width} length={length} height={height} palette={palette} />;

        case FURNITURE_CATEGORIES.RECLINER:
        case FURNITURE_CATEGORIES.ARMCHAIR:
            return <Armchair3D width={width} length={length} height={height} palette={palette} />;

        case FURNITURE_CATEGORIES.BED_KING:
        case FURNITURE_CATEGORIES.BED_QUEEN:
        case FURNITURE_CATEGORIES.BED_SINGLE:
            return <Bed3D width={width} length={length} height={height} palette={palette} />;

        case FURNITURE_CATEGORIES.DINING_TABLE:
        case FURNITURE_CATEGORIES.DESK:
            return <DiningTable3D width={width} length={length} height={height} palette={palette} />;

        case FURNITURE_CATEGORIES.COFFEE_TABLE:
        case FURNITURE_CATEGORIES.SIDE_TABLE:
        case FURNITURE_CATEGORIES.NIGHTSTAND:
            return <CoffeeTable3D width={width} length={length} height={height} palette={palette} />;

        case FURNITURE_CATEGORIES.WARDROBE:
        case FURNITURE_CATEGORIES.CABINET:
        case FURNITURE_CATEGORIES.BOOKSHELF:
            return <Storage3D width={width} length={length} height={height} palette={palette} isTvUnit={false} />;

        case FURNITURE_CATEGORIES.TV_UNIT:
            return <Storage3D width={width} length={length} height={height} palette={palette} isTvUnit={true} />;

        case FURNITURE_CATEGORIES.CHAIR:
            return <Chair3D width={width} length={length} height={height} palette={palette} isOffice={false} />;

        case FURNITURE_CATEGORIES.OFFICE_CHAIR:
            return <Chair3D width={width} length={length} height={height} palette={palette} isOffice={true} />;

        case FURNITURE_CATEGORIES.GENERIC:
        default:
            return <GenericModern3D width={width} length={length} height={height} palette={palette} />;
    }
};

/**
 * Safe GLTF Model Loader
 */
const SafeGltf = ({ path }) => {
    const safePath = path && typeof path === "string" ? path : "/dummy.glb";
    const { scene } = useGLTF(safePath);

    if (!path || !scene) {
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

export default Model;