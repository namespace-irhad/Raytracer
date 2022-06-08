class Light {
  constructor(type, intensity, value) {
    switch (type) {
      case 'ambient':
        this.type = type;
        this.intensity = intensity;
        break;
      case 'point':
        this.type = type;
        this.intensity = intensity;
        this.position = value;
        break;
      case 'directional':
        this.type = type;
        this.intensity = intensity;
        this.direction = value;
        break;
      default:
        this.type = type;
        this.intensity = intensity;
        break;
    }
  }
}
