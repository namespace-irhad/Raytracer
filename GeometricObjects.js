// Ravan
class Plane {
  constructor(point, normal, color, reflective = 0, specular = 0, transparency = 0) {
    this.point = point;
    this.normal = normal;
    this.color = color;
    this.reflective = reflective;
    this.specular = specular;
    this.transparency = transparency;
  }

  getIntersection(origin, direction) {
    const k1 = DotProduct(direction, this.normal);
    if (k1 == 0) return [Infinity, Infinity];

    const t = DotProduct(Subtract(this.point, origin), this.normal) / k1;
    if (t > epsilon) {
      return [t, Infinity];
    }

    return [Infinity, Infinity];
  }
}
// Cilindar
class Cylinder {
  constructor(center, radius, height, color, specular = 0, reflective = 0, transparency = 0) {
    this.center = center;
    this.radius = radius;
    this.height = height;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
    this.transparency = transparency;
  }

  getIntersection(origin, direction) {
    const a = direction[0] * direction[0] + direction[2] * direction[2];
    const b = 2 * (direction[0] * (origin[0] - this.center[0]) + direction[2] * (origin[2] - this.center[2]));
    const c =
      (origin[0] - this.center[0]) * (origin[0] - this.center[0]) +
      (origin[2] - this.center[2]) * (origin[2] - this.center[2]) -
      this.radius * this.radius;

    const discriminant = b * b - 4 * (a * c);
    if (Math.abs(discriminant) < epsilon) return [Infinity, Infinity];

    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    const t = t1 > t2 ? t2 : t1;
    const r = origin[1] + t * direction[1];
    const pointOfIntersection = Add(origin, Multiply(t, direction));
    this.normal = [2 * pointOfIntersection[0], 0, 2 * pointOfIntersection[2]];

    if (r >= this.center[1] && r <= this.center[1] + this.height) return [t1, t2];
    return [Infinity, Infinity];
  }
}

// 2D Trougao
class Triangle {
  constructor(coordinates, color, specular = 0, reflective = 0, transparency = 0) {
    this.coordinates = coordinates;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
    this.normal = this.getNormal();
    this.transparency = transparency;
  }
  // Möller–Trumbore intersection algorithm
  getIntersection(origin, direction) {
    const [a, b, c] = this.coordinates;
    const ab = Subtract(b, a);
    const ac = Subtract(c, a);

    const h = CrossProduct(direction, ac);
    const k1 = DotProduct(h, ab);

    if (k1 > -1 * epsilon && k1 < epsilon) return [Infinity, Infinity];
    const f = 1.0 / k1;
    const s = Subtract(origin, a);
    const u = f * DotProduct(s, h);
    if (u < 0 || u > 1) return [Infinity, Infinity];
    const q = CrossProduct(s, ab);
    const v = f * DotProduct(direction, q);
    if (v < 0 || u + v > 1) return [Infinity, Infinity];

    const t = f * DotProduct(ac, q);
    if (t > epsilon) return [t, Infinity];
    return [Infinity, Infinity];
  }
  getNormal() {
    const [a, b, c] = this.coordinates;
    const ab = Subtract(b, a);
    const ac = Subtract(c, a);
    return CrossProduct(ab, ac);
  }
}

// 3D Sfera
class Sphere {
  constructor(center, radius, color, specular = 0, reflective = 0, transparency = 0) {
    this.center = center;
    this.radius = radius;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
    this.transparency = transparency;
  }

  getIntersection(origin, direction) {
    const oc = Subtract(origin, this.center);
    const k1 = DotProduct(direction, direction);
    const k2 = 2 * DotProduct(oc, direction);
    const k3 = DotProduct(oc, oc) - this.radius * this.radius;

    const discriminant = k2 * k2 - 4 * k1 * k3;
    if (discriminant < 0) {
      return [Infinity, Infinity];
    }

    const t1 = (-k2 + Math.sqrt(discriminant)) / (2 * k1);
    const t2 = (-k2 - Math.sqrt(discriminant)) / (2 * k1);
    return [t1, t2];
  }
}

class Rectangle {
  constructor(edgePoint, v1, v2, normal, color, specular = 0, reflective = 0, transparency = 0) {
    this.edgePoint = edgePoint;
    this.v1 = v1;
    this.v2 = v2;
    this.normal = normal;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
    this.transparency = transparency;
    this.v1LenSquared = Math.sqrt(this.v1[0] * this.v1[0] + this.v1[1] * this.v1[1] + this.v1[2] * this.v1[2]);
    this.v2LenSquared = Math.sqrt(this.v2[0] * this.v2[0] + this.v2[1] * this.v2[1] + this.v2[2] * this.v2[2]);
  }

  getIntersection(origin, direction) {
    const t = DotProduct(Subtract(this.edgePoint, origin), this.normal) / DotProduct(direction, this.normal);

    if (t < epsilon) return [Infinity, Infinity];

    const pointOfIntersection = Add(origin, Multiply(t, direction));
    const d = Subtract(pointOfIntersection, this.edgePoint);
    const u = DotProduct(d, this.v1);

    if (u < 0 || u > this.v1LenSquared) return [Infinity, Infinity];

    const v = DotProduct(d, this.v2);

    if (v < 0 || v > this.v2LenSquared) return [Infinity, Infinity];

    return [t, Infinity];
  }
}

class Lenses {
  constructor(center, radius, size = 0.2, color, specular = 0, reflective = 0, transparency = 0) {
    this.center = center;
    this.radius = radius;
    this.size = size;
    this.color = color;
    this.specular = specular;
    this.reflective = reflective;
    this.transparency = transparency;

    this.sphere1 = new Sphere(
      [this.center[0] - this.radius + this.size, this.center[1], this.center[2]],
      this.radius,
      this.color,
      this.specular,
      this.reflective,
      this.transparency
    );
    this.sphere2 = new Sphere(
      [this.center[0] + this.radius - this.size, this.center[1], this.center[2]],
      this.radius,
      this.color,
      this.specular,
      this.reflective,
      this.transparency
    );
  }

  getIntersection(origin, direction) {
    const [t0, t2] = this.sphere1.getIntersection(origin, direction);
    const [t1, t3] = this.sphere2.getIntersection(origin, direction);
    const sorted = [t0, t1, t2, t3].sort((a, b) => a - b);

    return [sorted[2], Infinity];
  }
}
