
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LEAF_COUNT, ORNAMENT_COUNT, RIBBON_COUNT, THEME } from '../constants';
import { TreeState } from '../types';

interface ChristmasTreeProps {
  state: TreeState;
  rotationY: number;
}

const ChristmasTree: React.FC<ChristmasTreeProps> = ({ state, rotationY }) => {
  const leafMeshRef = useRef<THREE.InstancedMesh>(null!);
  const ornamentMeshRef = useRef<THREE.InstancedMesh>(null!);
  const ribbonMeshRef = useRef<THREE.InstancedMesh>(null!);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const data = {
      leaves: { tree: [] as THREE.Vector3[], explode: [] as THREE.Vector3[] },
      ornaments: { tree: [] as THREE.Vector3[], explode: [] as THREE.Vector3[] },
      ribbon: { tree: [] as THREE.Vector3[], explode: [] as THREE.Vector3[] }
    };

    const treeHeight = 8;
    const baseRadius = 3.5;
    const tiers = 5;

    const getTieredRadius = (y: number) => {
      const normalizedY = (y + 4) / treeHeight;
      const invY = 1 - normalizedY;
      let radius = invY * baseRadius;
      const tierEffect = Math.pow(Math.sin(normalizedY * Math.PI * tiers), 2) * 0.4 * invY;
      return radius + tierEffect;
    };

    for (let i = 0; i < LEAF_COUNT; i++) {
      const y = Math.random() * treeHeight - 4; 
      const radius = getTieredRadius(y) * (0.8 + Math.random() * 0.4);
      const angle = Math.random() * Math.PI * 2;
      data.leaves.tree.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      data.leaves.explode.push(new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20));
    }

    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      if (i > ORNAMENT_COUNT * 0.95) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.3;
        data.ornaments.tree.push(new THREE.Vector3(Math.cos(angle) * r, 4.2 + Math.random() * 0.5, Math.sin(angle) * r));
      } else {
        const y = Math.random() * treeHeight - 3.8;
        const radius = getTieredRadius(y) * 1.05;
        const angle = Math.random() * Math.PI * 2;
        data.ornaments.tree.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      }
      data.ornaments.explode.push(new THREE.Vector3((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25));
    }

    for (let i = 0; i < RIBBON_COUNT; i++) {
      const t = i / RIBBON_COUNT;
      const angle = t * Math.PI * 2 * 4;
      const y = t * treeHeight - 4;
      const radius = getTieredRadius(y) * 1.1;
      data.ribbon.tree.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      data.ribbon.explode.push(new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15));
    }

    return data;
  }, []);

  const currentPositions = useRef({
    leaves: positions.leaves.explode.map(p => p.clone()),
    ornaments: positions.ornaments.explode.map(p => p.clone()),
    ribbon: positions.ribbon.explode.map(p => p.clone())
  });

  useFrame((stateObj, delta) => {
    const isSending = state === TreeState.SENDING;
    const isTree = state === TreeState.TREE || isSending;
    const lerpFactor = isSending ? delta * 5.0 : delta * 3.0;
    const time = stateObj.clock.getElapsedTime();

    const updateMesh = (mesh: THREE.InstancedMesh, targets: THREE.Vector3[], currents: THREE.Vector3[], count: number, scaleFactor: number = 1, isRibbon: boolean = false) => {
      for (let i = 0; i < count; i++) {
        const target = targets[i].clone();
        
        if (isSending && isRibbon) {
          // Rapid upward spiral animation
          const t = i / count;
          const spiralSpeed = 12;
          const upwardSpeed = 10;
          const angle = (t * Math.PI * 2 * 4) + (time * spiralSpeed);
          const y = ((t * 8 - 4) + (time * upwardSpeed)) % 12 - 6; 
          const radius = Math.max(0.1, (4 - y) * 0.4);
          target.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        } else if (isTree) {
          target.x += Math.sin(time + i) * 0.02;
          target.z += Math.cos(time + i) * 0.02;
        }

        currents[i].lerp(target, lerpFactor);
        dummy.position.copy(currents[i]);
        
        // tech rotation
        const rotSpeed = isSending && isRibbon ? 10 : 0.1;
        dummy.rotation.set(
          currents[i].x * 0.1,
          currents[i].y * 0.1 + rotationY + (isRibbon ? time * rotSpeed : 0),
          currents[i].z * 0.1
        );
        
        const s = isTree ? scaleFactor : scaleFactor * 0.4;
        dummy.scale.set(s, s, s);
        if (isSending && isRibbon) dummy.scale.multiplyScalar(1.5); // Glow larger when sending

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };

    updateMesh(leafMeshRef.current, isTree ? positions.leaves.tree : positions.leaves.explode, currentPositions.current.leaves, LEAF_COUNT, 0.14);
    updateMesh(ornamentMeshRef.current, isTree ? positions.ornaments.tree : positions.ornaments.explode, currentPositions.current.ornaments, ORNAMENT_COUNT, 0.14);
    updateMesh(ribbonMeshRef.current, isTree ? positions.ribbon.tree : positions.ribbon.explode, currentPositions.current.ribbon, RIBBON_COUNT, 0.035, true);
  });

  return (
    <group>
      <instancedMesh ref={leafMeshRef} args={[undefined, undefined, LEAF_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={THEME.leafGreen} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={THEME.leafEmerald} 
          emissiveIntensity={state === TreeState.SENDING ? 1.5 : 0.8}
        />
      </instancedMesh>
      <instancedMesh ref={ornamentMeshRef} args={[undefined, undefined, ORNAMENT_COUNT]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={THEME.ornamentWhite} 
          metalness={1} 
          roughness={0} 
          envMapIntensity={2.5}
          emissive="#00ff00"
          emissiveIntensity={state === TreeState.SENDING ? 2 : 0.1}
        />
      </instancedMesh>
      <instancedMesh ref={ribbonMeshRef} args={[undefined, undefined, RIBBON_COUNT]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={state === TreeState.SENDING ? "#00ff41" : "#ccffcc"} 
          emissiveIntensity={state === TreeState.SENDING ? 10 : 3} 
          transparent 
          opacity={0.9} 
        />
      </instancedMesh>
    </group>
  );
};

export default ChristmasTree;
