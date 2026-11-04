import { useEffect, useRef } from "react";
import { BITS, buildDigitAtlas, DIGIT_LEVELS, loadDigitFont } from "@/lib/binary";

const CELL_ASPECT = 1.5;
const FINE = { columns: 96, rows: 50 };
const COARSE = { columns: 64, rows: 34 };
const FINE_MIN_WIDTH = 420;
// One row of digits is as thick as one and a half columns, so lines pair 2 rows with 3 columns.
const LINE_ROWS = 2;
const LINE_COLUMNS = 3;
const CORNER_COLUMNS = 2;
const SHADOW_LIGHT = 0.26;
const BAR_HEIGHTS = [0.28, 0.52, 0.76, 1];
const CAMERA_DISTANCE = 4;
const MODEL_SCALE = 1;
const SMOOTHING_MS = 260;
const SETTLED = 0.0005;
const FLIGHT_FADE = 0.55;
const PITCH = 0.06;
const BASE_YAW = -0.1;
const REDRAW_THRESHOLD = 0.0002;
const MAX_DELAY = 0.7;
const ATLAS_SCALE = 2;
const MAX_PIXEL_RATIO = 2;
const MIN_LIGHT = 0.05;
const SCATTER = 0.9;

type Point = { x: number; y: number; z: number; light: number; isAccent?: boolean };
type Grid = ReturnType<typeof createGrid>;
type Layout = { columns: number; rows: number };

const EMPTY = 0;
const INK = 1;
const ACCENT = 2;

function createGrid({ columns, rows }: Layout) {
  const cells = new Uint8Array(columns * rows);
  const at = (column: number, row: number) =>
    column < 0 || row < 0 || column >= columns || row >= rows ? EMPTY : cells[row * columns + column];
  const fill = (column: number, row: number, width: number, height: number, value: number) => {
    for (let y = row; y < row + height; y++) {
      for (let x = column; x < column + width; x++) cells[y * columns + x] = value;
    }
  };
  // A block whose four corners all step in by the same mirrored amount.
  const panel = (column: number, row: number, width: number, height: number, value: number) => {
    fill(column, row, width, height, value);
    for (const y of [row, row + height - 1]) {
      fill(column, y, CORNER_COLUMNS, 1, EMPTY);
      fill(column + width - CORNER_COLUMNS, y, CORNER_COLUMNS, 1, EMPTY);
    }
  };
  // Layout sizes are written for the fine grid, then rounded to whole digits.
  const scaleX = (value: number) => Math.round((value * columns) / FINE.columns);
  const scaleY = (value: number) => Math.round((value * rows) / FINE.rows);
  const evenY = (value: number) => 2 * scaleY(value / 2);
  return { columns, rows, at, fill, panel, scaleX, scaleY, evenY };
}

// A window frame with a title bar and three identical square control dots.
function drawWindow(grid: Grid) {
  const { columns, rows } = grid;
  const barRows = grid.evenY(8);
  grid.panel(0, 0, columns, rows, INK);
  grid.fill(LINE_COLUMNS, barRows, columns - LINE_COLUMNS * 2, rows - barRows - LINE_ROWS, EMPTY);
  for (let dot = 0; dot < 3; dot++) {
    grid.fill(grid.scaleX(5) + dot * (LINE_COLUMNS + LINE_ROWS), (barRows - LINE_ROWS) / 2, LINE_COLUMNS, LINE_ROWS, EMPTY);
  }
  return { top: barRows, bottom: rows - LINE_ROWS, left: LINE_COLUMNS, right: columns - LINE_COLUMNS };
}

// A browser: headline, two text lines, a button and an image.
function drawWebsite(grid: Grid) {
  const frame = drawWindow(grid);
  const left = frame.left + grid.scaleX(6);
  const right = frame.right - grid.scaleX(6);
  const top = frame.top + grid.scaleY(4);
  const bottom = frame.bottom - grid.scaleY(4);
  const imageWidth = grid.scaleX(28);
  grid.panel(right - imageWidth, top, imageWidth, bottom - top, INK);

  const textWidth = right - imageWidth - left - grid.scaleX(6);
  const headlineRows = grid.evenY(6);
  grid.fill(left, top, textWidth, headlineRows, INK);
  const firstLine = top + headlineRows + grid.scaleY(4);
  grid.fill(left, firstLine, textWidth, LINE_ROWS, INK);
  grid.fill(left, firstLine + LINE_ROWS + grid.scaleY(3), Math.round(textWidth * 0.68), LINE_ROWS, INK);
  const buttonRows = grid.evenY(8);
  grid.panel(left, bottom - buttonRows, grid.scaleX(22), buttonRows, ACCENT);
}

// An app: a sidebar menu and a rising bar chart on one baseline.
function drawApp(grid: Grid) {
  const frame = drawWindow(grid);
  const left = frame.left + grid.scaleX(4);
  const right = frame.right - grid.scaleX(5);
  const top = frame.top + grid.scaleY(4);
  const bottom = frame.bottom - grid.scaleY(4);
  const sidebarWidth = grid.scaleX(20);
  grid.panel(left, top, sidebarWidth, bottom - top, INK);
  const inset = grid.scaleX(4);
  const menuStep = grid.scaleY(6);
  for (let item = 0; item < 4; item++) {
    grid.fill(left + inset, top + grid.scaleY(4) + item * menuStep, sidebarWidth - inset * 2, LINE_ROWS, EMPTY);
  }

  const barWidth = grid.scaleX(10);
  const chartLeft = left + sidebarWidth + grid.scaleX(6);
  const gap = Math.floor((right - chartLeft - barWidth * BAR_HEIGHTS.length) / (BAR_HEIGHTS.length - 1));
  BAR_HEIGHTS.forEach((share, index) => {
    const height = 2 * Math.round(((bottom - top) * share) / 2);
    grid.fill(right - (BAR_HEIGHTS.length - index) * barWidth - (BAR_HEIGHTS.length - 1 - index) * gap, bottom - height, barWidth, height, ACCENT);
  });
}

// Three tools joined by one square wire run to a larger system.
function drawIntegrations(grid: Grid) {
  const { columns, rows } = grid;
  const toolWidth = grid.scaleX(26);
  const toolRows = grid.evenY(12);
  const toolTops = [0, (rows - toolRows) / 2, rows - toolRows];
  const hubWidth = grid.scaleX(36);
  const hubRows = grid.evenY(30);
  const hubLeft = columns - hubWidth;
  const hubTop = (rows - hubRows) / 2;
  const busLeft = grid.scaleX(46);
  const wireRow = (top: number) => top + toolRows / 2 - LINE_ROWS / 2;

  for (const top of toolTops) {
    grid.fill(toolWidth, wireRow(top), busLeft - toolWidth, LINE_ROWS, ACCENT);
    grid.panel(0, top, toolWidth, toolRows, INK);
  }
  grid.fill(busLeft, wireRow(toolTops[0]), LINE_COLUMNS, wireRow(toolTops[2]) - wireRow(toolTops[0]) + LINE_ROWS, ACCENT);
  grid.fill(busLeft + LINE_COLUMNS, wireRow(toolTops[1]), hubLeft - busLeft - LINE_COLUMNS, LINE_ROWS, ACCENT);

  grid.panel(hubLeft, hubTop, hubWidth, hubRows, INK);
  grid.fill(hubLeft + LINE_COLUMNS, hubTop + LINE_ROWS, hubWidth - LINE_COLUMNS * 2, hubRows - LINE_ROWS * 2, EMPTY);
  const coreColumns = 2 * grid.scaleX(7);
  const coreRows = grid.evenY(12);
  grid.panel(hubLeft + (hubWidth - coreColumns) / 2, hubTop + (hubRows - coreRows) / 2, coreColumns, coreRows, INK);
}

// Every filled cell becomes a digit. A faint copy one cell down and right acts as a hard shadow.
function buildIconPoints(draw: (grid: Grid) => void, layout: Layout) {
  const grid = createGrid(layout);
  draw(grid);
  const stepX = 2 / grid.columns;
  const stepY = stepX * CELL_ASPECT;
  const toPoint = (column: number, row: number, light: number, value: number): Point => ({
    x: (column + 0.5 - grid.columns / 2) * stepX,
    y: (row + 0.5 - grid.rows / 2) * stepY,
    z: 0,
    light,
    isAccent: value === ACCENT,
  });

  const points: Point[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let column = 0; column < grid.columns; column++) {
      const value = grid.at(column, row);
      if (value === EMPTY) continue;
      points.push(toPoint(column, row, 1, value));
      if (grid.at(column + 1, row + 1) === EMPTY) points.push(toPoint(column + 1, row + 1, SHADOW_LIGHT, value));
    }
  }
  return points;
}

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Every digit gets a place in every shape. Shapes with fewer points hide the spare digits.
function buildTargets(layout: Layout) {
  const lists = [drawWebsite, drawApp, drawIntegrations].map((draw) => shuffled(buildIconPoints(draw, layout)));
  const count = Math.max(...lists.map((list) => list.length));
  return lists.map((list) =>
    Array.from({ length: count }, (_, index) => list[index] ?? { ...list[index % list.length], light: 0 }),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

type BinaryMorphProps = {
  getSlots: () => HTMLElement[];
  getPosition: () => number;
};

// The canvas covers the whole section, so whole shapes scroll with the page without any drawing.
// It only redraws while digits travel between slots.
export default function BinaryMorph({ getSlots, getPosition }: BinaryMorphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [sinYaw, cosYaw] = [Math.sin(BASE_YAW), Math.cos(BASE_YAW)];
    const [sinPitch, cosPitch] = [Math.sin(PITCH), Math.cos(PITCH)];

    let targets: Point[][] = [];
    let count = 0;
    let delays: number[] = [];
    let lifts: number[] = [];
    let spreads: { x: number; y: number }[] = [];
    let gridLayout: Layout | null = null;
    let slotCenters: { x: number; y: number }[] = [];
    let atlas: HTMLCanvasElement | null = null;
    let cellWidth = 0;
    let cellHeight = 0;
    let modelSize = 0;
    let position = 0;
    let drawnPosition = -1;
    let isVisible = true;

    const drawDigit = (bit: number, row: number, centerX: number, centerY: number, x: number, y: number, z: number) => {
      if (!atlas) return;
      const rotatedX = x * cosYaw + z * sinYaw;
      const rotatedZ = z * cosYaw - x * sinYaw;
      const screenY = y * cosPitch - rotatedZ * sinPitch;
      const depth = y * sinPitch + rotatedZ * cosPitch;
      const nearness = CAMERA_DISTANCE / (CAMERA_DISTANCE - depth);
      const width = (cellWidth * nearness) / ATLAS_SCALE;
      const height = (cellHeight * nearness) / ATLAS_SCALE;
      context.drawImage(
        atlas,
        bit * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight,
        centerX + rotatedX * modelSize * nearness - width / 2,
        centerY + screenY * modelSize * nearness - height / 2,
        width,
        height,
      );
    };

    const atlasRow = (light: number, isAccent?: boolean) => {
      const step = Math.round(clamp(light, 0, 1) * (DIGIT_LEVELS - 1));
      return isAccent ? DIGIT_LEVELS + step : step;
    };

    const drawAllShapes = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      targets.forEach((shape, index) => {
        shape.forEach((point, i) => {
          if (point.light < MIN_LIGHT) return;
          drawDigit(BITS[i % BITS.length], atlasRow(point.light, point.isAccent), slotCenters[index].x, slotCenters[index].y, point.x, point.y, point.z);
        });
      });
    };

    const draw = () => {
      if (!atlas || slotCenters.length < targets.length) return;
      drawnPosition = position;
      if (reducedMotion) {
        drawAllShapes();
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      const fromIndex = Math.min(Math.floor(position), targets.length - 2);
      const amount = position - fromIndex;
      const fromCenter = slotCenters[fromIndex];
      const toCenter = slotCenters[fromIndex + 1];

      for (let i = 0; i < count; i++) {
        const from = targets[fromIndex][i];
        const to = targets[fromIndex + 1][i];
        const progress = easeInOutCubic(clamp(amount * (1 + MAX_DELAY) - delays[i], 0, 1));
        const arc = Math.sin(Math.PI * progress);
        const light = from.light + (to.light - from.light) * progress;
        if (light < MIN_LIGHT) continue;

        const home = BITS[i % BITS.length];
        drawDigit(
          arc > 0.05 && Math.random() < 0.3 ? 1 - home : home,
          atlasRow(light * (1 - FLIGHT_FADE * arc), progress < 0.5 ? from.isAccent : to.isAccent),
          fromCenter.x + (toCenter.x - fromCenter.x) * progress,
          fromCenter.y + (toCenter.y - fromCenter.y) * progress,
          from.x + (to.x - from.x) * progress + arc * spreads[i].x,
          from.y + (to.y - from.y) * progress + arc * spreads[i].y,
          from.z + (to.z - from.z) * progress + arc * lifts[i],
        );
      }
    };

    const layout = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const slots = getSlots().map((slot) => slot.getBoundingClientRect());
      if (!canvasRect.width || !canvasRect.height || !slots.length) return;
      const scale = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(canvasRect.width * scale);
      canvas.height = Math.round(canvasRect.height * scale);
      slotCenters = slots.map((slot) => ({
        x: (slot.left + slot.width / 2 - canvasRect.left) * scale,
        y: (slot.top + slot.height / 2 - canvasRect.top) * scale,
      }));

      const modelWidth = Math.min(slots[0].width, slots[0].height * 1.25) * MODEL_SCALE;
      modelSize = (modelWidth / 2) * scale;
      const nextLayout = modelWidth >= FINE_MIN_WIDTH ? FINE : COARSE;
      if (nextLayout !== gridLayout) {
        gridLayout = nextLayout;
        targets = buildTargets(gridLayout);
        count = targets[0].length;
        delays = Array.from({ length: count }, () => Math.random() * MAX_DELAY);
        lifts = Array.from({ length: count }, () => (Math.random() - 0.5) * 1.1);
        spreads = Array.from({ length: count }, () => ({
          x: (Math.random() - 0.5) * SCATTER,
          y: (Math.random() - 0.5) * SCATTER,
        }));
      }
      const cssCell = modelWidth / gridLayout.columns;
      cellWidth = Math.round(cssCell * scale * ATLAS_SCALE);
      cellHeight = Math.round(cssCell * CELL_ASPECT * scale * ATLAS_SCALE);
      const styles = getComputedStyle(canvas);
      atlas = buildDigitAtlas(cellWidth, cellHeight, styles.color, styles.getPropertyValue("--digit-accent").trim());
      position = getPosition();
      draw();
    };

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);
    loadDigitFont().finally(layout);
    if (reducedMotion) return () => resizeObserver.disconnect();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    visibilityObserver.observe(canvas);

    let lastTime = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick);
      const elapsed = now - lastTime;
      lastTime = now;
      if (!isVisible) return;
      // The digits glide after the scroll position instead of jumping with every scroll tick.
      const target = getPosition();
      position += (target - position) * (1 - Math.exp(-elapsed / SMOOTHING_MS));
      if (Math.abs(target - position) < SETTLED) position = target;
      if (Math.abs(position - drawnPosition) > REDRAW_THRESHOLD) draw();
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [getSlots, getPosition]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
