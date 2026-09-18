/**
 * OilGuard AI — 3D Interactive Marine Landing Hero
 * Uses Three.js with robust fallback to 2D Canvas Wave Mesh.
 */
class MarineHeroVisual {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.mouseX = 0;
    this.mouseY = 0;
    this.count = 0;

    if (window.THREE) {
      this.initThree();
    } else {
      this.initCanvasFallback();
    }

    window.addEventListener("resize", () => this.onResize());
    window.addEventListener("mousemove", (e) => {
      this.mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      this.mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });
  }

  initThree() {
    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 1, 10000);
      this.camera.position.set(0, 320, 500);
      this.camera.lookAt(0, 0, 0);

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      // Create glowing wave particle grid
      const SEPARATION = 32;
      const AMOUNTX = 65;
      const AMOUNTY = 65;
      const numParticles = AMOUNTX * AMOUNTY;

      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);

      let i = 0, j = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2; // x
          positions[i + 1] = 0; // y
          positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2; // z
          scales[j] = 1;
          i += 3;
          j++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

      // Custom shader / point material
      const material = new THREE.PointsMaterial({
        color: 0x00e5ff,
        size: 3.2,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);

      // Add a floating glowing indicator representing incident vessel
      const beaconGeo = new THREE.SphereGeometry(6, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff3366, wireframe: true });
      this.beacon = new THREE.Mesh(beaconGeo, beaconMat);
      this.beacon.position.set(40, 45, 20);
      this.scene.add(this.beacon);

      this.animateThree = () => {
        requestAnimationFrame(this.animateThree);
        this.count += 0.04;

        const positions = this.particles.geometry.attributes.position.array;
        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i + 1] = (Math.sin((ix + this.count) * 0.3) * 35) + (Math.sin((iy + this.count) * 0.4) * 35);
            i += 3;
          }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;

        this.beacon.position.y = 45 + Math.sin(this.count * 1.5) * 12;
        this.beacon.rotation.y += 0.02;

        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.03;
        this.camera.position.y += (-this.mouseY + 320 - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 20, 0);

        this.renderer.render(this.scene, this.camera);
      };
      this.animateThree();
    } catch (e) {
      console.warn("WebGL initialization failed, falling back to 2D wave canvas:", e);
      this.initCanvasFallback();
    }
  }

  initCanvasFallback() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    this.container.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.2;

      for (let y = 120; y < canvas.height; y += 40) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 30) {
          const wave = Math.sin(x * 0.01 + t + y * 0.02) * 20 + Math.cos(t * 0.8 + x * 0.005) * 10;
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      requestAnimationFrame(render);
    };
    render();
  }

  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    if (this.renderer && this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  }
}

window.MarineHeroVisual = MarineHeroVisual;
