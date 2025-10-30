'use client';

import { useEffect, useRef } from "react";

/**
 * FluidText renders a WebGL fluid distortion effect (using OGL) that is
 * masked by the PASADA SVG logo. The effect uses the original colourful
 * texture from the reference CodePen – no gold or yellow colours are added.
 */
export default function FluidText() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0 as number;
    let cleanup = () => {};
    let lastTime: number | undefined;

    const init = async () => {
      if (!containerRef.current) return;
      const OGL = await import('ogl');

      const vertex = `
        attribute vec2 uv;
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0., 1.);
        }
      `;

      const fragment = `
        precision highp float;
        precision highp int;
        uniform sampler2D tWater;
        uniform sampler2D tFlow;
        uniform float uTime;
        varying vec2 vUv;
        uniform vec4 res;
        uniform vec2 img;

        void main() {
          vec3 flow = texture2D(tFlow, vUv).rgb;
          vec2 uv = .5 * gl_FragCoord.xy / res.xy;

          vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
          myUV -= flow.xy * (0.15 * 1.2);

          vec2 myUV2 = (uv - vec2(0.5))*res.zw + vec2(0.5);
          myUV2 -= flow.xy * (0.125 * 1.2);

          vec2 myUV3 = (uv - vec2(0.5))*res.zw + vec2(0.5);
          myUV3 -= flow.xy * (0.10 * 1.4);

          vec3 tex = texture2D(tWater, myUV).rgb;
          vec3 tex2 = texture2D(tWater, myUV2).rgb;
          vec3 tex3 = texture2D(tWater, myUV3).rgb;

          gl_FragColor = vec4(tex.r, tex2.g, tex3.b, 1.0);
        }
      `;

      // Create canvas and renderer
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.willChange = 'transform';
      canvas.style.transform = 'translateZ(0)';
      containerRef.current.appendChild(canvas);

      const renderer = new OGL.Renderer({ dpr: 2, canvas });
      const gl = renderer.gl;

      // Flowmap inputs
      let aspect = 1;
      const mouse = new OGL.Vec2(-1);
      const velocity = new OGL.Vec2();

      // Geometry
      const geometry = new OGL.Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });

      // Texture (colourful background image)
      const texture = new OGL.Texture(gl, { minFilter: gl.LINEAR, magFilter: gl.LINEAR });
      const img = new Image();
      img.onload = () => (texture.image = img);
      img.crossOrigin = 'Anonymous';
      img.src = 'https://robindelaporte.fr/codepen/bg3.jpg';

      const flowmap = new OGL.Flowmap(gl, { falloff: 0.3, dissipation: 0.92, alpha: 0.5 });

      const program = new OGL.Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          tWater: { value: texture },
          res: { value: new OGL.Vec4(1, 1, 1, 1) },
          img: { value: new OGL.Vec2(1638, 2048) },
          tFlow: flowmap.uniform,
        },
      });

      const mesh = new OGL.Mesh(gl, { geometry, program });

      const resize = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        canvas.width = w * 2;
        canvas.height = h * 2;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const imageAspect = 1638 / 2048; // original image aspect (height/width)
        let a1: number, a2: number;
        if (h / w < imageAspect) {
          a1 = 1;
          a2 = (h / w) / imageAspect;
        } else {
          a1 = (w / h) * imageAspect;
          a2 = 1;
        }
        mesh.program.uniforms.res.value = new OGL.Vec4(w, h, a1, a2);
        renderer.setSize(w, h);
        aspect = w / h;
      };
      window.addEventListener('resize', resize);
      resize();

      const lastMouse = new OGL.Vec2();
      let lastTime: number | undefined;

      const updateMouse = (e: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return;
        e.preventDefault();
        
        const rect = containerRef.current.getBoundingClientRect();
        let x: number | undefined, y: number | undefined;
        
        if ('changedTouches' in e && e.changedTouches.length) {
          x = e.changedTouches[0].clientX - rect.left;
          y = e.changedTouches[0].clientY - rect.top;
        } else if ('clientX' in e) {
          x = (e as MouseEvent).clientX - rect.left;
          y = (e as MouseEvent).clientY - rect.top;
        }
        if (x === undefined || y === undefined) return;

        // Normalize to container dimensions
        mouse.set(x / rect.width, 1.0 - y / rect.height);

        if (!lastTime) {
          lastTime = performance.now();
          lastMouse.set(x, y);
        }
        const deltaX = x - lastMouse.x;
        const deltaY = y - lastMouse.y;
        lastMouse.set(x, y);
        const now = performance.now();
        const delta = Math.max(10.4, now - (lastTime as number));
        lastTime = now;
        velocity.x = deltaX / delta;
        velocity.y = deltaY / delta;
        (velocity as any).needsUpdate = true;
      };

      window.addEventListener('mousemove', updateMouse as any, false);
      window.addEventListener('touchstart', updateMouse as any, false);
      window.addEventListener('touchmove', updateMouse as any, { passive: false } as any);

      const animate = (t: number) => {
        rafId = requestAnimationFrame(animate);
        
        if (!(velocity as any).needsUpdate) {
          mouse.set(-1);
          velocity.set(0);
        }
        (velocity as any).needsUpdate = false;
        
        flowmap.aspect = aspect;
        flowmap.mouse.copy(mouse);
        flowmap.velocity.lerp(velocity, (velocity as any).len ? 0.15 : 0.1);
        flowmap.update();
        
        mesh.program.uniforms.uTime.value = t * 0.01;
        renderer.render({ scene: mesh });
      };
      rafId = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', updateMouse as any);
        window.removeEventListener('touchstart', updateMouse as any);
        window.removeEventListener('touchmove', updateMouse as any);
        try { canvas.remove(); } catch {}
      };
    };

    init();
    return () => cleanup();
  }, []);

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ 
        zIndex: 10,
        pointerEvents: 'auto',
        width: '100%',
      }}
    >
      {/* Canvas with inline SVG mask to clip to text shape only */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '1200px',
          height: '220px',
          margin: '0 auto',
          flexShrink: 0,
          overflow: 'hidden',
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1400 250' preserveAspectRatio='xMidYMid meet'%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black, sans-serif' font-size='160' font-weight='900' letter-spacing='15' fill='white'%3EPASADA%3C/text%3E%3C/svg%3E")`,
          maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1400 250' preserveAspectRatio='xMidYMid meet'%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial Black, sans-serif' font-size='160' font-weight='900' letter-spacing='15' fill='white'%3EPASADA%3C/text%3E%3C/svg%3E")`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'center center',
          maskPosition: 'center center',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}
