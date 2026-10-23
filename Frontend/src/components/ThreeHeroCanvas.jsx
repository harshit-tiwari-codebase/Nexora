import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ThreeHeroCanvas: An interactive 3D WebGL background using Three.js
 * featuring an animated cybernetic icosahedron core surrounded by
 * glowing crimson and slate particle constellations.
 *
 * Uses the exact brand palette:
 * #070B0D (Base), #DB2D28 (Crimson), #A41715 (Ruby), #6D7C83 (Slate), #41494F (Charcoal)
 */
const ThreeHeroCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    let isVisible = true;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Central Geometric Object (Icosahedron Core with Crimson Glow)
    const coreGeometry = new THREE.IcosahedronGeometry(7.5, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xDB2D28, // Crimson Red
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner Glowing Ring/Torus
    const innerGeometry = new THREE.TorusGeometry(5, 0.15, 16, 64);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xA41715, // Deep Ruby
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const innerRing = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerRing);

    // 4. Particle Constellation System (Embers & Synapse Nodes)
    const particleCount = 700;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorCrimson = new THREE.Color(0xDB2D28);
    const colorSlate = new THREE.Color(0x6D7C83);
    const colorRuby = new THREE.Color(0xA41715);

    for (let i = 0; i < particleCount; i++) {
      const radius = 10 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Randomly assign crimson or slate color
      const mixRatio = Math.random();
      const chosenColor = mixRatio > 0.6 ? colorCrimson : mixRatio > 0.3 ? colorRuby : colorSlate;

      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 5. Mouse Parallax Reaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) * 0.0008;
      mouseY = (event.clientY - windowHalfY) * 0.0008;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 6. Resize handling
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // 7. Intersection Observer to pause rendering when off-screen (Best Practice)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotate central meshes
      coreMesh.rotation.y = elapsedTime * 0.12 + targetX;
      coreMesh.rotation.x = elapsedTime * 0.08 + targetY;

      innerRing.rotation.x = elapsedTime * 0.18;
      innerRing.rotation.y = elapsedTime * 0.14;

      // Rotate particle cloud gently
      particleSystem.rotation.y = elapsedTime * 0.03 + targetX * 0.5;
      particleSystem.rotation.x = -elapsedTime * 0.02 + targetY * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();

      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
};

export default ThreeHeroCanvas;
