import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { COLUNAS, NIVEIS, RUAS, corOcupacao, type Posicao } from "@/lib/armazem";

export default function Armazem3D({
  posicoes, selecionada, onSelect,
}: { posicoes: Posicao[]; selecionada?: string | undefined; onSelect: (id: string) => void }) {
  return (
    <div className="h-[460px] w-full" data-scene-ready>
      <Canvas camera={{ position: [14, 12, 16], fov: 45 }}>
        <color attach="background" args={["#0f1115"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 8]} intensity={1.2} />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
          <planeGeometry args={[40, 30]} />
          <meshStandardMaterial color="#1b1f27" />
        </mesh>
        <gridHelper args={[40, 40, "#3a3f4a", "#262a33"]} />
        {RUAS.map((rua, r) => {
          const z = (r - (RUAS.length - 1) / 2) * 4;
          return (
            <group key={rua}>
              <Text position={[-(COLUNAS * 1.2) / 2 - 1.2, 0.6, z]} fontSize={0.8} color="#f59e0b">
                {rua}
              </Text>
              {/* montantes */}
              {[0, COLUNAS].map((c) => (
                <mesh key={c} position={[(c - COLUNAS / 2) * 1.2, (NIVEIS * 1.1) / 2, z]}>
                  <boxGeometry args={[0.08, NIVEIS * 1.1, 1.2]} />
                  <meshStandardMaterial color="#6b7280" />
                </mesh>
              ))}
            </group>
          );
        })}
        {posicoes.map((p) => {
          const r = RUAS.indexOf(p.rua);
          const x = (p.coluna - 0.5 - COLUNAS / 2) * 1.2;
          const y = (p.nivel - 1) * 1.1;
          const z = (r - (RUAS.length - 1) / 2) * 4;
          const h = p.ocupacao ? 0.25 + (p.ocupacao / 100) * 0.7 : 0.04;
          const sel = p.id === selecionada;
          return (
            <group key={p.id}>
              <mesh position={[x, y + 0.02, z]}>
                <boxGeometry args={[1.15, 0.04, 1.2]} />
                <meshStandardMaterial color="#9ca3af" />
              </mesh>
              <mesh
                position={[x, y + 0.04 + h / 2, z]}
                onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}
              >
                <boxGeometry args={[1, h, 1]} />
                <meshStandardMaterial
                  color={sel ? "#e5e7eb" : corOcupacao(p.ocupacao)}
                  emissive={sel ? "#f59e0b" : "#000000"}
                  emissiveIntensity={sel ? 0.5 : 0}
                  transparent={!p.ocupacao}
                  opacity={p.ocupacao ? 1 : 0.4}
                />
              </mesh>
            </group>
          );
        })}
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
    </div>
  );
}
