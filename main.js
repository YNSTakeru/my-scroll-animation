import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./style.css";

// canvas
const canvas = document.querySelector("#webgl");

let desk, chair;

// シーン
const scene = new THREE.Scene();

// 背景用のテクスチャ
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load("./bg/bg.JPG");
scene.background = bgTexture;

// サイズ
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  0.1,
  1000
);

// レンダラー
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(window.devicePixelRatio);

const group = new THREE.Group();

// glbファイルの読み込み
const loader = new GLTFLoader();
loader.setPath("./glb/");
loader.load("chair.glb", (obj) => {
  chair = obj.scene;
  chair.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshNormalMaterial();
    }
  });
  chair.position.set(0, -2, -10);
  chair.rotation.set(Math.PI / 4, -(3 * Math.PI) / 4, 0);
  group.add(chair);
});

loader.load("desk.glb", (obj) => {
  desk = obj.scene;
  desk.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshNormalMaterial();
      child.material.transparent = true;
      child.material.opacity = 0.7;
    }
  });
  desk.position.set(0, -2, 15);
  desk.rotation.y = Math.PI;

  group.add(desk);
});

scene.add(group);

// 線形補間で滑らかに移動させる
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start);
}

const animationScripts = [];
animationScripts.push({
  start: 0,
  end: 40,
  function() {
    if (chair && desk) {
      camera.lookAt(chair.position);
      // // カメラの高さを少しだけ変えておく
      camera.position.set(0, 1, 10);
      chair.position.z = lerp(-10, 4, scalePercent(0, 40));
      chair.position.y = lerp(-2, -2, scalePercent(0, 40));
      chair.rotation.x = lerp(Math.PI / 4, 0, scalePercent(0, 40));
      // desk.position.set(0, -2, 15);
      desk.position.z = lerp(15, -3, scalePercent(0, 40));
    }
  },
});

animationScripts.push({
  start: 40,
  end: 60,
  function() {
    if (chair && desk) {
      camera.lookAt(chair.position);
      // // カメラの高さを少しだけ変えておく
      camera.position.set(0, 1, 10);
      chair.rotation.y = lerp(
        -(3 * Math.PI) / 4,
        Math.PI,
        scalePercent(40, 60)
      );
    }
  },
});

animationScripts.push({
  start: 60,
  end: 80,
  function() {
    if (chair && desk) {
      camera.lookAt(chair.position);
      camera.position.x = lerp(0, -8, scalePercent(60, 80));
      camera.position.y = lerp(1, 6, scalePercent(60, 80));
      camera.position.z = lerp(10, 12, scalePercent(60, 80));
      desk.position.z = lerp(-3, 8, scalePercent(60, 80));

      desk.children = desk.children.map((child) => {
        child.material.opacity = lerp(0.7, 0, scalePercent(60, 80));
        return child;
      });
    }
  },
});

animationScripts.push({
  start: 80,
  end: 100,
  function() {
    if (chair && desk) {
      camera.lookAt(chair.position);
      // chair.rotation.y += 0.02;
      group.rotation.y += 0.01;

      desk.children = desk.children.map((child) => {
        child.material.opacity = lerp(0, 1, scalePercent(80, 100));
        return child;
      });
    }
  },
});

// アニメーションを開始
function playScrollAnimation() {
  animationScripts.forEach((a) => {
    if (scrollPercent >= a.start && scrollPercent <= a.end) {
      a.function();
    }
  });
}

// ブラウザのスクロール率を取得

let scrollPercent = 0;

document.body.onscroll = () => {
  scrollPercent =
    (document.documentElement.scrollTop /
      (document.documentElement.scrollHeight -
        document.documentElement.clientHeight)) *
    100;
};

// アニメーション
const tick = () => {
  window.requestAnimationFrame(tick);
  playScrollAnimation();
  renderer.render(scene, camera);
};

tick();

// ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});
