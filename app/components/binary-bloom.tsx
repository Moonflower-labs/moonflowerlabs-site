import { useEffect, useRef } from "react";
import { BITS, buildDigitAtlas, DIGIT_LEVELS as LEVELS, loadDigitFont } from "@/lib/binary";

const TAU = Math.PI * 2;
const PETALS = 5;
const CORE_RING = 0.28;
const ACCENT_RIDGE = 0.4;
const MIN_ACCENT_SHADE = 0.75;
const TUBE_ROWS = 16;
const TUBE_DIGITS_PER_ROW = 5;
const TUBE_LENGTH = 0.6;
const TUBE_RADIUS = 0.035;
const TUBE_SHADE = 0.45;
const PLEAT_TWIST = 0.6;
const BUD_TWIST = 4.5;
const TRUMPET_DEPTH = 1.5;
const OPEN_LIFT = 0.4;
const RIDGE_HEIGHT = 0.15;
const FLOWER_SCALE = 0.76;
const CAMERA_DISTANCE = 3.4;

const BUD_TILT = 1.15;
const OPEN_TILT = 0.68;
const SWAY = 0.2;
const ROCK = 0.26;
const ROCK_PER_MS = 0.00042;
const SWAY_PER_MS = 0.0005;
const POINTER_TILT = 0.28;
const TILT_EASING = 0.08;

const HOLD_MS = 300;
const BLOOM_MS = 3800;
const FRAME_MS = 1000 / 30;

// Heat lights a digit up and makes it flicker, then fades back to its resting state.
const HEAT_FADE_PER_MS = 0.0009;
const ACCENT_HEAT = 0.6;
const FLICKER_CHANCE = 0.06;
const TWINKLE_SHARE = 0.00025;
const TWINKLE_HEAT = 0.4;
const POINTER_RADIUS = 80;
const RIPPLE_SPEED = 0.55;
const RIPPLE_BAND = 18;
const RIPPLE_HEAT = 0.5;
const RIPPLE_MS = 1100;

const ATLAS_SCALE = 2;

type Digit = {
  ring: number;
  angle: number;
  bit: number;
  shownBit: number;
  shade: number;
  isAccent: boolean;
  heat: number;
  // How far along the tube behind the flower this digit sits, or null for a petal digit.
  tube: number | null;
};

type Point = { x: number; y: number };
type Ripple = Point & { startTime: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(from: number, to: number, value: number) {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function pleatAngle(ring: number, angle: number) {
  return angle + PLEAT_TWIST * (1 - ring) ** 1.5;
}

// The open flower's outline: five points where the ridges reach the rim.
function rimRadius(angle: number) {
  const ridge = Math.abs(Math.cos((PETALS * angle) / 2));
  return 0.72 + 0.16 * ridge ** 1.5 + 0.12 * ridge ** 10;
}

// Light across the folds, with bright ridges and a throat that falls into shadow.
function surfaceShade(ring: number, angle: number) {
  const pleat = pleatAngle(ring, angle);
  const ridgeDistance = Math.abs(Math.sin((PETALS * pleat) / 2));
  const ridgeWidth = 0.05 + 0.2 * (1 - ring ** 2);
  const ridge = Math.exp(-((ridgeDistance / ridgeWidth) ** 2));
  const fold = 0.46 + 0.26 * Math.sin(PETALS * pleat);
  const rim = 0.3 * smoothstep(0.9, 1, ring);
  const depth = 0.45 + 0.55 * smoothstep(0.08, 0.6, ring);
  const isAccent = ring < CORE_RING || ridge > ACCENT_RIDGE;
  const shade = Math.min(1, Math.max(ridge, (fold + rim) * depth));
  return { shade: isAccent ? Math.max(shade, MIN_ACCENT_SHADE) : shade, isAccent };
}

function buildDigits(radius: number, spacing: number) {
  const digits: Digit[] = [];
  const rings = Math.round(radius / (spacing * 1.25));
  let bitIndex = 0;
  for (let index = 1; index <= rings; index++) {
    const ring = index / rings;
    const count = Math.max(8, Math.round((TAU * ring * radius) / spacing));
    for (let step = 0; step < count; step++) {
      const angle = ((step + (index % 2) / 2) / count) * TAU;
      const { shade, isAccent } = surfaceShade(ring, angle);
      const bit = BITS[bitIndex++ % BITS.length];
      digits.push({
        ring,
        angle,
        bit,
        shownBit: bit,
        shade,
        isAccent,
        heat: 0,
        tube: null,
      });
    }
  }
  // A thin stem that carries on from the narrow end of the cup.
  for (let row = 0; row < TUBE_ROWS; row++) {
    const tube = row / (TUBE_ROWS - 1);
    for (let step = 0; step < TUBE_DIGITS_PER_ROW; step++) {
      const angle = ((step + (row % 2) / 2) / TUBE_DIGITS_PER_ROW) * TAU;
      const bit = BITS[bitIndex++ % BITS.length];
      digits.push({ ring: 0, angle, bit, shownBit: bit, shade: TUBE_SHADE, isAccent: true, heat: 0, tube });
    }
  }
  return digits;
}

export default function BinaryBloom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(canvas);
    const silver = styles.getPropertyValue("--foreground").trim();
    const accent = styles.getPropertyValue("--flower-accent").trim();

    let digits: Digit[] = [];
    let atlas: HTMLCanvasElement | null = null;
    let cellWidth = 0;
    let cellHeight = 0;
    let scale = 1;
    let bloom = reducedMotion ? 1 : 0;
    let isVisible = true;
    let pointer: Point | null = null;
    let ripples: Ripple[] = [];
    let tiltX = 0;
    let tiltY = 0;
    const bloomEnd = performance.now() + HOLD_MS + BLOOM_MS;

    const heatDigit = (digit: Digit, screenX: number, screenY: number, now: number) => {
      const reach = POINTER_RADIUS * scale;
      if (pointer) {
        const distance = Math.hypot(screenX - pointer.x, screenY - pointer.y);
        if (distance < reach) digit.heat = Math.max(digit.heat, Math.min(1, 1.6 * (1 - distance / reach)));
      }
      for (const ripple of ripples) {
        const age = now - ripple.startTime;
        const distance = Math.hypot(screenX - ripple.x, screenY - ripple.y);
        if (Math.abs(distance - age * RIPPLE_SPEED * scale) < RIPPLE_BAND * scale) {
          digit.heat = Math.max(digit.heat, RIPPLE_HEAT * (1 - age / RIPPLE_MS));
        }
      }
      if (Math.random() < TWINKLE_SHARE) digit.heat = Math.max(digit.heat, TWINKLE_HEAT);

      if (digit.heat > 0) {
        digit.heat = Math.max(0, digit.heat - FRAME_MS * HEAT_FADE_PER_MS);
        if (digit.heat === 0) digit.shownBit = digit.bit;
        else if (Math.random() < FLICKER_CHANCE) digit.shownBit = 1 - digit.shownBit;
      }
    };

    const draw = (now: number) => {
      if (!atlas) return;
      context.clearRect(0, 0, canvas.width, canvas.height);

      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;
      const size = Math.min(halfWidth, halfHeight) * FLOWER_SCALE * CAMERA_DISTANCE;
      const sway = reducedMotion ? 0 : Math.sin(now * SWAY_PER_MS) * SWAY * bloom;
      // The slow rock tips the flower forward from its resting angle to show the cup and stem.
      const rockTime = Math.max(0, now - bloomEnd);
      const rock = reducedMotion ? 0 : ((1 - Math.cos(rockTime * ROCK_PER_MS)) / 2) * ROCK * bloom;
      const pitch = mix(BUD_TILT, OPEN_TILT, bloom) + rock + tiltX;
      const yaw = sway + tiltY;
      const sinPitch = Math.sin(pitch);
      const cosPitch = Math.cos(pitch);
      const sinYaw = Math.sin(yaw);
      const cosYaw = Math.cos(yaw);

      for (const digit of digits) {
        const { ring, angle } = digit;
        // The rim opens first, then the opening works its way down to the throat.
        const opening = clamp(bloom * 1.3 - (1 - ring) * 0.3, 0, 1);

        let radius: number;
        let turned = angle;
        let height: number;
        if (digit.tube === null) {
          const budRadius = 0.13 * Math.sin(Math.PI * ring ** 0.75) + 0.015;
          radius = mix(budRadius, ring * rimRadius(angle), opening);
          turned = angle + BUD_TWIST * (1 - opening) * ring;
          const ridge = RIDGE_HEIGHT * ring ** 1.2 * Math.cos(PETALS * pleatAngle(ring, angle));
          const openHeight = -TRUMPET_DEPTH * (1 - ring) ** 2 + ridge;
          height = mix(-0.55 + 1.2 * ring, openHeight, opening);
        } else {
          radius = TUBE_RADIUS;
          height = mix(-0.55, -TRUMPET_DEPTH * 0.92, opening) - digit.tube * TUBE_LENGTH;
        }

        height += OPEN_LIFT * bloom;
        const x = radius * Math.cos(turned);
        const y = radius * Math.sin(turned);

        const rotatedX = x * cosYaw + height * sinYaw;
        const rotatedZ = height * cosYaw - x * sinYaw;
        const screenY = y * cosPitch - rotatedZ * sinPitch;
        const depth = y * sinPitch + rotatedZ * cosPitch;

        const nearness = CAMERA_DISTANCE / (CAMERA_DISTANCE - depth);
        const centerX = halfWidth + (rotatedX * size * nearness) / CAMERA_DISTANCE;
        const centerY = halfHeight + (screenY * size * nearness) / CAMERA_DISTANCE;

        if (bloom >= 1 && !reducedMotion) heatDigit(digit, centerX, centerY, now);

        // Digits further from the camera sit dimmer, which is most of the sense of depth.
        const depthLight = digit.isAccent ? 1 : 0.62 + 0.38 * smoothstep(-0.7, 0.5, depth);
        // A closed bud packs many digits into a small space, so they start dimmer.
        const crowding = mix(0.35, 1, opening);
        const brightness = Math.max(digit.heat, digit.shade * depthLight * crowding);
        const step = Math.round(brightness * (LEVELS - 1));
        const row = digit.isAccent || digit.heat >= ACCENT_HEAT ? LEVELS + step : step;

        const drawWidth = (cellWidth * nearness) / ATLAS_SCALE;
        const drawHeight = (cellHeight * nearness) / ATLAS_SCALE;
        context.drawImage(
          atlas,
          digit.shownBit * cellWidth,
          row * cellHeight,
          cellWidth,
          cellHeight,
          centerX - drawWidth / 2,
          centerY - drawHeight / 2,
          drawWidth,
          drawHeight,
        );
      }
    };

    const layout = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const cssCellWidth = clamp(width / 90, 5, 8);
      cellWidth = Math.round(cssCellWidth * scale * ATLAS_SCALE);
      cellHeight = Math.round(cssCellWidth * 1.5 * scale * ATLAS_SCALE);
      atlas = buildDigitAtlas(cellWidth, cellHeight, silver, accent);

      const radius = (Math.min(width, height) / 2) * FLOWER_SCALE;
      digits = buildDigits(radius, cssCellWidth * 1.15);
      draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);
    loadDigitFont().finally(layout);

    if (reducedMotion) return () => resizeObserver.disconnect();

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    visibilityObserver.observe(canvas);

    const pointerPosition = (event: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * scale, y: (event.clientY - rect.top) * scale };
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer = pointerPosition(event);
    };
    const onPointerDown = (event: PointerEvent) => {
      pointer = pointerPosition(event);
      ripples.push({ ...pointer, startTime: performance.now() });
    };
    const onPointerEnd = () => {
      pointer = null;
    };
    // A finger lifting has no hover state to keep, unlike a mouse button.
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") onPointerEnd();
    };
    // Without this, a long press on the flower starts selecting the text around it.
    const onSelectStart = (event: Event) => event.preventDefault();
    canvas.addEventListener("selectstart", onSelectStart);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerEnd);
    canvas.addEventListener("pointercancel", onPointerEnd);

    const startTime = performance.now();
    let lastFrame = startTime;
    let frame = requestAnimationFrame(function tick(now) {
      frame = requestAnimationFrame(tick);
      if (!isVisible || now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      bloom = easeInOutCubic(clamp((now - startTime - HOLD_MS) / BLOOM_MS, 0, 1));
      ripples = ripples.filter((ripple) => now - ripple.startTime < RIPPLE_MS);

      // The flower leans gently towards the pointer.
      const targetX = pointer ? (pointer.y / canvas.height - 0.5) * POINTER_TILT : 0;
      const targetY = pointer ? (pointer.x / canvas.width - 0.5) * POINTER_TILT : 0;
      tiltX += (targetX - tiltX) * TILT_EASING;
      tiltY += (targetY - tiltY) * TILT_EASING;

      draw(now);
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("selectstart", onSelectStart);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerEnd);
      canvas.removeEventListener("pointercancel", onPointerEnd);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="block size-full touch-pan-y touch-pinch-zoom select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]" />;
}
