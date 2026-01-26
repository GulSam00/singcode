'use client';

import Matter from 'matter-js';
import { useEffect, useRef } from 'react';

interface FallingIconsProps {
  count: number;
}

export default function FallingIcons({ count }: FallingIconsProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine>(null);
  const renderRef = useRef<Matter.Render>(null);
  const runnerRef = useRef<Matter.Runner>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Engine setup
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: sceneRef.current.clientWidth,
        height: 300,
        wireframes: false,
        background: 'transparent',
      },
    });

    // Walls
    const width = sceneRef.current.clientWidth;
    const height = 300;
    const wallThickness = 50;

    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + wallThickness / 2 - 10,
      width,
      wallThickness,
      {
        isStatic: true,
        render: { fillStyle: 'transparent' },
      },
    );
    const leftWall = Matter.Bodies.rectangle(
      0 - wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      {
        isStatic: true,
        render: { fillStyle: 'transparent' },
      },
    );
    const rightWall = Matter.Bodies.rectangle(
      width + wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      {
        isStatic: true,
        render: { fillStyle: 'transparent' },
      },
    );

    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    // Runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Custom rendering for emojis
    Matter.Events.on(render, 'afterRender', () => {
      const context = render.context;
      // render.context can be null in some environments but usually valid here
      if (!context) return;

      const bodies = Matter.Composite.allBodies(engine.world);

      context.font = '12px serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      bodies.forEach(body => {
        if (!body.isStatic) {
          context.fillText('👍', body.position.x, body.position.y);
        }
      });
    });

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    // Resize handler
    const handleResize = () => {
      if (!sceneRef.current || !renderRef.current) return;
      renderRef.current.canvas.width = sceneRef.current.clientWidth;
      renderRef.current.canvas.height = 300;

      // Update wall positions if needed, but for modal usually fixed width or managed by container
      // For simplicity re-center ground/walls if responsive is critical, but here modal width is stable enough.
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      if (render.canvas) {
        render.canvas.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;

    const currentBodies = bodiesRef.current;
    const diff = count - currentBodies.length;

    if (diff > 0) {
      // Add bodies
      for (let i = 0; i < diff; i++) {
        const x = Math.random() * (sceneRef.current?.clientWidth || 300);
        const y = -Math.random() * 500 - 50; // Start above view

        const body = Matter.Bodies.circle(x, y, 15, {
          restitution: 0.5,
          friction: 0.005,
          render: {
            fillStyle: '#FFC300', // Gold color for coin
            strokeStyle: '#F57F17',
            lineWidth: 2,
            opacity: 0.8,
          },
        });

        Matter.World.add(engineRef.current.world, body);
        currentBodies.push(body);
      }
    } else if (diff < 0) {
      // Remove bodies (LIFO for visual stacking effect, or random?)
      // Removing latest added (top often) might be cleaner
      const bodiesToRemove = currentBodies.splice(currentBodies.length + diff, -diff);
      bodiesToRemove.forEach(body => {
        Matter.World.remove(engineRef.current!.world, body);
      });
    }
  }, [count]);

  return <div ref={sceneRef} className="h-[300px] w-full overflow-hidden bg-amber-50" />;
}
