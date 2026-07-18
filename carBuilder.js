import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Loads a car's external 3D model (.glb) and normalizes its size/position
// so every car appears at the same scale and sits flush on the floor —
// regardless of what units the source file was originally exported in.
const TARGET_LENGTH = 4.3; // reference length in scene units, same for every car

export async function buildCar(spec) {
  const group = new THREE.Group();
  const loader = new GLTFLoader();

  try {
    const gltf = await loader.loadAsync(`./models/${spec.id}.glb`);
    const carModel = gltf.scene;

    carModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material && child.material.name && child.material.name.toLowerCase().includes('body')) {
          child.material = new THREE.MeshStandardMaterial({
            color: spec.color, metalness: 0.6, roughness: 0.25
          });
        }
      }
    });

    // Measure the model as-loaded, then scale it so its largest dimension
    // matches TARGET_LENGTH. This is what actually fixes "some cars are
    // huge/zoomed" — every model gets forced to the same real-world size.
    const box = new THREE.Box3().setFromObject(carModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    const largestDimension = Math.max(size.x, size.y, size.z) || 1;
    carModel.scale.setScalar(TARGET_LENGTH / largestDimension);

    // Re-measure after scaling, then center it on X/Z and drop it so its
    // lowest point sits exactly on the floor (y = 0) instead of floating
    // or sinking through the ground.
    const scaledBox = new THREE.Box3().setFromObject(carModel);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    carModel.position.x -= center.x;
    carModel.position.z -= center.z;
    carModel.position.y -= scaledBox.min.y;

    group.add(carModel);

  } catch (error) {
    console.error(`Failed to load 3D model for ${spec.name}. Make sure models/${spec.id}.glb exists.`, error);
  }

  return { group };
}