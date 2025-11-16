import type React from "react";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type FC, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import { ArrowRight, Bell, Clock, FileText, LayoutDashboard, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

type UniformValue = THREE.IUniform<unknown> | unknown;

interface ExtendMaterialConfig {
  header: string;
  vertexHeader?: string;
  fragmentHeader?: string;
  material?: THREE.MeshPhysicalMaterialParameters & { fog?: boolean };
  uniforms?: Record<string, UniformValue>;
  vertex?: Record<string, string>;
  fragment?: Record<string, string>;
}

type ShaderWithDefines = THREE.ShaderLibShader & {
  defines?: Record<string, string | number | boolean>;
};

function extendMaterial<T extends THREE.Material = THREE.Material>(
  BaseMaterial: new (params?: THREE.MaterialParameters) => T,
  cfg: ExtendMaterialConfig,
): THREE.ShaderMaterial {
  const physical = THREE.ShaderLib.physical as ShaderWithDefines;
  const { vertexShader: baseVert, fragmentShader: baseFrag, uniforms: baseUniforms } = physical;
  const baseDefines = physical.defines ?? {};

  const uniforms: Record<string, THREE.IUniform> = THREE.UniformsUtils.clone(baseUniforms);

  const defaults = new BaseMaterial(cfg.material || {}) as T & {
    color?: THREE.Color;
    roughness?: number;
    metalness?: number;
    envMap?: THREE.Texture;
    envMapIntensity?: number;
  };

  if (defaults.color) uniforms.diffuse.value = defaults.color;
  if ("roughness" in defaults) uniforms.roughness.value = defaults.roughness;
  if ("metalness" in defaults) uniforms.metalness.value = defaults.metalness;
  if ("envMap" in defaults) uniforms.envMap.value = defaults.envMap;
  if ("envMapIntensity" in defaults) uniforms.envMapIntensity.value = defaults.envMapIntensity;

  Object.entries(cfg.uniforms ?? {}).forEach(([key, u]) => {
    uniforms[key] =
      u !== null && typeof u === "object" && "value" in u
        ? (u as THREE.IUniform<unknown>)
        : ({ value: u } as THREE.IUniform<unknown>);
  });

  let vert = `${cfg.header}\n${cfg.vertexHeader ?? ""}\n${baseVert}`;
  let frag = `${cfg.header}\n${cfg.fragmentHeader ?? ""}\n${baseFrag}`;

  for (const [inc, code] of Object.entries(cfg.vertex ?? {})) {
    vert = vert.replace(inc, `${inc}\n${code}`);
  }

  for (const [inc, code] of Object.entries(cfg.fragment ?? {})) {
    frag = frag.replace(inc, `${inc}\n${code}`);
  }

  const mat = new THREE.ShaderMaterial({
    defines: { ...baseDefines },
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    lights: true,
    fog: !!cfg.material?.fog,
  });

  return mat;
}

const CanvasWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <Canvas dpr={[1, 2]} frameloop="always" className="relative h-full w-full">
    {children}
  </Canvas>
);

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.substring(0, 2), 16);
  const g = Number.parseInt(clean.substring(2, 4), 16);
  const b = Number.parseInt(clean.substring(4, 6), 16);
  return [r / 255, g / 255, b / 255];
};

const noise = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

interface BeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
  noiseIntensity?: number;
  scale?: number;
  rotation?: number;
}

function createStackedPlanesBufferGeometry(
  n: number,
  width: number,
  height: number,
  spacing: number,
  heightSegments: number,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const numVertices = n * (heightSegments + 1) * 2;
  const numFaces = n * heightSegments * 2;
  const positions = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(numFaces * 3);
  const uvs = new Float32Array(numVertices * 2);

  let vertexOffset = 0;
  let indexOffset = 0;
  let uvOffset = 0;

  const totalWidth = n * width + (n - 1) * spacing;
  const xOffsetBase = -totalWidth / 2;

  for (let i = 0; i < n; i++) {
    const xOffset = xOffsetBase + i * (width + spacing);
    const uvXOffset = Math.random() * 300;
    const uvYOffset = Math.random() * 300;

    for (let j = 0; j <= heightSegments; j++) {
      const y = height * (j / heightSegments - 0.5);

      const v0 = [xOffset, y, 0];
      const v1 = [xOffset + width, y, 0];

      positions.set([...v0, ...v1], vertexOffset * 3);

      const uvY = j / heightSegments;
      uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset);

      if (j < heightSegments) {
        const a = vertexOffset;
        const b = vertexOffset + 1;
        const c = vertexOffset + 2;
        const d = vertexOffset + 3;

        indices.set([a, b, c, c, b, d], indexOffset);
        indexOffset += 6;
      }

      vertexOffset += 2;
      uvOffset += 4;
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  return geometry;
}

const MergedPlanes = forwardRef<
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>,
  {
    material: THREE.ShaderMaterial;
    width: number;
    count: number;
    height: number;
  }
>(({ material, width, count, height }, ref) => {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null!);
  useImperativeHandle(ref, () => mesh.current);

  const geometry = useMemo(
    () => createStackedPlanesBufferGeometry(count, width, height, 0, 100),
    [count, width, height],
  );

  useFrame((_, delta) => {
    mesh.current.material.uniforms.time.value += 0.1 * delta;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
});

MergedPlanes.displayName = "MergedPlanes";

const PlaneNoise = forwardRef<
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>,
  {
    material: THREE.ShaderMaterial;
    width: number;
    count: number;
    height: number;
  }
>((props, ref) => (
  <MergedPlanes ref={ref} material={props.material} width={props.width} count={props.count} height={props.height} />
));

PlaneNoise.displayName = "PlaneNoise";

const DirLight: FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const dir = useRef<THREE.DirectionalLight>(null!);

  useEffect(() => {
    if (!dir.current) return;

    const cam = dir.current.shadow.camera as THREE.Camera & {
      top: number;
      bottom: number;
      left: number;
      right: number;
      far: number;
    };

    cam.top = 24;
    cam.bottom = -24;
    cam.left = -24;
    cam.right = 24;
    cam.far = 64;
    dir.current.shadow.bias = -0.004;
  }, []);

  return <directionalLight ref={dir} color={color} intensity={1} position={position} />;
};

const Beams: FC<BeamsProps> = ({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 12,
  lightColor = "#ffffff",
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0,
}) => {
  const meshRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null!);

  const beamMaterial = useMemo(
    () =>
      extendMaterial(THREE.MeshStandardMaterial, {
        header: `
  varying vec3 vEye;
  varying float vNoise;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform float uSpeed;
  uniform float uNoiseIntensity;
  uniform float uScale;
  ${noise}`,
        vertexHeader: `
  float getPos(vec3 pos) {
    vec3 noisePos =
      vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
    return cnoise(noisePos);
  }

  vec3 getCurrentPos(vec3 pos) {
    vec3 newpos = pos;
    newpos.z += getPos(pos);
    return newpos;
  }

  vec3 getNormal(vec3 pos) {
    vec3 curpos = getCurrentPos(pos);
    vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
    vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
    vec3 tangentX = normalize(nextposX - curpos);
    vec3 tangentZ = normalize(nextposZ - curpos);
    return normalize(cross(tangentZ, tangentX));
  }`,
        fragmentHeader: "",
        vertex: {
          "#include <begin_vertex>": `transformed.z += getPos(transformed.xyz);`,
          "#include <beginnormal_vertex>": `objectNormal = getNormal(position.xyz);`,
        },
        fragment: {
          "#include <dithering_fragment>": `
    float randomNoise = noise(gl_FragCoord.xy);
    gl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;`,
        },
        material: { fog: true },
        uniforms: {
          diffuse: new THREE.Color(...hexToNormalizedRGB("#000000")),
          time: { shared: true, mixed: true, linked: true, value: 0 },
          roughness: 0.3,
          metalness: 0.3,
          uSpeed: { shared: true, mixed: true, linked: true, value: speed },
          envMapIntensity: 10,
          uNoiseIntensity: noiseIntensity,
          uScale: scale,
        },
      }),
    [speed, noiseIntensity, scale],
  );

  return (
    <CanvasWrapper>
      <group rotation={[0, 0, degToRad(rotation)]}>
        <PlaneNoise ref={meshRef} material={beamMaterial} count={beamNumber} width={beamWidth} height={beamHeight} />
        <DirLight color={lightColor} position={[0, 3, 10]} />
      </group>
      <ambientLight intensity={1} />
      <color attach="background" args={["#050106"]} />
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
    </CanvasWrapper>
  );
};

const GlowCard: FC<
  React.PropsWithChildren<{
    title: string;
    icon: React.ReactNode;
    description: string;
  }>
> = ({ title, icon, description, children }) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/5 p-[1px] shadow-[0_0_40px_rgba(239,68,68,0.35)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.5),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(248,113,113,0.3),_transparent_60%)] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 h-full rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-black/80 via-black/90 to-black/95 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(248,113,113,0.6)]">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-red-50/80">{description}</p>
        {children}
      </div>
    </div>
  );
};

const Landing: FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 -z-20">
        <Beams
          beamWidth={2.5}
          beamHeight={18}
          beamNumber={15}
          lightColor="#fecaca"
          speed={2.2}
          noiseIntensity={2}
          scale={0.18}
          rotation={38}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-black/10" />

      <header className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-red-200/80">Solution de gestion</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-white">LORD</span>
              <span className="text-xl font-semibold tracking-tight text-red-400">BÂTIMENT</span>
            </div>
            <p className="text-xs text-red-100/70">L&apos;Excellence Appart</p>
          </div>

          <div className="flex-1" />
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative flex min-h-[calc(100vh-5rem)] items-center">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 lg:px-8 lg:py-24">
            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200/20 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-red-100/80 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
                Solution professionnelle pour promoteurs
              </div>

              <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Moins de relances,
                <br />
                <span className="bg-gradient-to-r from-red-200 via-red-400 to-red-300 bg-clip-text text-transparent">
                  plus de chantiers livrés
                </span>
                <br />
                à l&apos;heure.
              </h1>

              <p className="mb-8 mx-auto max-w-xl text-base leading-relaxed text-red-50/80 sm:text-lg">
                Un cockpit unique pour suivre vos chantiers, centraliser les informations et automatiser les relances de
                vos prestataires. Vous gardez la maîtrise sans tout porter sur vos épaules.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/login">
                  <ShimmerButton
                    shimmerColor="#fee2e2"
                    background="linear-gradient(135deg, rgba(248,113,113,1), rgba(220,38,38,1))"
                    className="px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em]"
                  >
                    Découvrir l&apos;application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </Link>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 text-center mx-auto">
                <div>
                  <p className="text-2xl font-semibold text-white">+40%</p>
                  <p className="text-xs text-red-100/80">de visibilité sur vos chantiers</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">-60%</p>
                  <p className="text-xs text-red-100/80">de temps passé à relancer</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">24/7</p>
                  <p className="text-xs text-red-100/80">suivi centralisé et partagé</p>
          </div>
        </div>
              {/* Cards sous le texte principal */}
              <div className="relative mt-12">
                <div className="absolute inset-0 -z-10 opacity-40">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/40 to-transparent"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(248, 113, 113, 0.2) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(248, 113, 113, 0.2) 1px, transparent 1px)
                      `,
                      backgroundSize: "40px 40px",
                    }}
                  />
                </div>

                <div className="relative grid gap-6 md:grid-cols-2">
                  <GlowCard
                    title="Vos relances prestataires"
                    icon={<Bell className="h-5 w-5" />}
                    description="Visualisez immédiatement quelles relances sont à envoyer, avec les bons canaux et les bons messages."
                  >
                    <p className="mt-2 text-xs text-red-100/70">
                      E-mails, SMS et appels structurés, tous orchestrés depuis un seul écran.
                    </p>
                  </GlowCard>

                  <GlowCard
                    title="Détail de chaque chantier"
                    icon={<LayoutDashboard className="h-5 w-5" />}
                    description="Une fiche claire par chantier : lots, prestataires, avancement, documents et risques."
                  >
                    <p className="mt-2 text-xs text-red-100/70">
                      Vous savez à tout moment où en est chaque intervenant, sans courir après l&apos;information.
                    </p>
                  </GlowCard>

                  <GlowCard
                    title="Relances planifiées"
                    icon={<Clock className="h-5 w-5" />}
                    description="Des modèles de relances prêts à l&apos;emploi qui se déclenchent en quelques clics."
                  >
                    <p className="mt-2 text-xs text-red-100/70">
                      Vous fixez les règles, la plateforme vous rappelle quoi faire et quand.
                    </p>
                  </GlowCard>

                  <GlowCard
                    title="Documents centralisés"
                    icon={<FileText className="h-5 w-5" />}
                    description="Devis, PV, factures : tout est rangé au bon endroit, accessible à l&apos;équipe."
                  >
                    <p className="mt-2 text-xs text-red-100/70">
                      Fini les dossiers éparpillés entre mails, drives et Excel.
                    </p>
                  </GlowCard>
                </div>
          </div>
          </div>
        </div>
      </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/80 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-red-100/70 sm:flex-row lg:px-8">
          <p>
            Prototype conçu avec soin par <span className="font-semibold text-red-200">Adimi Agency</span>.
          </p>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
            <span className="h-1 w-1 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]" />
            Pilotage centralisé · Relances automatisées · Chantiers livrés à l&apos;heure
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

