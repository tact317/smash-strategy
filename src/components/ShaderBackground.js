// src/components/ShaderBackground.js (完成版)

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// シェーダー言語(GLSL)
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse; // ★ マウス座標を受け取る変数を復活
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  float random (vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
      vec2 uv = vUv;
      float time = uTime * 0.1;

      // ★ マウスの位置によってノイズの生成を歪ませる
      float n = noise(uv * 3.0 + time + uMouse * 0.3);
      
      vec3 color = mix(uColor1, uColor2, smoothstep(0.3, 0.7, n));
      color = mix(color, uColor3, sin(n * 5.0 + time) * 0.5 + 0.5);

      uv.x += sin(uv.y * 10.0 + time) * 0.05;
      uv.y += cos(uv.x * 10.0 + time) * 0.05;
      
      float finalNoise = noise(uv * 2.0 + time);
      gl_FragColor = vec4(color * finalNoise, 1.0);
  }
`;

extend({
  LiquidMaterial: THREE.ShaderMaterial
});

// シェーダーを適用するシーン
const Scene = () => {
  const materialRef = useRef();

  useFrame((state, delta) => {
    if (materialRef.current) {
      // 時間を更新
      materialRef.current.uniforms.uTime.value += delta;
      
      // ★ マウス位置を滑らかに追従させる処理を復活
      materialRef.current.uniforms.uMouse.value.lerp(state.mouse, 0.05);
    }
  });

  // ★ uniformにuMouseを復活
  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor1: { value: new THREE.Color('#6a0dad') },
    uColor2: { value: new THREE.Color('#ff006e') },
    uColor3: { value: new THREE.Color('#3a86ff') },
  };

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <liquidMaterial 
        ref={materialRef} 
        vertexShader={vertexShader} 
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        // ★ three.jsの仕様変更に対応するため、keyを渡して再コンパイルを促す
        key={THREE.ShaderMaterial.key}
      />
    </mesh>
  );
};

// 背景全体コンポーネント
const ShaderBackground = () => {
  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
      <Scene />
    </Canvas>
  );
};

export default ShaderBackground;