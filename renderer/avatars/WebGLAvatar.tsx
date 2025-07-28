import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface WebGLAvatarProps {
  mood: 'curious' | 'happy' | 'sad' | 'angry' | 'neutral';
  isSpeaking: boolean;
}

export function WebGLAvatar({ mood, isSpeaking }: WebGLAvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  // Mood-based colors and animations
  const moodConfig = useMemo(() => ({
    curious: { color: '#6366f1', scale: 1.1, rotation: 0.02 },
    happy: { color: '#10b981', scale: 1.2, rotation: 0.03 },
    sad: { color: '#3b82f6', scale: 0.9, rotation: 0.01 },
    angry: { color: '#ef4444', scale: 1.3, rotation: 0.05 },
    neutral: { color: '#8b5cf6', scale: 1.0, rotation: 0.015 }
  }), []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup with glass effect
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(300, 300);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Create glass sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: moodConfig[mood].color,
      transparent: true,
      opacity: 0.3,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.5,
      thickness: 0.5
    });
    const sphere = new THREE.Mesh(sphereGeometry, glassMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    // Create inner core
    const coreGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: moodConfig[mood].color,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Create particle system
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2 + Math.random() * 2;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Add ambient and point lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const moodLight = new THREE.PointLight(moodConfig[mood].color, 0.8, 20);
    moodLight.position.set(-5, 5, 5);
    scene.add(moodLight);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const config = moodConfig[mood];

      // Rotate sphere
      sphere.rotation.x = Math.sin(time * 0.5) * 0.1;
      sphere.rotation.y = time * config.rotation;
      sphere.scale.setScalar(config.scale);

      // Rotate core
      core.rotation.x = time * 0.3;
      core.rotation.y = time * 0.2;

      // Animate particles
      particleSystem.rotation.y = time * 0.1;
      particleSystem.rotation.x = time * 0.05;

      // Speaking animation
      if (isSpeaking) {
        sphere.scale.setScalar(config.scale * 1.1);
        moodLight.intensity = 1.2;
      } else {
        moodLight.intensity = 0.8;
      }

      // Update materials
      glassMaterial.color.setHex(parseInt(moodConfig[mood].color.replace('#', ''), 16));
      coreMaterial.color.setHex(parseInt(moodConfig[mood].color.replace('#', ''), 16));
      moodLight.color.setHex(parseInt(moodConfig[mood].color.replace('#', ''), 16));

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mood, isSpeaking, moodConfig]);

  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        className="w-[300px] h-[300px] rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${moodConfig[mood].color}20 0%, transparent 70%)`,
          boxShadow: `0 0 50px ${moodConfig[mood].color}40`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white drop-shadow-lg">Echo</div>
          <div className="text-sm text-gray-300 capitalize">{mood}</div>
        </div>
      </div>
    </div>
  );
}

export default WebGLAvatar; 