const canvasElement = document.querySelector('#canvas');
const canvasContext = canvasElement.getContext('2d');

class CanvasRaytracer {
  projectionPlaneZ = 1;
  backgroundColor = { r: 255, g: 255, b: 255 };
  cameraPosition = [0, 0, 0];
  cameraRotation = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  sceneObjects = [];
  sceneLights = [];
  viewportSize = 3;
  EPSILON = 0.001;
  recursionDepth = 2;

  constructor(options = { sampler: 'random', sampler_no: 10 }) {
    // window.addEventListener('resize', this.resizeCanvas, false);
    // canvasElement.height = window.innerHeight;
    // canvasElement.width = window.innerWidth;
    this.canvasImageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
    if (options.sampler) {
      this.sampler = new Sampler(options.sampler_no, options.sampler); // Idealno 25
      this.sampler.generateSamples();
    }
  }

  resizeCanvas() {
    canvasElement.height = window.innerHeight;
    canvasElement.width = window.innerWidth;
    this.updateCanvas();
  }

  canvasToViewport(p2d) {
    // udaljenost / sirina|visina
    return [
      (p2d[0] * this.viewportSize) / canvas.width,
      (p2d[1] * this.viewportSize) / canvas.height,
      this.projectionPlaneZ, // udaljenost
    ];
  }

  putPixel(x, y, color = { r: 0, g: 0, b: 0, a: 255 }) {
    x = canvasElement.width / 2 + x;
    y = canvasElement.height / 2 - y - 1;

    if (x < 0 || x >= canvasElement.width || y < 0 || y >= canvasElement.height) {
      return;
    }

    let pomak = 4 * (x + this.canvasImageData.width * y);
    this.canvasImageData.data[pomak++] = color.r;
    this.canvasImageData.data[pomak++] = color.g;
    this.canvasImageData.data[pomak++] = color.b;
    this.canvasImageData.data[pomak++] = color.a || 255;
  }

  updateCanvas(canvasImageData = this.canvasImageData) {
    canvasContext.putImageData(canvasImageData, 0, 0);
  }

  computeLighting(point, normal, view, specular) {
    let intensity = 0;
    const lengthN = Length(normal); // Should be 1.0, but just in case...
    const lengthV = Length(view);

    for (let i = 0; i < this.sceneLights.length; i++) {
      const light = this.sceneLights[i];
      if (light.type === 'ambient') {
        intensity += light.intensity;
        continue;
      }

      let vectorL, tMax;
      if (light.type === 'point') {
        vectorL = Subtract(light.position, point);
        tMax = 1.0;
      } else if (light.type === 'directional') {
        // Light.DIRECTIONAL
        vectorL = light.direction;
        tMax = Infinity;
      } else if (light.type === 'colored_point') {
        // Light.COLORED_POINT
        vectorL = Subtract(light.position, point);
        tMax = 1.0;
      }

      const shadowCheck = this.closestIntersection(point, vectorL, this.EPSILON, tMax);
      if (shadowCheck) {
        continue;
      }
      // Diffuse
      const n_dot_l = DotProduct(normal, vectorL);
      if (n_dot_l > 0) {
        intensity += (light.intensity * n_dot_l) / (lengthN * Length(vectorL));
      }
      // Specular reflection.
      if (specular != -1) {
        const vec_r = getReflectRay(vectorL, normal);
        const r_dot_v = DotProduct(vec_r, view);
        if (r_dot_v > 0) {
          intensity += light.intensity * Math.pow(r_dot_v / (Length(vec_r) * lengthV), specular);
        }
      }
    }
    return intensity;
  }

  closestIntersection(origin, direction, minT, maxT) {
    let closestT = Infinity;
    let closestObject;

    for (let i = 0; i < this.sceneObjects.length; i++) {
      const ts = this.sceneObjects[i].getIntersection(origin, direction);

      if (ts[0] < closestT && minT < ts[0] && ts[0] < maxT) {
        closestT = ts[0];
        closestObject = this.sceneObjects[i];
      }
      if (ts[1] < closestT && minT < ts[1] && ts[1] < maxT) {
        closestT = ts[1];
        closestObject = this.sceneObjects[i];
      }
    }
    if (closestObject) {
      // console.log(closestObject);
      return { closestObject, closestT };
    }
    return null;
  }

  getTraceRay(origin, direction, minT, maxT, depth) {
    const intersection = this.closestIntersection(origin, direction, minT, maxT, depth);

    if (!intersection) return this.backgroundColor;

    const { closestObject, closestT } = intersection;
    const point = Add(origin, Multiply(closestT, direction));
    let normal = closestObject.normal || Subtract(point, closestObject.center);
    normal = Multiply(1.0 / Length(normal), normal);

    const view = Multiply(-1, direction);
    const { color: closestSphereColor } = closestObject;

    const lighting = this.computeLighting(point, normal, view, closestObject.specular);
    let [r, g, b] = Multiply(lighting, [closestSphereColor.r, closestSphereColor.g, closestSphereColor.b]);

    if (closestObject.reflective <= 0 || depth <= 0) return { r, g, b };

    const reflectedRay = getReflectRay(view, normal);
    const reflectedColor = this.getTraceRay(point, reflectedRay, this.EPSILON, Infinity, depth - 1);

    if (closestObject.transparency > 0) {
      const refractedRay = getRefractRay(view, normal, closestObject.transparency);
      const refractedColor = this.getTraceRay(view, refractedRay, this.EPSILON, Infinity, depth - 1);

      r =
        (reflectedColor.r * closestObject.reflective + refractedColor.r * (1 - closestObject.reflective)) *
        closestObject.transparency;
      g =
        (reflectedColor.g * closestObject.reflective + refractedColor.g * (1 - closestObject.reflective)) *
        closestObject.transparency;
      b =
        (reflectedColor.b * closestObject.reflective + refractedColor.b * (1 - closestObject.reflective)) *
        closestObject.transparency;
    } else {
      const resultingColor = Add(
        Multiply(1 - closestObject.reflective, [r, g, b]),
        Multiply(closestObject.reflective, [reflectedColor.r, reflectedColor.g, reflectedColor.b])
      );
      [r, g, b] = resultingColor;
    }

    return { r, g, b };
  }

  renderScene() {
    for (let x = -canvasElement.width / 2; x < canvasElement.width / 2; x++) {
      for (let y = -canvasElement.height / 2; y < canvasElement.height / 2; y++) {
        if (this.sampler) {
          let pixelColor = this.backgroundColor;
          for (let sample = 0; sample < this.sampler.num_samples; sample++) {
            const [sampleX, sampleY] = this.sampler.getNextSample();
            const direction = MultiplyCanvasToViewport(
              this.cameraRotation,
              this.canvasToViewport([x + sampleX, y + sampleY])
            );
            const sampleColor = this.getTraceRay(this.cameraPosition, direction, 1, Infinity, this.recursionDepth);
            pixelColor = AddColors(sampleColor, pixelColor);
          }
          this.putPixel(x, y, Clamp(DivideColor(pixelColor, this.sampler.num_samples)));
        } else {
          const direction = MultiplyCanvasToViewport(this.cameraRotation, this.canvasToViewport([x, y]));
          const color = this.getTraceRay(this.cameraPosition, direction, 1, Infinity, this.recursionDepth);
          this.putPixel(x, y, Clamp(color));
        }
      }
    }
    return this.canvasImageData;
  }
}

// MAIN
const raytracer = new CanvasRaytracer({ sampler: 'hammersley', sampler_no: 5 });

// raytracer.backgroundColor = { r: 0.0, g: 0.0, b: 0.0 };
// raytracer.recursionDepth = 0;

raytracer.sceneObjects = [
  new Lenses([0, 0, 3], 5, 0.2, { r: 0, g: 250, b: 0 }),
  new Sphere([-1, 1, 3], 0.7, { r: 100, g: 200, b: 0 }, 5, 0.2),
  new Sphere([1, 1, 3], 0.7, { r: 100, g: 200, b: 0 }, 5, 0.2),
  new Lenses([1, -2, 4], 2, 0.3, { r: 50, g: 100, b: 250 }),
  new Lenses([-1, -2, 4], 2, 0.3, { r: 50, g: 100, b: 250 }),
];

raytracer.sceneLights = [
  new Light('ambient', 0.2),
  new Light('point', 0.6, [2, 1, 0]),
  new Light('directional', 0.2, [1, 4, 4]),
];

raytracer.renderScene();
raytracer.updateCanvas();

// renderScene1();
