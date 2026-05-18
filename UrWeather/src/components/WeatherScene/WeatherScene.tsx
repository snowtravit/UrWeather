import React, { useEffect, useRef } from 'react';
import { SceneType } from '../../api/openMeteo';
import { RainSystem, SnowSystem, FogSystem, SunSystem, StormSystem, DrizzleSystem, CloudySystem, ParticleSystem } from './particles';

interface WeatherSceneProps {
  scene: SceneType;
  windSpeed: number;
}

export function WeatherScene({ scene, windSpeed }: WeatherSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ParticleSystem | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    switch (scene) {
      case 'clear':
        systemRef.current = new SunSystem();
        break;
      case 'cloudy':
        systemRef.current = new CloudySystem();
        break;
      case 'rain':
        systemRef.current = new RainSystem();
        break;
      case 'snow':
        systemRef.current = new SnowSystem();
        break;
      case 'fog':
        systemRef.current = new FogSystem();
        break;
      case 'storm':
        systemRef.current = new StormSystem();
        break;
      case 'drizzle':
        systemRef.current = new DrizzleSystem();
        break;
      default:
        systemRef.current = new SunSystem();
    }

    systemRef.current.init(canvas);

    const animate = (time: number) => {
      if (lastTimeRef.current !== undefined && systemRef.current) {
        const dt = time - lastTimeRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          systemRef.current.update(dt, windSpeed);
          systemRef.current.draw(ctx);
        }
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [scene, windSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
      style={{ opacity: 0.8 }}
    />
  );
}
