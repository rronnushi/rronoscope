// Global Variables
let thicknessSlider, backgroundColorPicker, symmetrySlider;
let orientationSelect, shapeSelect, clearButton, randomColorButton, randomSizeButton, autoButton, saveButton;
let colorPicker1, colorPicker2, colorPicker3;
let randomColorMode = false, randomSizeMode = false;
let angle, currentRotation = 0;
let guiContainer, canvas;

function clearCanvas() {
  background(backgroundColorPicker.color());
}

function isPointerOverGui() {
  const rect = guiContainer.elt.getBoundingClientRect();
  const x = mouseX + canvas.elt.offsetLeft;
  const y = mouseY + canvas.elt.offsetTop;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function setup() {
  canvas = createCanvas(1920, 1080);
  colorMode(HSB, 360, 100, 100, 100);

  guiContainer = createDiv()
    .style('position', 'absolute')
    .style('top', '20px')
    .style('left', '20px')
    .style('background', 'rgba(0, 0, 0, 0.6)')
    .style('padding', '12px')
    .style('border-radius', '10px')
    .style('border', '1px solid white')
    .style('color', 'white')
    .style('font-family', 'sans-serif')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('gap', '8px')
    .style('z-index', '10');

  // Title
  createElement('h2', 'Rronoscope')
    .parent(guiContainer)
    .style('margin', '0 0 8px 0')
    .style('font-size', '18px');

  // Orientation
  createSpan('Orientation').parent(guiContainer);
  orientationSelect = createSelect().parent(guiContainer);
  orientationSelect.option('1920 × 1080');
  orientationSelect.option('1080 × 1920');
  orientationSelect.option('1080 × 1080');
  orientationSelect.changed(() => {
    const [w, h] = orientationSelect.value().split(' × ').map(Number);
    resizeCanvas(w, h);
    clearCanvas();
  });

    // Colors
  createSpan('Color 1').parent(guiContainer);
  colorPicker1 = createColorPicker('#FF0000').parent(guiContainer);
  // Randomize Color 1
  createButton('Randomize')
    .parent(guiContainer)
    .style('background', 'none')
    .style('border', 'none')
    .style('padding', '0')
    .style('margin', '0')
    .style('color', 'white')
    .style('cursor', 'pointer')
    .mousePressed(() => {
      const c = color(random(360), 100, 100);
      colorPicker1.value(c.toString('#rrggbb'));
    });

  createSpan('Color 2').parent(guiContainer);
  colorPicker2 = createColorPicker('#0000FF').parent(guiContainer);
  // Randomize Color 2
  createButton('Randomize')
    .parent(guiContainer)
    .style('background', 'none')
    .style('border', 'none')
    .style('padding', '0')
    .style('margin', '0')
    .style('color', 'white')
    .style('cursor', 'pointer')
    .mousePressed(() => {
      const c = color(random(360), 100, 100);
      colorPicker2.value(c.toString('#rrggbb'));
    });

  createSpan('Color 3').parent(guiContainer);
  colorPicker3 = createColorPicker('#00FF00').parent(guiContainer);
  // Randomize Color 3
  createButton('Randomize')
    .parent(guiContainer)
    .style('background', 'none')
    .style('border', 'none')
    .style('padding', '0')
    .style('margin', '0')
    .style('color', 'white')
    .style('cursor', 'pointer')
    .mousePressed(() => {
      const c = color(random(360), 100, 100);
      colorPicker3.value(c.toString('#rrggbb'));
    });

  // Shape
  createSpan('Brush Shape').parent(guiContainer);
  shapeSelect = createSelect().parent(guiContainer);
  ['Line', 'Circle', 'Triangle', 'Square'].forEach(opt => shapeSelect.option(opt));
  shapeSelect.selected('Line');

  // Thickness
  createSpan('Brush Thickness').parent(guiContainer);
  thicknessSlider = createSlider(1, 100, 10, 1).parent(guiContainer);

  // Symmetry
  createSpan('Symmetry Slices').parent(guiContainer);
  symmetrySlider = createSlider(2, 32, 6, 2).parent(guiContainer);

  // Background
  createSpan('Background Color').parent(guiContainer);
  backgroundColorPicker = createColorPicker('#000000').parent(guiContainer);

  // Controls
  clearButton = createButton('Clear Canvas').parent(guiContainer).mousePressed(clearCanvas);

  randomColorButton = createButton('Random Color: OFF').parent(guiContainer)
    .mousePressed(() => {
      randomColorMode = !randomColorMode;
      randomColorButton.html(randomColorMode ? 'Random Color: ON' : 'Random Color: OFF');
    });

  randomSizeButton = createButton('Random Size: OFF').parent(guiContainer)
    .mousePressed(() => {
      randomSizeMode = !randomSizeMode;
      randomSizeButton.html(randomSizeMode ? 'Random Size: ON' : 'Random Size: OFF');
    });

  autoButton = createButton('Auto Mode').parent(guiContainer).mousePressed(autoGenerate);

  saveButton = createButton('Save Image').parent(guiContainer)
    .mousePressed(() => saveCanvas(`kaleidoscope_${width}x${height}`, 'png'));

  angle = TWO_PI / symmetrySlider.value();
  clearCanvas();
}

function draw() {
  if (!mouseIsPressed || isPointerOverGui()) return;

  translate(width / 2, height / 2);
  const slices = symmetrySlider.value();
  angle = TWO_PI / slices;

  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;
  const pmx = pmouseX - width / 2;
  const pmy = pmouseY - height / 2;

  const baseThick = thicknessSlider.value();
  const dynThick = randomSizeMode ? random(1, baseThick) : baseThick;
  const alpha = map(dist(mx, my, pmx, pmy), 0, 50, 30, 255, true);

  // Color blending
  let brushColor;
  if (randomColorMode) {
    const mid1 = lerpColor(colorPicker1.color(), colorPicker2.color(), random());
    brushColor = lerpColor(mid1, colorPicker3.color(), random());
    brushColor.setAlpha(alpha);
  } else {
    const distFrac = dist(mx, my, 0, 0) / (max(width, height) / 2);
    const mid1 = lerpColor(colorPicker1.color(), colorPicker2.color(), distFrac);
    brushColor = lerpColor(mid1, colorPicker3.color(), distFrac);
    brushColor.setAlpha(alpha);
  }

  const shape = shapeSelect.value();

  // Radial symmetry drawing
  drawSlices(slices, shape, mx, my, pmx, pmy, dynThick, brushColor);
}

function drawSlices(slices, shape, mx, my, pmx, pmy, thick, col) {
  for (let i = 0; i < slices; i++) {
    rotate(angle);
    drawShape(shape, mx, my, pmx, pmy, thick, col);
    push(); scale(1, -1);
    drawShape(shape, mx, my, pmx, pmy, thick, col);
    pop();
  }
}

function drawShape(shape, x, y, px, py, thick, col) {
  stroke(col); strokeWeight(thick); fill(col);
  if (shape === 'Line') line(x, y, px, py);
  else if (shape === 'Circle') ellipse(x, y, thick);
  else if (shape === 'Triangle') {
    const h = thick * sqrt(3) / 2;
    beginShape();
    vertex(x, y - (2 * h) / 3);
    vertex(x - thick / 2, y + h / 3);
    vertex(x + thick / 2, y + h / 3);
    endShape(CLOSE);
  } else if (shape === 'Square') {
    rectMode(CENTER);
    rect(x, y, thick, thick);
  }
}

function autoGenerate() {
  clearCanvas();
  const slices = symmetrySlider.value();
  const shape = shapeSelect.value();
  const strokeCount = int(random(100, 400));
  push(); translate(width/2, height/2);
  for (let i = 0; i < strokeCount; i++) {
    // Random start point
    const mx = random(-width/2, width/2);
    const my = random(-height/2, height/2);
    // Random length and direction for stroke
    const len = random(10, max(width, height) / 2);
    const theta = random(TWO_PI);
    const pmx = mx + len * cos(theta);
    const pmy = my + len * sin(theta);
    const baseThick = thicknessSlider.value();
    const dynThick = randomSizeMode ? random(1, baseThick) : baseThick;
    let brushColor;
    if (randomColorMode) {
      const mid1 = lerpColor(colorPicker1.color(), colorPicker2.color(), random());
      brushColor = lerpColor(mid1, colorPicker3.color(), random());
    } else {
      const distFrac = dist(mx, my, 0, 0) / (max(width, height) / 2);
      const mid1 = lerpColor(colorPicker1.color(), colorPicker2.color(), distFrac);
      brushColor = lerpColor(mid1, colorPicker3.color(), distFrac);
    }
    brushColor.setAlpha(random(50, 255));
    drawSlices(slices, shape, mx, my, pmx, pmy, dynThick, brushColor);
  }
  pop();
}
