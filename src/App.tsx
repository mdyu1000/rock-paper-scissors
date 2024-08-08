import React, { useState, useEffect, useRef } from 'react';

type ItemType = 'rock' | 'paper' | 'scissors';

interface Item {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  type: ItemType;
}

const itemColors: Record<ItemType, string> = {
  rock: 'bg-gray-500',
  paper: 'bg-yellow-300',
  scissors: 'bg-red-500',
};

const itemEmojis: Record<ItemType, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

const NativeEnhancedRockPaperScissorsGame: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initializeItems = () => {
    const types: ItemType[] = ['rock', 'paper', 'scissors'];
    const initialItems: Item[] = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 380,
      y: Math.random() * 380,
      dx: (Math.random() - 0.5) * 3,
      dy: (Math.random() - 0.5) * 3,
      radius: 10,
      type: types[i % 3],
    }));
    setItems(initialItems);
  };

  useEffect(() => {
    initializeItems();
  }, []);

  useEffect(() => {
    if (paused) return;

    const intervalId = setInterval(() => {
      setItems((prevItems) => {
        const container = containerRef.current;
        if (!container) return prevItems;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        return prevItems.map((item, index) => {
          let { x, y, dx, dy, radius, type } = item;

          // Move the item
          x += dx * speed;
          y += dy * speed;

          // Wall collision with slight randomization to prevent sticking
          if (x - radius <= 0 || x + radius >= containerWidth) {
            dx = -dx * (0.95 + Math.random() * 0.1);
            x = x - radius <= 0 ? radius : containerWidth - radius;
            dy += (Math.random() - 0.5) * 0.5;
          }
          if (y - radius <= 0 || y + radius >= containerHeight) {
            dy = -dy * (0.95 + Math.random() * 0.1);
            y = y - radius <= 0 ? radius : containerHeight - radius;
            dx += (Math.random() - 0.5) * 0.5;
          }

          // Ensure minimum speed
          const minSpeed = 0.5 * speed;
          const currentSpeed = Math.sqrt(dx * dx + dy * dy);
          if (currentSpeed < minSpeed) {
            const factor = minSpeed / currentSpeed;
            dx *= factor;
            dy *= factor;
          }

          // Item collision
          for (let i = index + 1; i < prevItems.length; i++) {
            const otherItem = prevItems[i];
            const dx = otherItem.x - x;
            const dy = otherItem.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < item.radius + otherItem.radius) {
              // Collision resolution (physics part remains the same)
              const angle = Math.atan2(dy, dx);
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);

              const vx1 = item.dx * cos + item.dy * sin;
              const vy1 = item.dy * cos - item.dx * sin;
              const vx2 = otherItem.dx * cos + otherItem.dy * sin;
              const vy2 = otherItem.dy * cos - otherItem.dx * sin;

              const [finalVx1, finalVx2] = [vx2, vx1];

              item.dx = finalVx1 * cos - vy1 * sin;
              item.dy = vy1 * cos + finalVx1 * sin;
              prevItems[i].dx = finalVx2 * cos - vy2 * sin;
              prevItems[i].dy = vy2 * cos + finalVx2 * sin;

              const overlap = (item.radius + otherItem.radius - distance) / 2;
              x -= overlap * Math.cos(angle);
              y -= overlap * Math.sin(angle);
              prevItems[i].x += overlap * Math.cos(angle);
              prevItems[i].y += overlap * Math.sin(angle);

              // Apply rock-paper-scissors rules
              if (
                (type === 'rock' && otherItem.type === 'scissors') ||
                (type === 'paper' && otherItem.type === 'rock') ||
                (type === 'scissors' && otherItem.type === 'paper')
              ) {
                prevItems[i].type = type;
              } else if (type !== otherItem.type) {
                type = otherItem.type;
              }
            }
          }

          return { ...item, x, y, dx, dy, type };
        });
      });
    }, 16); // 約60fps

    return () => clearInterval(intervalId);
  }, [speed, paused]);

  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(event.target.value));
  };

  const handleReset = () => {
    initializeItems();
    setPaused(false);
  };

  const handlePauseResume = () => {
    setPaused(!paused);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <div 
        ref={containerRef}
        className="relative w-[400px] h-[400px] bg-white border border-gray-300 rounded-lg overflow-hidden mb-4"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute ${itemColors[item.type]} rounded-full flex items-center justify-center text-xs transition-transform duration-100`}
            style={{
              width: `${item.radius * 2}px`,
              height: `${item.radius * 2}px`,
              transform: `translate(${item.x - item.radius}px, ${item.y - item.radius}px)`,
            }}
          >
            {itemEmojis[item.type]}
          </div>
        ))}
      </div>
      <div className="w-full max-w-xs mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Speed: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={speed}
          onChange={handleSpeedChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Reset
        </button>
        <button
          onClick={handlePauseResume}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default NativeEnhancedRockPaperScissorsGame;