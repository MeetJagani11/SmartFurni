import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Ruler, Trash2, RotateCw } from 'lucide-react';
import { Button } from "../ui/button";
import { useToast } from '../../hooks/use-toast';
import { useCallback } from 'react';
import { getRealisticDimensions } from '../../utils/furnitureDimensions';

const FabricCanvas = ({ roomLength, roomWidth, onSave, onItemsUpdate, initialItems, validateAddition }) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const { toast } = useToast();

    // Pixels per meter (1m = 80px)
    const PPM = 80;

    const checkCollisions = useCallback((movingObj) => {
        if (!fabricRef.current) return false;
        let hasCollision = false;
        fabricRef.current.getObjects().forEach(obj => {
            if (obj === movingObj || obj.type === 'line' || obj.type === 'grid-line') return;
            if (movingObj.intersectsWithObject(obj)) {
                hasCollision = true;
                movingObj.set('stroke', 'red');
                movingObj.set('strokeWidth', 2);
            }
        });
        if (!hasCollision) {
            movingObj.set('stroke', null);
            movingObj.set('strokeWidth', 0);
        }
        return hasCollision;
    }, []);

    const notifyItemsUpdate = useCallback(() => {
        if (onItemsUpdate && fabricRef.current) {
            const objects = fabricRef.current.getObjects().filter(o => o.type === 'group');
            const itemsData = objects.map(obj => {
                const data = obj.data || {};
                const dims = getRealisticDimensions(data);
                return {
                    product_id: data.id || data.product_id,
                    name: data.name,
                    price: data.smartFurniPrice || data.price || 0,
                    x: obj.left / PPM,
                    y: obj.top / PPM,
                    rotation: obj.angle,
                    width: obj.width / PPM || dims.width,
                    length: obj.height / PPM || dims.length,
                    height: dims.height,
                    image: data.image
                };
            });
            onItemsUpdate(itemsData);
        }
    }, [onItemsUpdate, PPM]);


    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: roomLength * PPM,
            height: roomWidth * PPM,
            backgroundColor: '#ffffff',
            selection: true,
        });

        fabricRef.current = canvas;

        const drawGrid = () => {
            const gridColor = '#f0f0f0';
            for (let i = 0; i < (roomLength * PPM) / PPM; i++) {
                canvas.add(new fabric.Line([i * PPM, 0, i * PPM, roomWidth * PPM], { stroke: gridColor, selectable: false, hoverCursor: 'default' }));
            }
            for (let i = 0; i < (roomWidth * PPM) / PPM; i++) {
                canvas.add(new fabric.Line([0, i * PPM, roomLength * PPM, i * PPM], { stroke: gridColor, selectable: false, hoverCursor: 'default' }));
            }
        };

        drawGrid();

        // Object Movement restrictions
        const gridSize = PPM / 4; // 0.25m snap

        canvas.on('object:moving', (e) => {
            const obj = e.target;
            obj.set({
                left: Math.round(obj.left / gridSize) * gridSize,
                top: Math.round(obj.top / gridSize) * gridSize
            });

            const bounds = obj.getBoundingRect();
            if (bounds.top < 0) obj.top = 0;
            if (bounds.left < 0) obj.left = 0;
            if (bounds.top + bounds.height > canvas.height) obj.top = canvas.height - bounds.height;
            if (bounds.left + bounds.width > canvas.width) obj.left = canvas.width - bounds.width;

            checkCollisions(obj);
        });

        canvas.on('mouse:down', (e) => {
            if (e.target && e.target.type === 'group') {
                e.target.setCoords();
                if (!checkCollisions(e.target)) {
                    e.target.lastSafeState = {
                        left: e.target.left,
                        top: e.target.top,
                        angle: e.target.angle,
                        scaleX: e.target.scaleX,
                        scaleY: e.target.scaleY,
                        width: e.target.width,
                        height: e.target.height
                    };
                }
            }
        });

        canvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
        canvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
        canvas.on('selection:cleared', () => setSelectedObject(null));

        canvas.on('object:scaling', (e) => {
            const obj = e.target;
            if (obj.type === 'group') {
                let newWidth = obj.width * obj.scaleX;
                let newHeight = obj.height * obj.scaleY;
                newWidth = Math.max(gridSize, Math.round(newWidth / gridSize) * gridSize);
                newHeight = Math.max(gridSize, Math.round(newHeight / gridSize) * gridSize);
                obj.set({
                    scaleX: newWidth / obj.width,
                    scaleY: newHeight / obj.height
                });
            }
        });

        canvas.on('object:modified', (e) => {
            const obj = e.target;
            if (obj.type === 'group' && (obj.scaleX !== 1 || obj.scaleY !== 1)) {
                const newWidth = obj.width * obj.scaleX;
                const newHeight = obj.height * obj.scaleY;
                const rect = obj.item(0);
                rect.set({ width: newWidth, height: newHeight });
                const text = obj.item(1);
                text.set({ top: newHeight + 5 });
                obj.set({
                    width: newWidth,
                    height: newHeight,
                    scaleX: 1,
                    scaleY: 1
                });
                obj.setCoords();
            }

            if (obj.type === 'group') {
                obj.setCoords();
                if (checkCollisions(obj) && obj.lastSafeState) {
                    toast({
                        title: "Action Prevented",
                        description: "Furniture overlap detected. Item restored to previous position.",
                        variant: "destructive"
                    });
                    if (obj.lastSafeState.width !== obj.width || obj.lastSafeState.height !== obj.height) {
                        const rect = obj.item(0);
                        rect.set({ width: obj.lastSafeState.width, height: obj.lastSafeState.height });
                        const text = obj.item(1);
                        text.set({ top: obj.lastSafeState.height + 5 });
                    }
                    obj.set({
                        left: obj.lastSafeState.left,
                        top: obj.lastSafeState.top,
                        angle: obj.lastSafeState.angle,
                        scaleX: obj.lastSafeState.scaleX,
                        scaleY: obj.lastSafeState.scaleY,
                        width: obj.lastSafeState.width,
                        height: obj.lastSafeState.height
                    });
                    obj.set('stroke', null);
                    obj.set('strokeWidth', 0);
                    obj.setCoords();
                } else {
                    obj.lastSafeState = {
                        left: obj.left,
                        top: obj.top,
                        angle: obj.angle,
                        scaleX: obj.scaleX,
                        scaleY: obj.scaleY,
                        width: obj.width,
                        height: obj.height
                    };
                }
            }
            canvas.renderAll();
        });



        // Expose add product function to window for the library to call or internal drop
        window.plannerAddProduct = (product, options = {}) => {
            // Budget/Validation check
            if (validateAddition && !validateAddition(product)) {
                return null;
            }

            const dims = getRealisticDimensions(product);
            const width = (product.width || dims.width) * PPM;
            const height = (product.length || dims.length) * PPM;
            const left = options.left !== undefined ? options.left : 100;
            const top = options.top !== undefined ? options.top : 100;

            const rect = new fabric.Rect({
                left: 0,
                top: 0,
                fill: '#fff',
                stroke: '#e2e8f0',
                strokeWidth: 1,
                width: width,
                height: height,
                cornerColor: '#ea580c',
                cornerSize: 8,
                transparentCorners: false,
                padding: 5,
                rx: 4,
                ry: 4,
                hasControls: true,
                lockScalingX: false,
                lockScalingY: false
            });

            // Add text label
            const text = new fabric.IText(product.name || 'Furniture', {
                fontSize: 10,
                fontFamily: 'Inter',
                left: 0,
                top: height + 5,
                selectable: false
            });

            const group = new fabric.Group([rect, text], {
                left: left,
                top: top,
                angle: options.rotation || 0,
                data: { ...product, width: product.width || dims.width, length: product.length || dims.length, height: product.height || dims.height }
            });

            canvas.add(group);
            canvas.setActiveObject(group);

            // Initialize safe state
            group.lastSafeState = {
                left: group.left,
                top: group.top,
                angle: group.angle,
                scaleX: group.scaleX,
                scaleY: group.scaleY,
                width: group.width,
                height: group.height
            };

            canvas.renderAll();
            notifyItemsUpdate();
            return group; // Return group for immediate collision check
        };

        window.plannerClearCanvas = () => {
            const objects = canvas.getObjects().filter(o => o.type === 'group');
            objects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
            notifyItemsUpdate();
        };

        // Load initial items if any
        if (initialItems && initialItems.length > 0) {
            initialItems.forEach(item => {
                const dims = getRealisticDimensions(item);
                // Determine product format (might be from DB layout structure)
                const productMock = {
                    id: item.product_id,
                    name: item.name,
                    width: item.width || dims.width,
                    length: item.length || dims.length,
                    height: item.height || dims.height,
                    image: item.image
                };
                window.plannerAddProduct(productMock, {
                    left: item.x * PPM,
                    top: item.y * PPM,
                    rotation: item.rotation
                });
            });
            // Clear selection after initial load
            canvas.discardActiveObject();
            canvas.renderAll();
            notifyItemsUpdate();
        }

        return () => {
            canvas.dispose();
            delete window.plannerAddProduct;
        };
    }, [roomLength, roomWidth, initialItems]); // Added initialItems to dependency array

    const handleDrop = (e) => {
        e.preventDefault();
        const productData = e.dataTransfer.getData("product");
        if (!productData) return;

        try {
            const product = JSON.parse(productData);

            // Get the container of the canvas element instead of the raw canvas
            const containerNode = canvasRef.current.parentElement;
            const rect = containerNode.getBoundingClientRect();

            // Calculate exact mouse position relative to canvas
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Apply grid snapping (0.25m = PPM / 4)
            const gridSize = PPM / 4;
            let snappedX = Math.round(mouseX / gridSize) * gridSize;
            let snappedY = Math.round(mouseY / gridSize) * gridSize;

            // Prevent dropping completely out of bounds (rough check)
            if (snappedX < 0) snappedX = 0;
            if (snappedY < 0) snappedY = 0;

            const droppedObj = window.plannerAddProduct(product, { left: snappedX, top: snappedY });
            if (!droppedObj) return; // Blocked by budget or other validation

            // Check collision immediately after dropping
            if (droppedObj && checkCollisions(droppedObj)) {
                // If it collides on drop, remove it
                toast({
                    title: "Placement Blocked",
                    description: "Cannot place furniture here. Overlap detected.",
                    variant: "destructive"
                });
                fabricRef.current.remove(droppedObj);
                fabricRef.current.renderAll();
            }

        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    const handleRotate = () => {
        if (selectedObject) {
            // Add 90 degrees
            let newAngle = (selectedObject.angle + 90) % 360;
            selectedObject.rotate(newAngle);
            selectedObject.setCoords(); // Update bounding box

            // After rotation, center might have shifted off-grid. 
            // We'll calculate the new top-left and snap it.
            const gridSize = PPM / 4;
            const bounds = selectedObject.getBoundingRect();

            // Calculate what the snapped position of the bounds should be
            const snappedLeft = Math.round(bounds.left / gridSize) * gridSize;
            const snappedTop = Math.round(bounds.top / gridSize) * gridSize;

            // Difference between current bounds and target bounds
            const dx = snappedLeft - bounds.left;
            const dy = snappedTop - bounds.top;

            // Apply adjustment to the object's actual left/top
            selectedObject.set({
                left: selectedObject.left + dx,
                top: selectedObject.top + dy
            });

            selectedObject.setCoords(); // Update again after moving
            fabricRef.current.renderAll();
        }
    };

    const handleDelete = () => {
        if (selectedObject) {
            fabricRef.current.remove(selectedObject);
            setSelectedObject(null);
            if (onItemsUpdate) {
                // Must duplicate logic slightly since notify isn't in scope here
                const objects = fabricRef.current.getObjects().filter(o => o.type === 'group');
                const itemsData = objects.map(obj => {
                    const data = obj.data;
                    return {
                        product_id: data.id || data.product_id,
                        name: data.name,
                        price: data.smartFurniPrice || data.price || 0,
                        x: obj.left / PPM,
                        y: obj.top / PPM,
                        rotation: obj.angle,
                        width: obj.width / PPM,
                        length: obj.height / PPM,
                        image: data.image
                    };
                });
                onItemsUpdate(itemsData);
            }
        }
    };

    const prepareItemsForSave = () => {
        const objects = fabricRef.current.getObjects().filter(o => o.type === 'group');
        return objects.map(obj => {
            const data = obj.data;
            return {
                product_id: data.id || data.product_id,
                name: data.name,
                price: data.smartFurniPrice || data.price || 0,
                x: obj.left / PPM,
                y: obj.top / PPM,
                rotation: obj.angle,
                width: obj.width / PPM,
                length: obj.height / PPM,
                image: data.image
            };
        });
    };

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Toolbar */}
            {selectedObject && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg border border-orange-100 flex items-center gap-4 z-20 animate-in fade-in zoom-in slide-in-from-top-4 duration-200">
                    <div className="text-sm font-medium text-gray-700 mr-2">{selectedObject.data?.name}</div>
                    <Button variant="ghost" size="icon" onClick={handleRotate} className="text-orange-600 hover:bg-orange-50">
                        <RotateCw size={18} />
                    </Button>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:bg-red-50">
                        <Trash2 size={18} />
                    </Button>
                </div>
            )}

            <div className="relative shadow-2xl rounded-sm overflow-hidden border-8 border-gray-800 bg-gray-300">
                <canvas ref={canvasRef} />
            </div>

            {/* Hidden Button for Save trigger from parent */}
            <button
                id="canvas-save-trigger"
                className="hidden"
                onClick={() => onSave(prepareItemsForSave())}
            />

            <div className="mt-6 flex items-center gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border rounded"></div>
                    <span>Fixed Scaling</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Collision Alert</span>
                </div>
            </div>
        </div>
    );
};

export default FabricCanvas;
