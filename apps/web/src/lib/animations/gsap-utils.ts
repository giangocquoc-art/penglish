import { gsap } from "gsap";

type AnimationTarget = gsap.TweenTarget;
type Killable = gsap.core.Tween | gsap.core.Timeline | null | undefined;

type SizedTarget = {
  length?: number;
  size?: number;
};

function normalizeAnimationTarget(target: AnimationTarget): AnimationTarget | null {
  if (!target) {
    return null;
  }

  if (Array.isArray(target)) {
    const filteredTarget = target.filter(Boolean);
    return filteredTarget.length > 0 ? (filteredTarget as AnimationTarget) : null;
  }

  const sizedTarget = target as SizedTarget;
  if (typeof sizedTarget.length === "number" && sizedTarget.length === 0) {
    return null;
  }

  if (typeof sizedTarget.size === "number" && sizedTarget.size === 0) {
    return null;
  }

  return target;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function safeGsapSet(
  target: AnimationTarget,
  vars: gsap.TweenVars,
): gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  return gsap.set(safeTarget, vars);
}

export function createFloatLoop(
  target: AnimationTarget,
  options: {
    y?: number;
    x?: number;
    rotation?: number;
    duration?: number;
    delay?: number;
  } = {},
): gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  if (prefersReducedMotion()) {
    return safeGsapSet(safeTarget, { x: 0, y: 0, rotate: 0 });
  }

  return gsap.to(safeTarget, {
    x: options.x ?? 0,
    y: options.y ?? -10,
    rotate: options.rotation ?? 0,
    duration: options.duration ?? 2.8,
    delay: options.delay ?? 0,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    force3D: true,
  });
}

export function createBubbleLoop(
  target: AnimationTarget,
  options: {
    y?: number;
    x?: number;
    scale?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
  } = {},
): gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  if (prefersReducedMotion()) {
    return safeGsapSet(safeTarget, { autoAlpha: 0.85, x: 0, y: 0, scale: 1 });
  }

  return gsap.to(safeTarget, {
    y: options.y ?? -18,
    x: options.x ?? 4,
    scale: options.scale ?? 1.08,
    autoAlpha: 0.92,
    duration: options.duration ?? 3.4,
    delay: options.delay ?? 0,
    stagger: options.stagger ?? 0.18,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    force3D: true,
  });
}

export function createCardEntrance(
  target: AnimationTarget,
  options: {
    y?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
  } = {},
): gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  if (prefersReducedMotion()) {
    return safeGsapSet(safeTarget, { autoAlpha: 1, y: 0, scale: 1 });
  }

  return gsap.fromTo(
    safeTarget,
    { autoAlpha: 0, y: options.y ?? 16, scale: 0.98 },
    {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: options.duration ?? 0.42,
      delay: options.delay ?? 0,
      stagger: options.stagger ?? 0.06,
      ease: "power2.out",
      force3D: true,
    },
  );
}

export function createCorrectAnswerBurst(
  target: AnimationTarget,
  options: {
    duration?: number;
    scale?: number;
  } = {},
): gsap.core.Timeline | gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  if (prefersReducedMotion()) {
    return safeGsapSet(safeTarget, { autoAlpha: 1, scale: 1, rotate: 0 });
  }

  return gsap
    .timeline({ defaults: { force3D: true } })
    .to(safeTarget, {
      scale: options.scale ?? 1.08,
      autoAlpha: 1,
      duration: options.duration ?? 0.16,
      ease: "back.out(2)",
    })
    .to(safeTarget, {
      scale: 1,
      duration: options.duration ?? 0.2,
      ease: "power2.out",
    });
}

export function createWrongAnswerShake(
  target: AnimationTarget,
  options: {
    x?: number;
    duration?: number;
  } = {},
): gsap.core.Timeline | gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  if (prefersReducedMotion()) {
    return safeGsapSet(safeTarget, { x: 0, autoAlpha: 1 });
  }

  return gsap
    .timeline({ defaults: { duration: options.duration ?? 0.07, ease: "power1.inOut", force3D: true } })
    .to(safeTarget, { x: -(options.x ?? 8) })
    .to(safeTarget, { x: options.x ?? 8 })
    .to(safeTarget, { x: -(options.x ?? 5) })
    .to(safeTarget, { x: options.x ?? 5 })
    .to(safeTarget, { x: 0, duration: options.duration ?? 0.09 });
}

export function createTranscriptHighlight(
  target: AnimationTarget,
  options: {
    scale?: number;
    duration?: number;
    color?: string;
  } = {},
): gsap.core.Timeline | gsap.core.Tween | null {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return null;
  }

  if (prefersReducedMotion()) {
    return safeGsapSet(safeTarget, { autoAlpha: 1, scale: 1 });
  }

  const timeline = gsap.timeline({ defaults: { force3D: true } });

  timeline
    .to(safeTarget, {
      autoAlpha: 1,
      scale: options.scale ?? 1.03,
      duration: options.duration ?? 0.18,
      color: options.color,
      ease: "power2.out",
    })
    .to(safeTarget, {
      scale: 1,
      duration: options.duration ?? 0.22,
      ease: "power2.out",
    });

  return timeline;
}

export function killTimeline(timeline: Killable): void {
  timeline?.kill();
}

export function killTweensOf(target: AnimationTarget): void {
  const safeTarget = normalizeAnimationTarget(target);
  if (!safeTarget) {
    return;
  }

  gsap.killTweensOf(safeTarget);
}
