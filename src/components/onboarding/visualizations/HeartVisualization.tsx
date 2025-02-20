import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, RootState } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const VisualizationWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: transparent;
`;

interface HeartModelProps {
  isActive: boolean;
  completionPercentage: number;
  pulseRate: number;
}

type GLTFResult = {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
  animations: THREE.AnimationClip[];
};

function HeartModel({ isActive, completionPercentage, pulseRate }: HeartModelProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF('/models/heart.glb') as unknown as GLTFResult;
  const { actions } = useAnimations(animations, group);

  // Split the heart into segments that will be revealed as the user progresses
  const segments = [
    { name: 'aorta', threshold: 20 },
    { name: 'left_atrium', threshold: 40 },
    { name: 'right_atrium', threshold: 60 },
    { name: 'left_ventricle', threshold: 80 },
    { name: 'right_ventricle', threshold: 100 }
  ] as const;

  useEffect(() => {
    if (isActive && actions.pulse) {
      // Play pulse animation when active
      actions.pulse.play();
      actions.pulse.setEffectiveTimeScale(pulseRate);
    } else if (actions.pulse) {
      actions.pulse.stop();
    }
  }, [isActive, pulseRate, actions]);

  useFrame((state: RootState) => {
    if (group.current) {
      // Rotate the heart slowly
      group.current.rotation.y += 0.001;

      // Add subtle floating motion
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {segments.map((segment) => {
        const mesh = nodes[segment.name];
        const material = materials[segment.name];
        
        if (!mesh || !material) return null;

        return (
          <mesh
            key={segment.name}
            geometry={mesh.geometry}
            material={new THREE.MeshStandardMaterial({
              transparent: true,
              opacity: completionPercentage >= segment.threshold ? 1 : 0,
              emissive: new THREE.Color(theme.colors.primary),
              emissiveIntensity: isActive ? 0.5 : 0,
              roughness: material.userData?.roughness ?? 0.5,
              metalness: material.userData?.metalness ?? 0.5,
              color: material.userData?.color ?? theme.colors.primary
            })}
            visible={completionPercentage >= segment.threshold}
            position={[0, 0, 0]}
          />
        );
      })}
      
      {/* Add glowing particles system */}
      <points>
        <sphereGeometry args={[2, 32, 32]} />
        <pointsMaterial
          size={0.05}
          color={theme.colors.primary}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

interface HeartVisualizationProps {
  isActive: boolean;
  completionPercentage: number;
  pulseRate?: number;
}

export const HeartVisualization: React.FC<HeartVisualizationProps> = ({
  isActive,
  completionPercentage,
  pulseRate = 1
}) => {
  return (
    <VisualizationWrapper>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <HeartModel
          isActive={isActive}
          completionPercentage={completionPercentage}
          pulseRate={pulseRate}
        />
      </Canvas>
    </VisualizationWrapper>
  );
};

// Preload the heart model
useGLTF.preload('/models/heart.glb'); 