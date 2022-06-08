class Sampler {
  #count = 0;
  #samples = [];
  constructor(num_samples, type) {
    this.num_samples = num_samples;
    this.type = type;
  }
  generateSamples() {
    if (this.type === 'random') {
      for (let i = 0; i < this.num_samples; i++) this.#samples.push([Math.random(), Math.random()]);
    } else if (this.type === 'jitter') {
      for (let i = 0; i < this.num_samples; i++) {
        const x = Math.random();
        const y = Math.random();
        this.#samples.push([x + 0.5, y + 0.5]);
      }
    } else if (this.type === 'halton') {
      for (let i = 0; i < this.num_samples; i++) {
        const x = this.Halton(i, 2);
        const y = this.Halton(i, 3);
        this.#samples.push([x, y]);
      }
    } else if (this.type === 'nrooks') {
      for (let i = 0; i < this.num_samples; i++) {
        const x = (i + Math.random()) / this.num_samples;
        const y = (i + Math.random()) / this.num_samples;
        this.#samples.push([x, y]);
      }
      this.shuffleXcoordinates();
      this.shuffleYcoordinates();
    } else if (this.type === 'hammersley') {
      for (let i = 0; i < this.num_samples; i++) {
        const x = i / this.num_samples;
        const y = this.getPhi(i);
        this.#samples.push([x, y]);
      }
    }
    this.#count = 0;
  }
  Halton(index, base) {
    let result = 0;
    let f = 1.0 / base;
    let i = index;
    while (i > 0) {
      result = result + f * (i % base);
      i = Math.floor(i / base);
      f = f / base;
    }
    return result;
  }
  shuffleXcoordinates() {
    for (let i = 0; i < this.num_samples; i++) {
      const j = Math.floor(Math.random() * this.num_samples);
      const temp = this.#samples[i][0];
      this.#samples[i][0] = this.#samples[j][0];
      this.#samples[j][0] = temp;
    }
  }
  shuffleYcoordinates() {
    for (let i = 0; i < this.num_samples; i++) {
      const j = Math.floor(Math.random() * this.num_samples);
      const temp = this.#samples[i][1];
      this.#samples[i][1] = this.#samples[j][1];
      this.#samples[j][1] = temp;
    }
  }
  getPhi(j) {
    let x = 0.0;
    let f = 0.5;

    while (j > 0) {
      x += f * (j % 2);
      j = Math.floor(j / 2);
      f = f / 2.0;
    }
    return x;
  }

  getNextSample() {
    return this.#samples[this.#count++ % this.num_samples];
  }
}
