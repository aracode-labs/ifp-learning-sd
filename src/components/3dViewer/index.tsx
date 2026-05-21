import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OrbitControls } from 'three-stdlib';
import styles from './3dViewer.module.css';

interface Props3dViewer {
  /** URL path to 3D model (GLB/GLTF format) */
  modelUrl: string;
  /** Enable auto rotation */
  autoRotate?: boolean;
  /** Camera zoom level */
  zoom?: number;
  /** Background color */
  bgColor?: string;
  /** Allow user to rotate model */
  allowRotation?: boolean;
  /** Allow user to zoom */
  allowZoom?: boolean;
}

export const Viewer3D: React.FC<Props3dViewer> = ({
  modelUrl,
  autoRotate = true,
  zoom = 1,
  bgColor = '#f0f0f0',
  allowRotation = true,
  allowZoom = true,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 4;
    controls.enableRotate = allowRotation;
    controls.enableZoom = allowZoom;
    controls.enablePan = allowRotation;
    controlsRef.current = controls;

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: any) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        scene.add(model);
        modelRef.current = model;

        // Auto-center and adjust camera
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5;

        camera.position.z = cameraZ;
        controls.target.copy(box.getCenter(new THREE.Vector3()));
        controls.update();
      },
      (progress: any) => {
        // Optional: handle loading progress
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`Loading model: ${percentComplete}%`);
      },
      (error: any) => {
        console.error('Error loading model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (renderer.domElement && canvasRef.current?.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [modelUrl, autoRotate, bgColor, allowRotation, allowZoom, zoom]);

  return <div ref={canvasRef} className={styles.container} />;
};

export default Viewer3D;
