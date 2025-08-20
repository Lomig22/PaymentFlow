import { useEffect, useRef } from "react";
// @ts-ignore
import * as THREE from "three";

export default function ReminderBarChart({ data }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / 300,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, 300);
    mount.appendChild(renderer.domElement);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10).normalize();
    scene.add(light);

    // Bars
    const reminderSteps = ["first", "second", "third", "final", "legal"];
    const colors = [0x4f46e5, 0x10b981, 0xf59e0b, 0xef4444, 0x6b7280];

    reminderSteps.forEach((step, i) => {
      const height = data[step];
      const geometry = new THREE.BoxGeometry(1, height, 1);
      const material = new THREE.MeshPhongMaterial({ color: colors[i] });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = i * 2 - 4;
      cube.position.y = height / 2;
      scene.add(cube);
    });

    // Camera
    camera.position.z = 10;
    camera.position.y = 5;
    camera.rotation.x = -0.5;

    // Animate
    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, [data]);

  return (
    <div className="rounded-xl shadow bg-white p-4">
      <h2 className="text-lg font-bold mb-2">Relances (3D)</h2>
      <div ref={mountRef} className="w-full overflow-hidden" />
    </div>
  );
}
