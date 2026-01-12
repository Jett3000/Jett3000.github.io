// Density Map Modulated Possion Disc Sampler
// Jett Pavlica 2025

class DensityPoissonSampler {
  constructor(densityMap, sampleRadius, attemptCount, contrastExponent = 1, highlightMultiplier = 1, pixelChanel = 'l', initSearchX = 0, initSearchY = 0) {
    // save density map, poisson & image interpretation params
    this.densityMap = densityMap;
    this.sampleRadius = sampleRadius;
    this.attemptCount = attemptCount;
    this.contrastExponent = contrastExponent;
    this.highlightMultiplier = highlightMultiplier;
    this.pixelChanel = pixelChanel;

    // prepare hashtable
    this.domainVec = createVector(densityMap.width, densityMap.height);
    this.cellSize = sampleRadius / sqrt(2);
    this.hashCols = ceil(this.domainVec.x / this.cellSize);
    this.hashRows = ceil(this.domainVec.y / this.cellSize);
    this.hashArray = Array(this.hashCols * this.hashRows).fill(-1);

    // sample array and flag
    this.samples = [];
    this.samplesFull = false;

    // prepare sampling function
    this.densityMap.loadPixels()
    //TODO implement more sampling functions
    this.samplingFunction;
    switch (pixelChanel) {
      case 'l':
        this.samplingFunction = this.getLuminance;
        break;
      case 'c':
        this.samplingFunction = this.getCyan;
        break;
      case 'm':
        this.samplingFunction = this.getMagenta;
        break;
      case 'y':
        this.samplingFunction = this.getYellow;
        break;
    }


    // initial sample
    let found = false;
    for (let x = initSearchX; x < this.domainVec.x; x++) {
      for (let y = initSearchY; y < this.domainVec.y; y++) {
        let a = this.getAlpha(x, y);
        if (this.getAlpha(x, y) > 0) {
          found = this.evaluateSample(x, y);
        }
        if (found) break;
      }
      if (found) break;
    }

    // alert if no sample placed
    if (!found) {
      alert('no valid pixels in image')
    } else {
      console.log('constructed sampler');
    }
  };

  // attemps to spawn new samples from all active samples, stopping on success or hitting max attempt count
  // returns a list of newly added samples
  growSamples() {
    if (this.samplesFull) return;

    // pull the active samples from the main list
    let currentSamples = this.samples.filter(s => s.active);
    if (currentSamples.length == 0) {
      this.samplesFull = true;
      return;
    }

    let newSamples = [];
    for (let sample of currentSamples) {
      // boolean to track success
      let sampleAdded = false;

      // attempt to add new sample from the current one
      for (let i = 0; i < this.attemptCount; i++) {
        let theta = random(TWO_PI);
        let r = sample.spawnRadius + sample.spawnRadius * Math.random();

        // test the new sample for validity
        let potentialX = sample.pos.x + Math.cos(theta) * r;
        let potentialY = sample.pos.y + Math.sin(theta) * r;
        let newSample = this.evaluateSample(potentialX, potentialY, sample);
        if (newSample) {
          // if it's accepted, record and break
          newSamples.push(newSample)
          sampleAdded = true;
          break;
        }
      }
      // flag the sample as inactive if no samples are placed after max attempts
      if (!sampleAdded) {
        sample.active = false;
      }
    }
    return newSamples;
  }

  // evalutates a set of potential sample coordiantes for collisions in the hash map
  // if accepted, creates a new sample object, adds it to the active pool, and returns it
  // returns false otherwise
  evaluateSample(sampleX, sampleY) {
    // reject samples outside of the domain
    if (sampleX < 0.5 || sampleY < 0.5 || sampleX > this.domainVec.x - 0.5 ||
      sampleY > this.domainVec.y - 0.5)
      return false;

    // cache sample channel values
    let sampleAlpha = this.getAlpha(sampleX, sampleY);
    let sampleChannel = this.samplingFunction(sampleX, sampleY);

    // reject if in a transparent part of the image
    if (sampleAlpha < 50) return false;

    // calculate sample hash location and radius padding
    let sampleCol = floor(sampleX / this.cellSize);
    let sampleRow = floor(sampleY / this.cellSize);
    let radiusPadding = this.highlightMultiplier * this.sampleRadius * sampleChannel;
    let traversal = this.highlightMultiplier; //ceil(this.highlightMultiplier * sampleChannel);

    // test neighboring squares in the spatial hash
    for (let xOff = -traversal; xOff <= traversal; xOff++) {
      for (let yOff = -traversal; yOff <= traversal; yOff++) {
        let searchCol = sampleCol + xOff;
        let searchRow = sampleRow + yOff;
        if (searchCol < 0 || searchRow < 0 || searchCol > this.hashCols ||
          searchRow > this.hashRows)
          continue;

        let collidingSampleIndex =
          this.hashArray[searchRow * this.hashCols + searchCol];
        if (collidingSampleIndex > -1) {
          let collidingSample = this.samples[collidingSampleIndex];
          let distance =
            Math.pow(sampleX - collidingSample.pos.x, 2) +
            Math.pow(sampleY - collidingSample.pos.y, 2);
          if (distance < Math.pow(this.sampleRadius + radiusPadding, 2)) return false;
        }
      }
    }

    // on success:
    // update hashmap
    this.hashArray[this.coords2index(sampleRow, sampleCol)] = this.samples.length;
    //create new sample object
    let newSample = new Sample(createVector(sampleX, sampleY), this.sampleRadius + radiusPadding, sampleChannel, sampleAlpha);
    // add it to the sample list
    this.samples.push(newSample);
    // return it
    return newSample;
  }

  /* hash map math helpers */
  index2coords(index) {
    let x = index % this.hashCols;
    let y = floor(index / this.hashCols);
    return createVector(x, y);
  }
  coords2index(row, col) {
    let index = row * this.hashCols + col;
    return index;
  }

  /* pixel sampling functions */
  // reurns average of pixel rbg components, 0-1
  getLuminance(x, y) {
    x = floor(x + 0.5);
    y = floor(y + 0.5);

    let index = 4 * (y * this.densityMap.width + x);
    let gray = (this.densityMap.pixels[index] + this.densityMap.pixels[index + 1] + this.densityMap.pixels[index + 2]) / (255 * 3);

    return Math.pow(gray, this.contrastExponent);
  }

  // returns pixel alpha component, 0-255
  getAlpha(x, y) {
    x = floor(x + 0.5);
    y = floor(y + 0.5);
    return this.densityMap.pixels[(4 * (y * this.densityMap.width + x)) + 3];
  }

  getCyan(x, y) {
    let index = 4 * (floor(y + 0.5) * this.densityMap.width + floor(x + 0.5));
    return Math.pow((this.densityMap.pixels[index + 0]) / 255, this.contrastExponent);
  }

  getMagenta(x, y) {
    let index = 4 * (floor(y + 0.5) * this.densityMap.width + floor(x + 0.5));
    return Math.pow((this.densityMap.pixels[index + 1]) / 255, this.contrastExponent);
  }

  getYellow(x, y) {
    let index = 4 * (floor(y + 0.5) * this.densityMap.width + floor(x + 0.5));
    return Math.pow((this.densityMap.pixels[index + 2]) / 255, this.contrastExponent);
  }
}

class Sample {
  constructor(pos, spawnRadius, chanelVal, alphaVal) {
    this.pos = pos;
    this.spawnRadius = spawnRadius;
    this.chanelVal = chanelVal;
    this.alphaVal = alphaVal;
    this.active = alphaVal > 0;
  }
}