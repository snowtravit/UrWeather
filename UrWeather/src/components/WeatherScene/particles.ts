export interface ParticleSystem {
  init(canvas: HTMLCanvasElement): void;
  update(dt: number, windSpeed: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  size: number = 1;
  life: number = 1;
  maxLife: number = 1;
  alpha: number = 1;
}

export class RainSystem implements ParticleSystem {
  particles: Particle[] = [];
  canvas!: HTMLCanvasElement;
  heavy: boolean;

  constructor(heavy: boolean = false) {
    this.heavy = heavy;
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const count = this.heavy ? 500 : 150;
    this.particles = Array.from({ length: count }, () => this.createParticle());
  }

  createParticle(resetY = true): Particle {
    const p = new Particle();
    p.x = Math.random() * this.canvas.width;
    p.y = resetY ? Math.random() * -this.canvas.height : Math.random() * this.canvas.height;
    p.vy = (Math.random() * 5 + 10) * (this.heavy ? 1.5 : 1);
    p.vx = 0;
    p.size = Math.random() * 2 + 1;
    p.alpha = Math.random() * 0.4 + 0.2;
    return p;
  }

  update(dt: number, windSpeed: number) {
    const windEffect = windSpeed * 0.5;
    for (const p of this.particles) {
      p.x += (p.vx + windEffect) * (dt / 16);
      p.y += p.vy * (dt / 16);
      if (p.y > this.canvas.height) {
        Object.assign(p, this.createParticle(true));
        p.x = Math.random() * this.canvas.width - windEffect * 50;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.size, p.size * (this.heavy ? 8 : 6));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export class SnowSystem implements ParticleSystem {
  particles: Particle[] = [];
  canvas!: HTMLCanvasElement;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.particles = Array.from({ length: 300 }, () => this.createParticle());
  }

  createParticle(resetY = true): Particle {
    const p = new Particle();
    p.x = Math.random() * this.canvas.width;
    p.y = resetY ? Math.random() * -this.canvas.height : Math.random() * this.canvas.height;
    p.vy = Math.random() * 1 + 1;
    p.size = Math.random() * 3 + 1;
    p.alpha = Math.random() * 0.5 + 0.3;
    return p;
  }

  update(dt: number, windSpeed: number) {
    const windEffect = windSpeed * 0.2;
    const time = Date.now() / 1000;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += (windEffect + Math.sin(time + i) * 0.5) * (dt / 16);
      p.y += p.vy * (dt / 16);
      if (p.y > this.canvas.height) {
        Object.assign(p, this.createParticle(true));
      }
      if (p.x > this.canvas.width + 50) p.x = -50;
      if (p.x < -50) p.x = this.canvas.width + 50;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffffff';
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export class FogSystem implements ParticleSystem {
  particles: Particle[] = [];
  canvas!: HTMLCanvasElement;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.particles = Array.from({ length: 40 }, () => this.createParticle());
  }

  createParticle(): Particle {
    const p = new Particle();
    p.x = Math.random() * this.canvas.width;
    p.y = Math.random() * this.canvas.height;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.size = Math.random() * 200 + 100;
    p.alpha = Math.random() * 0.1 + 0.05;
    return p;
  }

  update(dt: number, windSpeed: number) {
    const windEffect = windSpeed * 0.05;
    for (const p of this.particles) {
      p.x += (p.vx + windEffect) * (dt / 16);
      if (p.x - p.size > this.canvas.width) {
        p.x = -p.size;
      } else if (p.x + p.size < 0) {
        p.x = this.canvas.width + p.size;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `rgba(200, 220, 240, ${p.alpha})`);
      grad.addColorStop(1, 'rgba(200, 220, 240, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class SunSystem implements ParticleSystem {
  canvas!: HTMLCanvasElement;
  time = 0;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update(dt: number) {
    this.time += dt * 0.001;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.canvas.width * 0.8;
    const cy = this.canvas.height * 0.2;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
    grad.addColorStop(0, 'rgba(255, 230, 150, 0.4)');
    grad.addColorStop(1, 'rgba(255, 230, 150, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.time * 0.1);
    ctx.fillStyle = 'rgba(255, 240, 180, 0.05)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(800, -50);
      ctx.lineTo(800, 50);
      ctx.fill();
      ctx.rotate((Math.PI * 2) / 12);
    }
    ctx.restore();

    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = Math.sin(i * 13 + this.time) * this.canvas.width;
      const y = Math.cos(i * 17 + this.time) * this.canvas.height;
      const nx = (x % this.canvas.width + this.canvas.width) % this.canvas.width;
      const ny = (y % this.canvas.height + this.canvas.height) % this.canvas.height;
      ctx.globalAlpha = Math.sin(this.time * 2 + i) * 0.5 + 0.5;
      ctx.fillRect(nx, ny, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}

export class DrizzleSystem extends RainSystem {
  constructor() {
    super(false);
  }

  createParticle(resetY = true): Particle {
    const p = super.createParticle(resetY);
    p.vy = Math.random() * 3 + 5;
    p.size = 1;
    p.alpha = Math.random() * 0.3 + 0.1;
    return p;
  }

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.particles = Array.from({ length: 100 }, () => this.createParticle());
  }
}

export class StormSystem extends RainSystem {
  time = 0;
  lightning = 0;

  constructor() {
    super(true);
  }

  update(dt: number, windSpeed: number) {
    super.update(dt, windSpeed * 1.5);
    this.time += dt;
    if (Math.random() < 0.005) {
      this.lightning = 1;
    }
    if (this.lightning > 0) {
      this.lightning -= dt * 0.005;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.lightning > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightning * 0.4})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    super.draw(ctx);
  }
}

export class CloudySystem implements ParticleSystem {
  particles: Particle[] = [];
  canvas!: HTMLCanvasElement;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.particles = Array.from({ length: 15 }, () => this.createParticle());
  }

  createParticle(): Particle {
    const p = new Particle();
    p.x = Math.random() * this.canvas.width;
    p.y = Math.random() * this.canvas.height * 0.5;
    p.vx = Math.random() * 0.5 + 0.1;
    p.size = Math.random() * 150 + 100;
    p.alpha = Math.random() * 0.2 + 0.1;
    return p;
  }

  update(dt: number, windSpeed: number) {
    const windEffect = windSpeed * 0.1;
    for (const p of this.particles) {
      p.x += (p.vx + windEffect) * (dt / 16);
      if (p.x - p.size > this.canvas.width) {
        p.x = -p.size * 2;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.fillStyle = `rgba(180, 190, 210, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.arc(p.x + p.size * 0.5, p.y - p.size * 0.2, p.size * 0.8, 0, Math.PI * 2);
      ctx.arc(p.x - p.size * 0.5, p.y - p.size * 0.1, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
