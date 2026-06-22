import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import './Reading.css';
import './ThreeD.css';

type Props = { topicId?: string };

const ThreeD: React.FC<Props> = ({ topicId = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x081734);

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 0.8));

    // sample geometry: rotating cube
    const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const material = new THREE.MeshStandardMaterial({ color: 0xff8c42, metalness: 0.2, roughness: 0.6 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x071431, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.75;
    scene.add(ground);

    let rafId: number;
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      cube.rotation.y += 0.01;
      cube.rotation.x += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="readingRoot threeRoot">
      <button className="readingBack" onClick={() => navigate(-1)}>← Kembali</button>
      <div className="readingInner">
        <div className="readingRight fullWidth">
          <div className="readingHeader">
            <h1 className="readingTitle">3D: {topicId || 'Topik'}</h1>
            <p className="readingMeta">Model 3D dan eksplorasi</p>
          </div>

          <article className="readingCard">
            <div className="threeWrap">
              <div ref={mountRef} className="threeMount" />
            </div>

            <h3>Kontrol</h3>
            <p>Drag untuk memutar, scroll untuk zoom, klik kanan untuk pan. Ini template sederhana menggunakan three.js.</p>
          </article>
        </div>
      </div>
    </div>
  );
};

export default ThreeD;
