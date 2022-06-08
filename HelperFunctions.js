const epsilon = 0.0001;

// Skalarni proizvod
function DotProduct(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

// Vektorski proizvod
function CrossProduct(v1, v2) {
  const result = [0, 0, 0];
  result[0] = v1[1] * v2[2] - v1[2] * v2[1];
  result[1] = v1[2] * v2[0] - v1[0] * v2[2];
  result[2] = v1[0] * v2[1] - v1[1] * v2[0];
  return result;
}

// Vektor
function Subtract(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}
// Udaljenost
function Length(vec) {
  return Math.sqrt(DotProduct(vec, vec));
}
// Mnozenje vektora sa skalatom
function Multiply(k, vec) {
  return [k * vec[0], k * vec[1], k * vec[2]];
}
// Sabiranje vektora
function Add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}
// Vrijednost boje izmedju [0, 255]
function Clamp(rgb) {
  return {
    r: Math.min(255, Math.max(0, rgb.r)),
    g: Math.min(255, Math.max(0, rgb.g)),
    b: Math.min(255, Math.max(0, rgb.b)),
  };
}
// Ray je vektor od v1 do tacke v2 objekta na slici
function getReflectRay(v1, v2) {
  return Subtract(Multiply(2 * DotProduct(v1, v2), v2), v1);
}

// https://www.scratchapixel.com/lessons/3d-basic-rendering/introduction-to-shading/reflection-refraction-fresnel
function getRefractRay(v, n, ior) {
  let nv = DotProduct(n, v);
  const nv2 = nv * nv;
  let etai = 1;
  let etat = ior;
  if (nv < 0) nv = -nv;
  else {
    n = Multiply(-1, n);
    const tmp = etai;
    etai = etat;
    etat = tmp;
  }

  const eta = etai / etat;
  const k = 1 - eta * eta * (1 - nv2);
  if (k < 0) {
    return [0, 0, 0];
  }
  return Multiply(eta, Add(v, Multiply(eta, n)));
}
// Sabiranje boja
function AddColors(c1, c2) {
  return { r: c1.r + c2.r, g: c1.g + c2.g, b: c1.b + c2.b };
}
// Dijeljenje boja
function DivideColor(c1, k) {
  return { r: c1.r / k, g: c1.g / k, b: c1.b / k };
}

function MultiplyCanvasToViewport(mat, vec) {
  let result = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i] += vec[j] * mat[i][j];
    }
  }

  return result;
}
