import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { HOTBAR_BLOCKS } from '@/lib/blockTypes';
import Crosshair from '@/components/game/Crosshair';
import Hotbar from '@/components/game/Hotbar';
import GameHUD from '@/components/game/GameHUD';

export default function Game() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const handleHotbarChange = useCallback((idx) => {
    if (idx >= 0 && idx < HOTBAR_BLOCKS.length) {
      setSelectedIndex(idx);
      if (engineRef.current) {
        engineRef.current.setSelectedBlock(HOTBAR_BLOCKS[idx]);
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    engine.onHotbarChange = handleHotbarChange;
    engine.setSelectedBlock(HOTBAR_BLOCKS[0]);

    const handlePointerLock = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };
    document.addEventListener('pointerlockchange', handlePointerLock);

    // Handle scroll for hotbar
    const handleWheel = (e) => {
      if (!engine.isPointerLocked) return;
      e.preventDefault();
      setSelectedIndex(prev => {
        const newIdx = e.deltaY > 0
          ? (prev + 1) % HOTBAR_BLOCKS.length
          : (prev - 1 + HOTBAR_BLOCKS.length) % HOTBAR_BLOCKS.length;
        engine.setSelectedBlock(HOTBAR_BLOCKS[newIdx]);
        return newIdx;
      });
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      engine.destroy();
      document.removeEventListener('pointerlockchange', handlePointerLock);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleHotbarChange]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {isPointerLocked && <Crosshair />}
      <Hotbar selectedIndex={selectedIndex} />
      <GameHUD isPointerLocked={isPointerLocked} />
    </div>
  );
}
