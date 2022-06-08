const sceneSelectElement = document.getElementById('console-text-select-scene');
const renderButtonElement = document.getElementById('console-text-button');

renderButtonElement.addEventListener('click', () => {
  const scene = sceneSelectElement.value;

  switch (scene) {
    case '':
      break;
    case 'scene1':
      renderScene1();
      break;
    case 'scene2':
      renderScene2();
      break;
    case 'scene3':
      renderScene3();
      break;
    default:
      renderScene1();
      break;
  }
});

const renderScene1 = () => {
  // Object Showcase
  raytracer.backgroundColor = { r: 255, g: 255, b: 255 };
  raytracer.sceneObjects = [
    new Sphere([-1, -2, 3], 0.7, { r: 100, g: 200, b: 0 }, 5, 0.2),
    new Sphere([0, -1, 3], 1, { r: 255, g: 0, b: 0 }, 100, 0.2, 0.5),
    new Sphere([2, 0, 4], 1, { r: 0, g: 0, b: 255 }, 500, 0.3),
    new Sphere([-2, 0, 4], 1, { r: 0, g: 255, b: 0 }, 10, 0.4),
    // new Sphere([0, -5001, 0], 5000, { r: 255, g: 255, b: 0 }, 1000, 0.5),
    // new Cylinder([3, -2, 6], 1, 5, { r: 255, g: 200, b: 0 }),
    new Plane([1, 1, 5], [5, 3, 1], { r: 255, g: 99, b: 71 }),
    new Triangle(
      [
        [1, 0.5, 1],
        [-2, 2, 2],
        [-1, -2, 0],
      ],
      { r: 0, g: 0, b: 255 },
      2,
      0.3
    ),
    new Rectangle([-2, -2, 2], [-1, 0, 0], [1, 0, 1], [0, 1, 0], { r: 255, g: 0, b: 0 }),
  ];
  raytracer.sceneLights = [
    new Light('ambient', 0.2),
    new Light('point', 0.6, [2, 1, 0]),
    new Light('directional', 0.2, [1, 4, 4]),
  ];
  raytracer.renderScene();
  raytracer.updateCanvas();
};

const renderScene2 = () => {
  // Scene Object Grass and Sky
  raytracer.backgroundColor = { r: 255, g: 255, b: 255 };
  raytracer.sceneObjects = [
    new Plane([0, -2, 0], [0, 1, 0], { r: 0, g: 255, b: 0 }),
    new Plane([0, 2, 0], [0, 1, 0], { r: 0, g: 0, b: 255 }),
    new Sphere([0, 0, 2], 1, { r: 255, g: 0, b: 0 }, 0, 0.3, 0.5),
    new Sphere([2, 0, 2], 1, { r: 0, g: 255, b: 0 }, 100, 0.5, 0.9),
    new Sphere([-2, 0, 2], 1, { r: 255, g: 50, b: 255 }, 0, 0.3, 1.2),
  ];

  raytracer.sceneLights = [
    new Light('ambient', 0.2),
    new Light('directional', 0.8, [0, 0, 1]),
    new Light('point', 0.8, [0, 0, -2]),
  ];
  raytracer.renderScene();
  raytracer.updateCanvas();
};

const renderScene3 = () => {
  raytracer.backgroundColor = { r: 0, g: 0, b: 0 };
  raytracer.sceneObjects = [
    // new Sphere([0, -5020, 0], 5000, { r: 100, g: 150, b: 100 }, 1),
    new Plane([0, -2, 0], [0, 1, 0], { r: 230, g: 230, b: 250 }),
    new Cylinder([3, -2, 7], 1, 6, { r: 0, g: 255, b: 0 }, 0, 0.3, 0.5),
    new Cylinder([0, -2, 7], 1, 5, { r: 0, g: 0, b: 255 }),
    new Cylinder([-3, -2, 7], 1, 4, { r: 255, g: 0, b: 0 }, 0, 0.5),
  ];
  raytracer.sceneLights = [
    new Light('ambient', 0.2),
    // new Light('directional', 0.6, [5, 5, 10]),
    new Light('point', 0.3, [0, 10, 7]),
  ];
  raytracer.renderScene();
  raytracer.updateCanvas();
};
