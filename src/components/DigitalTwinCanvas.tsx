import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarConfig, ExerciseType, PoseKeypoints } from '../types';

interface DigitalTwinCanvasProps {
  avatarConfig: AvatarConfig;
  exercise?: ExerciseType;
  poseKeypoints?: PoseKeypoints | null;
  interactive?: boolean;
  wireframeOnly?: boolean;
  showPedestal?: boolean;
  mirrorUser?: boolean;
  className?: string;
  zoom?: number;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  avatarConfig,
  exercise = 'squats',
  poseKeypoints,
  interactive = true,
  showPedestal = true,
  mirrorUser = false,
  className = 'w-full h-full min-h-[300px]',
  zoom = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const limbsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const particlesRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);

  // Theme color hex map
  const colorMap = {
    cyan: 0x06b6d4,
    violet: 0xa855f7,
    emerald: 0x10b981,
    amber: 0xf59e0b,
  };

  const currentThemeColor = colorMap[avatarConfig.colorTheme] || 0x06b6d4;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.3, 3.2 / zoom);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if ('xr' in renderer) {
      renderer.xr.enabled = true;
    }
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(currentThemeColor, 3, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x3b82f6, 2, 10);
    backLight.position.set(0, 1, -2);
    scene.add(backLight);

    // Holographic Pedestal
    if (showPedestal) {
      const ringsGroup = new THREE.Group();
      const ringGeo1 = new THREE.RingGeometry(0.8, 0.85, 48);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: currentThemeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.y = -0.01;
      ringsGroup.add(ring1);

      const ringGeo2 = new THREE.RingGeometry(1.05, 1.1, 48);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: currentThemeColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = -0.01;
      ringsGroup.add(ring2);

      // Disc grid
      const gridHelper = new THREE.PolarGridHelper(1.2, 8, 4, 32, currentThemeColor, 0x1e293b);
      gridHelper.position.y = 0;
      ringsGroup.add(gridHelper);

      scene.add(ringsGroup);
      ringsRef.current = ringsGroup;
    }

    // Holographic Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2.5;
      positions[i + 1] = Math.random() * 2.8;
      positions[i + 2] = (Math.random() - 0.5) * 2.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: currentThemeColor,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Build Rigged Hologram Avatar
    const avatarGroup = new THREE.Group();
    avatarGroupRef.current = avatarGroup;

    // Materials
    const isWire = avatarConfig.renderStyle === 'wireframe';
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: currentThemeColor,
      wireframe: isWire,
      transparent: true,
      opacity: isWire ? 0.75 : 0.85,
      roughness: 0.2,
      metalness: 0.8,
      emissive: currentThemeColor,
      emissiveIntensity: 0.35,
    });

    const jointMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: false,
    });

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: currentThemeColor,
      transparent: true,
      opacity: 0.9,
    });

    const limbs: { [key: string]: THREE.Object3D } = {};

    // Base Pelvis
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 1.0, 0);
    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.15, 8), mainMaterial);
    pelvis.add(pelvisMesh);
    avatarGroup.add(pelvis);
    limbs.pelvis = pelvis;

    // Spine & Chest
    const spine = new THREE.Group();
    spine.position.set(0, 0.1, 0);
    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.22), mainMaterial);
    chestMesh.position.y = 0.22;
    spine.add(chestMesh);

    // Glowing Hologram Core (Reactor)
    const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), coreMaterial);
    coreMesh.position.set(0, 0.24, 0.12);
    spine.add(coreMesh);
    pelvis.add(spine);
    limbs.spine = spine;

    // Neck & Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.44, 0);
    const headMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), mainMaterial);
    headGroup.add(headMesh);

    // Visor bar
    const visorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    visorMesh.position.set(0, 0.02, 0.1);
    headGroup.add(visorMesh);

    // Halo ring
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.012, 8, 24),
      new THREE.MeshBasicMaterial({ color: currentThemeColor })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.2;
    headGroup.add(halo);
    spine.add(headGroup);
    limbs.head = headGroup;

    // Left Arm
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(0.26, 0.34, 0);
    const leftShoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), jointMaterial);
    leftShoulder.add(leftShoulderJoint);

    const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), mainMaterial);
    leftUpperArm.position.y = -0.12;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.24, 0);
    const leftElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), jointMaterial);
    leftElbow.add(leftElbowJoint);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.24, 8), mainMaterial);
    leftForearm.position.y = -0.12;
    leftElbow.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), mainMaterial);
    leftHand.position.y = -0.26;
    leftElbow.add(leftHand);

    leftShoulder.add(leftElbow);
    spine.add(leftShoulder);
    limbs.leftShoulder = leftShoulder;
    limbs.leftElbow = leftElbow;

    // Right Arm
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(-0.26, 0.34, 0);
    const rightShoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), jointMaterial);
    rightShoulder.add(rightShoulderJoint);

    const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.24, 8), mainMaterial);
    rightUpperArm.position.y = -0.12;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.24, 0);
    const rightElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), jointMaterial);
    rightElbow.add(rightElbowJoint);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.24, 8), mainMaterial);
    rightForearm.position.y = -0.12;
    rightElbow.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), mainMaterial);
    rightHand.position.y = -0.26;
    rightElbow.add(rightHand);

    rightShoulder.add(rightElbow);
    spine.add(rightShoulder);
    limbs.rightShoulder = rightShoulder;
    limbs.rightElbow = rightElbow;

    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(0.12, -0.08, 0);
    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.4, 8), mainMaterial);
    leftThigh.position.y = -0.2;
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.4, 0);
    const leftKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), jointMaterial);
    leftKnee.add(leftKneeJoint);

    const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 8), mainMaterial);
    leftShin.position.y = -0.21;
    leftKnee.add(leftShin);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.16), mainMaterial);
    leftFoot.position.set(0, -0.42, 0.05);
    leftKnee.add(leftFoot);

    leftHip.add(leftKnee);
    pelvis.add(leftHip);
    limbs.leftHip = leftHip;
    limbs.leftKnee = leftKnee;

    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(-0.12, -0.08, 0);
    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.4, 8), mainMaterial);
    rightThigh.position.y = -0.2;
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.4, 0);
    const rightKneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), jointMaterial);
    rightKnee.add(rightKneeJoint);

    const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 8), mainMaterial);
    rightShin.position.y = -0.21;
    rightKnee.add(rightShin);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.16), mainMaterial);
    rightFoot.position.set(0, -0.42, 0.05);
    rightKnee.add(rightFoot);

    rightHip.add(rightKnee);
    pelvis.add(rightHip);
    limbs.rightHip = rightHip;
    limbs.rightKnee = rightKnee;

    scene.add(avatarGroup);
    limbsRef.current = limbs;

    // Mouse rotation interaction
    let isDragging = false;
    let previousMouseX = 0;
    let targetRotationY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDragging = true;
      previousMouseX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !interactive) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = clientX - previousMouseX;
      previousMouseX = clientX;
      targetRotationY += delta * 0.01;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth rotation
      if (avatarGroupRef.current) {
        avatarGroupRef.current.rotation.y += (targetRotationY - avatarGroupRef.current.rotation.y) * 0.1;
      }

      // Rotate Pedestal rings
      if (ringsRef.current) {
        ringsRef.current.rotation.y += 0.005;
      }

      // Float particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += delta * 0.2;
          if (positions[i] > 2.8) positions[i] = 0;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Avatar based on exercise demo or pose mirror
      const limbsObj = limbsRef.current;
      if (limbsObj.pelvis && limbsObj.spine && limbsObj.leftShoulder && limbsObj.rightShoulder) {
        if (mirrorUser && poseKeypoints) {
          // Direct real-time joint mirroring from pose detector
          const leftArmAngle = Math.atan2(
            poseKeypoints.leftWrist.y - poseKeypoints.leftElbow.y,
            poseKeypoints.leftWrist.x - poseKeypoints.leftElbow.x
          );
          const rightArmAngle = Math.atan2(
            poseKeypoints.rightWrist.y - poseKeypoints.rightElbow.y,
            poseKeypoints.rightWrist.x - poseKeypoints.rightElbow.x
          );

          limbsObj.leftShoulder.rotation.z = -(poseKeypoints.leftElbow.y - poseKeypoints.leftShoulder.y) * 2;
          limbsObj.rightShoulder.rotation.z = (poseKeypoints.rightElbow.y - poseKeypoints.rightShoulder.y) * 2;
          limbsObj.leftElbow.rotation.x = Math.max(0, (0.8 - poseKeypoints.leftWrist.y) * 2.5);
          limbsObj.rightElbow.rotation.x = Math.max(0, (0.8 - poseKeypoints.rightWrist.y) * 2.5);

          // Knee bend
          const kneeBend = Math.max(0, (poseKeypoints.leftKnee.y - 0.6) * 3);
          limbsObj.leftHip.rotation.x = -kneeBend * 0.6;
          limbsObj.rightHip.rotation.x = -kneeBend * 0.6;
          limbsObj.leftKnee.rotation.x = kneeBend * 1.1;
          limbsObj.rightKnee.rotation.x = kneeBend * 1.1;
          limbsObj.pelvis.position.y = 1.0 - kneeBend * 0.25;
        } else {
          // Procedural holographic trainer exercise demo
          if (exercise === 'squats') {
            const p = Math.sin(time * 2) * 0.5 + 0.5; // 0 (up) to 1 (down)
            limbsObj.pelvis.position.y = 1.0 - p * 0.32;
            limbsObj.spine.rotation.x = p * 0.35; // torso lean
            limbsObj.leftHip.rotation.x = -p * 1.3;
            limbsObj.rightHip.rotation.x = -p * 1.3;
            limbsObj.leftKnee.rotation.x = p * 1.85;
            limbsObj.rightKnee.rotation.x = p * 1.85;
            // Arms forward for balance
            limbsObj.leftShoulder.rotation.x = -p * 1.3;
            limbsObj.rightShoulder.rotation.x = -p * 1.3;
          } else if (exercise === 'bicep_curls') {
            const p = Math.sin(time * 2.5) * 0.5 + 0.5; // 0 to 1
            limbsObj.pelvis.position.y = 1.0 + Math.sin(time * 1.5) * 0.01;
            limbsObj.leftShoulder.rotation.x = 0;
            limbsObj.rightShoulder.rotation.x = 0;
            limbsObj.leftElbow.rotation.x = p * 2.1;
            limbsObj.rightElbow.rotation.x = p * 2.1;
            limbsObj.leftHip.rotation.x = 0;
            limbsObj.rightHip.rotation.x = 0;
            limbsObj.leftKnee.rotation.x = 0;
            limbsObj.rightKnee.rotation.x = 0;
          } else if (exercise === 'shoulder_press') {
            const p = Math.sin(time * 2) * 0.5 + 0.5;
            limbsObj.pelvis.position.y = 1.0;
            limbsObj.leftShoulder.rotation.z = Math.PI / 2 - (1 - p) * 0.3;
            limbsObj.rightShoulder.rotation.z = -(Math.PI / 2 - (1 - p) * 0.3);
            limbsObj.leftShoulder.rotation.x = p * 0.4;
            limbsObj.rightShoulder.rotation.x = p * 0.4;
            limbsObj.leftElbow.rotation.z = (1 - p) * 1.4;
            limbsObj.rightElbow.rotation.z = -(1 - p) * 1.4;
          } else if (exercise === 'warrior_pose') {
            // Static warrior pose with subtle breathing
            limbsObj.pelvis.position.y = 0.88 + Math.sin(time * 1.5) * 0.015;
            limbsObj.leftHip.rotation.x = -0.8;
            limbsObj.leftKnee.rotation.x = 1.5;
            limbsObj.rightHip.rotation.x = 0.4;
            limbsObj.rightKnee.rotation.x = 0.1;
            limbsObj.leftShoulder.rotation.z = Math.PI / 2;
            limbsObj.rightShoulder.rotation.z = -Math.PI / 2;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
    };
  }, [avatarConfig.colorTheme, avatarConfig.renderStyle, currentThemeColor, exercise, interactive, mirrorUser, poseKeypoints, showPedestal, zoom]);

  return (
    <div
      ref={containerRef}
      className={`relative cursor-grab active:cursor-grabbing select-none overflow-hidden ${className}`}
    />
  );
};
