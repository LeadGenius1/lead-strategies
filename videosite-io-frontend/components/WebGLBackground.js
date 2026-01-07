'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WebGLBackground() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ alpha: true, canvas })
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // Custom Shader for sleek, dark, moving atmosphere
    const planeGeo = new THREE.PlaneGeometry(2, 2)
    const planeMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float random (in vec2 _st) {
          return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise (in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        #define OCTAVES 4
        float fbm (in vec2 st) {
          float value = 0.0;
          float amplitude = .5;
          for (int i = 0; i < OCTAVES; i++) {
            value += amplitude * noise(st);
            st *= 2.;
            amplitude *= .5;
          }
          return value;
        }

        void main() {
          vec2 st = gl_FragCoord.xy/uResolution.xy;
          vec2 q = vec2(0.);
          q.x = fbm( st + 0.05*uTime);
          q.y = fbm( st + vec2(1.0));
          vec2 r = vec2(0.);
          r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*uTime );
          r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*uTime);
          float f = fbm(st+r);
          vec3 color = mix(vec3(0.02, 0.02, 0.02), vec3(0.05, 0.04, 0.01), clamp((f*f)*4.0,0.0,1.0));
          float grain = random(st * uTime) * 0.03;
          color += grain;
          float d = distance(vUv, vec2(0.5));
          color *= (1.0 - d * 0.5);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })

    const plane = new THREE.Mesh(planeGeo, planeMat)
    scene.add(plane)

    let time = 0
    const animate = () => {
      time += 0.016
      planeMat.uniforms.uTime.value = time * 0.0005
      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      planeMat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div id="canvas-bg" className="fixed top-0 left-0 w-full h-screen z-[-1] pointer-events-none">
      <canvas ref={canvasRef} />
    </div>
  )
}




