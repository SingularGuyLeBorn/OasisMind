"use client";

/**
 * About 页脚海面 —— TouchDesigner 常见做法的 WebGL 精简版：
 * 多层 Gerstner（深水色散关系）+ 解析法线 + Jacobian 浪尖白沫 + Schlick Fresnel。
 * 不做完整 FFT/Tessendorf（页脚带宽不够），但观感对齐 TD 实时海：蓝白、尖峰、广槽。
 */

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useInViewPause } from "@/lib/useInViewPause";

const SEA_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uMotion;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vFoam;
  varying float vHeight;
  varying float vShore;

  // TouchDesigner / GPU Gems Gerstner：水平圆轨道 + 垂直位移，尖峰广槽
  vec3 gerstner(
    vec3 pos,
    float steepness,
    float wavelength,
    vec2 dir,
    float speedMul,
    float phase0,
    inout vec3 tangent,
    inout vec3 binormal,
    inout float jacobian
  ) {
    float k = 6.28318530718 / max(wavelength, 0.05);
    // 深水色散：omega = sqrt(g * k)，再乘艺术向速度系数
    float c = sqrt(9.81 / k) * speedMul;
    vec2 d = normalize(dir);
    float f = k * (dot(d, pos.xz) - c * uTime * uMotion) + phase0;
    float a = steepness / k;
    float sa = sin(f);
    float ca = cos(f);

    // 解析切线 / 副法线（与 mysimulator / TD 教材一致）
    tangent += vec3(
      -d.x * d.x * (steepness * sa),
      d.x * (steepness * ca),
      -d.x * d.y * (steepness * sa)
    );
    binormal += vec3(
      -d.x * d.y * (steepness * sa),
      d.y * (steepness * ca),
      -d.y * d.y * (steepness * sa)
    );

    // 浪尖压缩 → 白沫（Jacobian 近似：水平位移挤压处）
    jacobian += steepness * ca;

    // disp.xz 用 -sin 收尖峰；disp.y 用 cos（与常见 TD 教材相位一致）
    return vec3(-d.x * a * sa, a * ca, -d.y * a * sa);
  }

  void main() {
    // PlaneGeometry 本地 XY；旋转后铺成 XZ。波浪域用 (x, 0, y)。
    vec3 pos = position;
    vec3 domain = vec3(pos.x, 0.0, pos.y);
    float shore = smoothstep(-9.0, 7.0, domain.z);
    vShore = shore;
    float ampScale = mix(0.35, 1.0, shore);

    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    vec3 disp = vec3(0.0);
    float jacobian = 0.0;

    // 陡度总和约 0.72（<0.8，避免自交）—— 长涌 + 短碎浪，对齐 TD 多层 swell
    disp += gerstner(domain, 0.22 * ampScale, 5.8, vec2(1.00, 0.18), 1.00, 0.0, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.16 * ampScale, 3.4, vec2(0.72, 0.68), 1.08, 1.1, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.12 * ampScale, 2.1, vec2(-0.35, 0.92), 1.15, 2.3, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.09 * ampScale, 1.35, vec2(0.55, -0.82), 1.22, 0.7, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.07 * ampScale, 0.85, vec2(-0.88, 0.40), 1.35, 3.5, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.05 * ampScale, 0.52, vec2(0.25, 0.96), 1.55, 1.9, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.035 * ampScale, 0.32, vec2(-0.62, -0.72), 1.75, 4.2, tangent, binormal, jacobian);
    disp += gerstner(domain, 0.025 * ampScale, 0.20, vec2(0.95, -0.28), 2.05, 0.4, tangent, binormal, jacobian);

    // 本地 xy 平面：位移 y（上）写到本地 z（配合 -X 旋转）
    pos.x += disp.x;
    pos.y += disp.z;
    pos.z += disp.y;
    vHeight = disp.y;
    // 浪尖白沫：Jacobian 压缩 + 高度
    vFoam = clamp((-jacobian) * 0.85 + disp.y * 1.35 + 0.08, 0.0, 1.0);

    vec3 tLocal = vec3(tangent.x, tangent.z, tangent.y);
    vec3 bLocal = vec3(binormal.x, binormal.z, binormal.y);
    vec3 objectNormal = normalize(cross(bLocal, tLocal));
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorldPos = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * objectNormal);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const SEA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDir;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vFoam;
  varying float vHeight;
  varying float vShore;

  // 廉价程序化微法线：模拟 TD 里 FFT 高频 chop
  vec3 microNormal(vec3 N, vec3 P, float t) {
    float n1 = sin(P.x * 14.0 + t * 1.6) * cos(P.z * 11.0 - t * 1.2);
    float n2 = sin(P.x * 27.0 - t * 2.1 + P.z * 19.0) * 0.55;
    vec3 bump = vec3(n1 * 0.08 + n2 * 0.04, 0.0, n1 * 0.05 - n2 * 0.06);
    return normalize(N + bump);
  }

  void main() {
    vec3 N = microNormal(normalize(vNormalW), vWorldPos, uTime);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uSunDir);

    // 真实白天海水：近岸青绿 → 远洋深蓝（蓝白主调，无暖杏）
    float depth = mix(0.2, 1.0, vShore);
    vec3 deep = vec3(0.02, 0.12, 0.28);
    vec3 mid = vec3(0.05, 0.32, 0.55);
    vec3 shallow = vec3(0.18, 0.58, 0.72);
    vec3 water = mix(deep, mid, smoothstep(0.0, 0.5, depth));
    water = mix(water, shallow, smoothstep(0.4, 1.0, depth) * 0.65);

    // Schlick Fresnel（水 IOR≈1.33 → F0≈0.02）
    float F0 = 0.02;
    float ndotv = max(dot(N, V), 0.0);
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - ndotv, 5.0);

    // 天空反射：亮蓝白天
    float skyMix = clamp(N.y * 0.55 + 0.45, 0.0, 1.0);
    vec3 skyZenith = vec3(0.45, 0.72, 0.95);
    vec3 skyHorizon = vec3(0.78, 0.90, 0.98);
    vec3 skyReflect = mix(skyHorizon, skyZenith, skyMix);

    float ndotl = max(dot(N, L), 0.0);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 180.0);
    // 冷白日光高光
    vec3 sunCol = vec3(0.95, 0.98, 1.0);

    // Beer-ish 体积感：槽底略暗
    float trough = smoothstep(0.15, -0.12, vHeight);
    water *= mix(1.0, 0.72, trough);

    vec3 col = water * (0.28 + 0.72 * (0.35 + 0.65 * ndotl));
    col = mix(col, skyReflect, fresnel * 0.92);
    col += sunCol * spec * 1.6;
    col += skyHorizon * fresnel * ndotl * 0.18;

    // 浪尖白沫（蓝白大海的「白」）
    float foamNoise = 0.55 + 0.45 * sin(vWorldPos.x * 9.0 + vWorldPos.z * 7.0 + uTime * 2.4);
    float foam = smoothstep(0.42, 0.88, vFoam) * foamNoise;
    vec3 foamCol = vec3(0.94, 0.97, 1.0);
    col = mix(col, foamCol, foam * 0.82);

    // 近岸略提亮（浅水白沫感）
    col = mix(col, mix(col, foamCol, 0.25), (1.0 - vShore) * 0.08);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDir = normalize(world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
    gl_Position.z = gl_Position.w;
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uSunDir;
  varying vec3 vDir;

  void main() {
    vec3 dir = normalize(vDir);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    // 晴空蓝白：天顶钴蓝 → 地平线近白
    vec3 zenith = vec3(0.22, 0.48, 0.82);
    vec3 mid = vec3(0.48, 0.72, 0.95);
    vec3 horizon = vec3(0.88, 0.94, 0.99);
    vec3 col = mix(horizon, mid, smoothstep(0.15, 0.55, h));
    col = mix(col, zenith, smoothstep(0.45, 0.98, h));

    float sun = max(dot(dir, normalize(uSunDir)), 0.0);
    col += vec3(1.0, 0.99, 0.96) * pow(sun, 420.0) * 2.8;
    col += vec3(0.75, 0.88, 1.0) * pow(sun, 28.0) * 0.45;
    col += vec3(0.55, 0.75, 0.95) * pow(sun, 4.0) * 0.18;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function DaySky({ sunDir }: { sunDir: THREE.Vector3 }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uSunDir: { value: sunDir.clone() } },
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [sunDir],
  );

  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh>
      <sphereGeometry args={[40, 32, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function GerstnerSea({
  sunDir,
  motion,
}: {
  sunDir: THREE.Vector3;
  motion: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(30, 24, 168, 128), []);

  useEffect(() => () => geo.dispose(), [geo]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: motion },
      uSunDir: { value: sunDir.clone() },
    }),
    [sunDir, motion],
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    matRef.current.uniforms.uMotion.value = motion;
  });

  return (
    <mesh
      geometry={geo}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.4, -1.0]}
      frustumCulled={false}
    >
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={SEA_VERT}
        fragmentShader={SEA_FRAG}
      />
    </mesh>
  );
}

function DemandKick({ enabled }: { enabled: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (enabled) invalidate();
  }, [enabled, invalidate]);
  return null;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  // 高位冷日光（白天海面）
  const sunDir = useMemo(() => new THREE.Vector3(0.35, 0.72, -0.55).normalize(), []);
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor("#7eb6e8");
  }, [gl]);

  return (
    <>
      <DemandKick enabled={reducedMotion} />
      <DaySky sunDir={sunDir} />
      <GerstnerSea sunDir={sunDir} motion={reducedMotion ? 0 : 1} />
      <ambientLight intensity={0.55} color="#dceeff" />
      <directionalLight position={[5, 9, -6]} intensity={1.25} color="#f4f8ff" />
    </>
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}


export function SeasideCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const inView = useInViewPause(wrapRef);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        className="h-full w-full"
        dpr={[1, 1.5]}
        frameloop={inView && !reducedMotion ? "always" : "demand"}
        camera={{ position: [0, 2.6, 6.4], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
