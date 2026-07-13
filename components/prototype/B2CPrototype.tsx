"use client";

import {
  ArrowRight,
  CheckCircle2,
  Moon,
  RefreshCcw,
  Send,
  Sparkles,
  Sun,
} from "lucide-react";
import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  constellationConfigs,
  prototypeSuggestions,
  routeKey,
  type ConstellationConfig,
  type CourseKey,
  type PrototypePhase,
  type PrototypeTheme,
} from "@/lib/prototype";
import type { GeneratedCourse, LearnerLevel } from "@/lib/course";
import {
  COURSE_SESSION_KEY,
  createCourseSession,
  parseCourseSession,
  toggleCourseDay,
  type CourseSession,
} from "@/lib/course-session";
import { LearnerOnboarding } from "./LearnerOnboarding";
import { LEARNER_SNAPSHOT_KEY, parseLearnerSnapshot, type LearnerSnapshot } from "@/lib/learner-snapshot";

type ThemeVars = CSSProperties & Record<`--${string}`, string>;

type NodePoint = {
  x: number;
  y: number;
};

type BuiltCluster = {
  cfg: ConstellationConfig;
  nodes: NodePoint[];
  links: Array<[number, number]>;
  traj: NodePoint[];
  camScale: number;
};

type Star = {
  x: number;
  y: number;
  r: number;
  sp: number;
  ph: number;
  vx: number;
};

const themeVars: Record<PrototypeTheme, ThemeVars> = {
  dark: {
    "--page": "#06070f",
    "--text": "#EEF0F8",
    "--text-2": "rgba(238,240,248,0.64)",
    "--text-3": "rgba(238,240,248,0.42)",
    "--accent": "#8B6BFF",
    "--accent-grad": "linear-gradient(135deg,#8B6BFF,#6E8BFF)",
    "--accent-key": "#b9a8ff",
    "--accent-tint": "rgba(139,107,255,0.1)",
    "--accent-tint-2": "rgba(139,107,255,0.25)",
    "--cyan": "#5ED6E6",
    "--glass": "rgba(16,18,32,0.72)",
    "--glass-border": "rgba(150,160,220,0.2)",
    "--pill": "rgba(255,255,255,0.03)",
    "--panel": "#0e101c",
    "--panel-border": "rgba(150,160,220,0.14)",
    "--chip-bg": "#141626",
    "--node-rest-bg": "#111321",
    "--node-rest-border": "rgba(150,160,220,0.25)",
    "--line": "linear-gradient(180deg,rgba(150,160,220,0.3),rgba(150,160,220,0.04))",
    "--badge-bg": "rgba(139,107,255,0.16)",
    "--badge-border": "rgba(139,107,255,0.3)",
    "--lesson-grad": "linear-gradient(180deg, #18162a, #0d0e1a)",
    "--lesson-border": "rgba(139,120,255,0.28)",
    "--course-bg": "radial-gradient(110% 80% at 50% -5%, rgba(28,24,54,0.62), rgba(6,7,15,0.93))",
    "--vignette": "radial-gradient(125% 95% at 50% 44%, rgba(6,7,15,0) 32%, rgba(6,7,15,0.55) 100%)",
    "--input-shadow": "0 24px 70px -24px rgba(90,70,220,0.55), 0 0 70px -20px rgba(120,90,255,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
    "--placeholder": "rgba(238,240,248,0.32)",
    "--panel-shadow": "0 22px 56px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
    "--lesson-shadow": "0 0 50px -24px rgba(120,100,255,0.5), 0 24px 56px -24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
    "--chip-shadow": "0 8px 20px -12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
    "--node-rest-shadow": "inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  light: {
    "--page": "#eef0fa",
    "--text": "#191c2e",
    "--text-2": "rgba(25,28,46,0.66)",
    "--text-3": "rgba(25,28,46,0.5)",
    "--accent": "#6A50DC",
    "--accent-grad": "linear-gradient(135deg,#7A5BF0,#5E78F0)",
    "--accent-key": "#6A50DC",
    "--accent-tint": "rgba(106,80,220,0.09)",
    "--accent-tint-2": "rgba(106,80,220,0.2)",
    "--cyan": "#1F97A6",
    "--glass": "rgba(255,255,255,0.62)",
    "--glass-border": "rgba(255,255,255,0.85)",
    "--pill": "rgba(255,255,255,0.55)",
    "--panel": "#ffffff",
    "--panel-border": "rgba(255,255,255,0.8)",
    "--chip-bg": "#ffffff",
    "--node-rest-bg": "#ffffff",
    "--node-rest-border": "rgba(255,255,255,0.9)",
    "--line": "linear-gradient(180deg,rgba(106,116,180,0.4),rgba(106,116,180,0.08))",
    "--badge-bg": "rgba(106,80,220,0.12)",
    "--badge-border": "rgba(106,80,220,0.3)",
    "--lesson-grad": "linear-gradient(180deg, #ffffff, #f4f5ff)",
    "--lesson-border": "rgba(255,255,255,0.85)",
    "--course-bg": "radial-gradient(58% 48% at 24% 4%, rgba(140,118,255,0.28), transparent 62%), radial-gradient(52% 46% at 92% 22%, rgba(110,128,255,0.18), transparent 60%), radial-gradient(62% 56% at 82% 96%, rgba(94,214,230,0.2), transparent 60%), linear-gradient(180deg, #edeffb 0%, #e6e8f6 100%)",
    "--vignette": "radial-gradient(125% 95% at 50% 44%, rgba(238,240,250,0) 38%, rgba(228,231,246,0.45) 100%)",
    "--input-shadow": "0 28px 60px -26px rgba(90,70,220,0.38), 0 4px 14px -6px rgba(60,60,120,0.16), inset 0 1px 0 rgba(255,255,255,0.85)",
    "--placeholder": "rgba(25,28,46,0.4)",
    "--panel-shadow": "0 24px 54px -20px rgba(64,60,130,0.3), 0 6px 16px -8px rgba(64,60,130,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
    "--lesson-shadow": "0 30px 66px -22px rgba(106,80,220,0.42), 0 8px 18px -8px rgba(64,60,130,0.16), inset 0 1px 0 rgba(255,255,255,1)",
    "--chip-shadow": "0 10px 22px -12px rgba(64,60,130,0.24), inset 0 1px 0 rgba(255,255,255,0.95)",
    "--node-rest-shadow": "0 4px 10px -4px rgba(64,60,130,0.22), inset 0 1px 0 rgba(255,255,255,0.95)",
  },
};

const canvasPalette = {
  dark: {
    bg: ["#0c0e1d", "#080a16", "#05060e"],
    glow: "rgba(120,90,255,0.07)",
    star: "205,212,255",
    starA: 1,
    decor: "#4a5480",
    core: "#ffffff",
    tag: "rgba(232,235,250,0.92)",
    labelOn: "#ffffff",
    labelOff: "rgba(200,206,235,0.7)",
    num: "#ffffff",
  },
  light: {
    bg: ["#f3f4fc", "#e9ebf8", "#e0e3f3"],
    glow: "rgba(120,90,255,0.06)",
    star: "120,128,180",
    starA: 0.5,
    decor: "#aeb4d6",
    core: "#ffffff",
    tag: "rgba(34,38,64,0.9)",
    labelOn: "#1a1d31",
    labelOff: "rgba(60,66,104,0.72)",
    num: "#ffffff",
  },
};

function hexA(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);

  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function quietZoneFactor(x: number, y: number, width: number, height: number, phase: PrototypePhase) {
  if (phase !== "idle") {
    return 1;
  }

  const isNarrow = width < 600;
  const cx = width / 2;
  const cy = isNarrow ? height * 0.42 : height * 0.48;
  const rx = isNarrow ? width * 0.95 : Math.max(220, Math.min(width * 0.48, 500));
  const ry = isNarrow ? height * 0.38 : Math.max(260, Math.min(height * 0.44, 360));
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  const distance = dx * dx + dy * dy;

  if (distance >= 1.2) {
    return 1;
  }

  return Math.max(isNarrow ? 0.02 : 0.05, Math.min(1, distance * (isNarrow ? 0.35 : 0.75)));
}

function buildClusters(): BuiltCluster[] {
  return constellationConfigs.map((cfg) => {
    const nodes: NodePoint[] = [];

    for (let i = 0; i < cfg.count; i += 1) {
      const angle = i * 2.39996 + cfg.cx * 0.013;
      const ring = i % 2 === 0 ? 1 : 1.65;
      const radius = 24 + ring * 22 + ((i * 7) % 16);

      nodes.push({
        x: cfg.cx + Math.cos(angle) * radius,
        y: cfg.cy + Math.sin(angle) * radius,
      });
    }

    const links: Array<[number, number]> = [];
    for (let i = 1; i < cfg.count; i += 1) {
      links.push([i - 1, i]);
    }

    if (cfg.count > 3) {
      links.push([0, cfg.count - 1]);
    }

    if (cfg.count > 4) {
      links.push([1, cfg.count - 2]);
    }

    const spacing = Math.min(58, 360 / Math.max(1, cfg.count - 1));
    const totalH = (cfg.count - 1) * spacing;
    const traj = Array.from({ length: cfg.count }, (_, i) => ({
      x: cfg.cx,
      y: cfg.cy - totalH / 2 + i * spacing,
    }));

    return {
      cfg,
      nodes,
      links,
      traj,
      camScale: Math.max(1.45, Math.min(2, 680 / (totalH + 60))),
    };
  });
}

export function B2CPrototype() {
  const [phase, setPhase] = useState<PrototypePhase>("idle");
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<LearnerLevel>("beginner");
  const [activeCourse, setActiveCourse] = useState<CourseKey>("ai");
  const [theme, setTheme] = useState<PrototypeTheme>("dark");
  const [session, setSession] = useState<CourseSession | null>(null);
  const [learnerSnapshot, setLearnerSnapshot] = useState<LearnerSnapshot | null>(null);
  const [hasHydratedSession, setHasHydratedSession] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clustersRef = useRef<BuiltCluster[]>([]);
  const starsRef = useRef<Star[]>([]);
  const themeRef = useRef(theme);
  const phaseRef = useRef(phase);
  const hoverActiveRef = useRef<CourseKey | null>(null);
  const lockedIdRef = useRef<CourseKey | null>(null);
  const homeScaleRef = useRef(0.8);
  const assembleRef = useRef(0);
  const assembleTargetRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const cameraRef = useRef({ x: 790, y: 470, scale: 0.8 });
  const cameraTargetRef = useRef({ x: 790, y: 470, scale: 0.8 });

  const course = session?.course;
  const modules = useMemo(
    () =>
      (course?.days ?? []).map((module) => ({
        ...module,
        label: `День ${module.day}`,
      })),
    [course],
  );

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const restoredSession = parseCourseSession(window.sessionStorage.getItem(COURSE_SESSION_KEY));
    const restoredSnapshot = parseLearnerSnapshot(window.sessionStorage.getItem(LEARNER_SNAPSHOT_KEY));

    if (restoredSession) {
      setSession(restoredSession);
      setPhase("course");
    }
    if (restoredSnapshot) setLearnerSnapshot(restoredSnapshot);

    setHasHydratedSession(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedSession) {
      return;
    }

    try {
      if (session) {
        window.sessionStorage.setItem(COURSE_SESSION_KEY, JSON.stringify(session));
      } else {
        window.sessionStorage.removeItem(COURSE_SESSION_KEY);
      }
    } catch {
      // The prototype remains usable when browser storage is unavailable.
    }
  }, [hasHydratedSession, session]);

  useEffect(() => {
    if (!hasHydratedSession) return;
    if (learnerSnapshot) window.sessionStorage.setItem(LEARNER_SNAPSHOT_KEY, JSON.stringify(learnerSnapshot));
  }, [hasHydratedSession, learnerSnapshot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    clustersRef.current = buildClusters();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      homeScaleRef.current = Math.max(0.62, Math.min(w / 1620, h / 980));

      if (phaseRef.current === "idle") {
        cameraRef.current.scale = homeScaleRef.current;
        cameraTargetRef.current.scale = homeScaleRef.current;
      }

      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: 150 }, () => ({
          x: Math.random(),
          y: Math.random(),
          r: 0.5 + Math.random() * 1.3,
          sp: 0.0006 + Math.random() * 0.0016,
          ph: Math.random() * 6.28,
          vx: (Math.random() - 0.5) * 0.00004,
        }));
      }
    };

    const toScreen = (wx: number, wy: number, bx: number, by: number) => ({
      x: (wx - cameraRef.current.x) * cameraRef.current.scale + sizeRef.current.w / 2 + bx,
      y: (wy - cameraRef.current.y) * cameraRef.current.scale + sizeRef.current.h / 2 + by,
    });

    const loop = (t: number) => {
      const { w, h } = sizeRef.current;
      const camera = cameraRef.current;
      const target = cameraTargetRef.current;
      const pal = canvasPalette[themeRef.current];

      camera.x += (target.x - camera.x) * 0.055;
      camera.y += (target.y - camera.y) * 0.055;
      camera.scale += (target.scale - camera.scale) * 0.06;
      assembleRef.current += (assembleTargetRef.current - assembleRef.current) * 0.045;

      let bx = 0;
      let by = 0;

      const currentPhase = phaseRef.current;

      if (currentPhase === "idle") {
        bx = Math.sin(t * 0.0004) * 8;
        by = Math.cos(t * 0.00033) * 6;
      }

      const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.95);
      bg.addColorStop(0, pal.bg[0]);
      bg.addColorStop(0.55, pal.bg[1]);
      bg.addColorStop(1, pal.bg[2]);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.16, 0, w * 0.5, h * 0.16, h * 0.7);
      glow.addColorStop(0, pal.glow);
      glow.addColorStop(1, "rgba(120,90,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      for (const star of starsRef.current) {
        star.x += star.vx;
        if (star.x > 1) star.x -= 1;
        if (star.x < 0) star.x += 1;

        const sx = star.x * w - bx * 0.25;
        const sy = star.y * h - by * 0.25;
        const quiet = quietZoneFactor(sx, sy, w, h, currentPhase);
        const alpha = (0.25 + (Math.sin(t * star.sp + star.ph) * 0.5 + 0.5) * 0.5) * pal.starA * quiet;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${pal.star})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      const activeId = phaseRef.current === "idle" ? hoverActiveRef.current : lockedIdRef.current;
      const assemble = assembleRef.current;
      const ordered = [...clustersRef.current].sort(
        (a, b) => (a.cfg.id === lockedIdRef.current ? 1 : 0) - (b.cfg.id === lockedIdRef.current ? 1 : 0),
      );

      for (const cluster of ordered) {
        const isActive = cluster.cfg.id === activeId;
        const isLocked = cluster.cfg.id === lockedIdRef.current;
        const decorative = cluster.cfg.color === "#4a5480";
        const color = decorative ? pal.decor : cluster.cfg.color;
        let alpha = decorative ? 0.5 : 0.82;

        if (activeId) {
          alpha = isActive ? 1 : (decorative ? 0.5 : 0.78) * 0.22;
        }

        if (assemble > 0.02 && !isLocked) {
          alpha *= 1 - assemble * 0.92;
        }

        if (alpha < 0.012) {
          continue;
        }

        const positions = cluster.nodes.map((node, i) => {
          if (isLocked && assemble > 0.01 && cluster.traj[i]) {
            return {
              x: node.x + (cluster.traj[i].x - node.x) * assemble,
              y: node.y + (cluster.traj[i].y - node.y) * assemble,
            };
          }

          return node;
        });

        ctx.lineWidth = Math.max(0.6, 0.85 * camera.scale);

        for (const [from, to] of cluster.links) {
          const p = toScreen(positions[from].x, positions[from].y, bx, by);
          const q = toScreen(positions[to].x, positions[to].y, bx, by);
          const quiet = quietZoneFactor((p.x + q.x) / 2, (p.y + q.y) / 2, w, h, currentPhase);

          ctx.strokeStyle = hexA(color, alpha * 0.4 * quiet);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }

        const baseR = isActive ? 6 : 4;
        for (let i = 0; i < positions.length; i += 1) {
          const p = toScreen(positions[i].x, positions[i].y, bx, by);
          const r = baseR * camera.scale;
          const quiet = quietZoneFactor(p.x, p.y, w, h, currentPhase);
          const nodeAlpha = alpha * quiet;

          ctx.save();
          ctx.globalAlpha = nodeAlpha;
          ctx.shadowColor = color;
          ctx.shadowBlur = (isActive ? 22 : 12) * Math.min(1, camera.scale) * quiet;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = nodeAlpha * 0.9;
          ctx.fillStyle = pal.core;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.38, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (isLocked && assemble > 0.55) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, (assemble - 0.55) / 0.3) * quiet;
            ctx.fillStyle = pal.num;
            ctx.font = `600 ${12 * Math.min(1.4, camera.scale)}px Manrope, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(i + 1), p.x, p.y + 0.5);
            ctx.restore();
          }

          if (isActive && assemble < 0.32 && cluster.cfg.tags?.[i]) {
            ctx.save();
            ctx.globalAlpha = ((0.32 - assemble) / 0.32) * 0.95 * alpha * quiet;
            ctx.fillStyle = pal.tag;
            ctx.font = "500 12px Manrope, sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(cluster.cfg.tags[i], p.x + r + 6, p.y);
            ctx.restore();
          }
        }

        if (!isLocked || assemble < 0.2) {
          const c = toScreen(cluster.cfg.cx, cluster.cfg.cy - 78, bx, by);
          const quiet = quietZoneFactor(c.x, c.y, w, h, currentPhase);
          ctx.save();
          ctx.globalAlpha = alpha * (isActive ? 0.95 : 0.6) * quiet;
          ctx.fillStyle = isActive ? pal.labelOn : pal.labelOff;
          ctx.font = `${isActive ? "600" : "500"} ${isActive ? 14 : 12.5}px Manrope, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(cluster.cfg.label, c.x, c.y);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      if (transitionRef.current) {
        clearTimeout(transitionRef.current);
      }
    };
  }, []);

  const submit = async (value = query) => {
    const topic = value.trim();

    if (!topic || isGenerating || !learnerSnapshot) {
      return;
    }

    const key = routeKey(value.trim()) ?? "ai";
    const cluster = clustersRef.current.find((item) => item.cfg.id === key);

    setGenerationError(null);
    setIsGenerating(true);
    hoverActiveRef.current = null;
    lockedIdRef.current = key;
    assembleTargetRef.current = 1;
    setActiveCourse(key);
    setPhase("assembling");

    if (cluster) {
      cameraTargetRef.current = {
        x: cluster.cfg.cx,
        y: cluster.cfg.cy,
        scale: cluster.camScale,
      };
    }

    try {
      const response = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          ...(goal.trim() ? { courseGoal: goal.trim() } : {}),
          topicFamiliarity: level,
          learnerSnapshot,
        }),
      });
      const result = (await response.json()) as { course?: GeneratedCourse; error?: string };

      if (!response.ok || !result.course) {
        throw new Error(result.error ?? "Не удалось собрать карту. Попробуйте ещё раз.");
      }

      setSession(createCourseSession(result.course));
      setPhase("course");
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Не удалось собрать карту. Попробуйте ещё раз.",
      );
      lockedIdRef.current = null;
      assembleTargetRef.current = 0;
      setPhase("idle");
    } finally {
      setIsGenerating(false);
    }
  };

  const restart = () => {
    if (transitionRef.current) {
      clearTimeout(transitionRef.current);
    }

    lockedIdRef.current = null;
    hoverActiveRef.current = null;
    assembleTargetRef.current = 0;
    cameraTargetRef.current = {
      x: 790,
      y: 470,
      scale: homeScaleRef.current,
    };
    setQuery("");
    setGoal("");
    setLevel("beginner");
    setSession(null);
    setGenerationError(null);
    setPhase("idle");
  };

  const onInput = (value: string) => {
    setQuery(value);
    setGenerationError(null);
    hoverActiveRef.current = routeKey(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      void submit();
    }
  };

  const pickSuggestion = (label: string) => {
    setQuery(label);
    hoverActiveRef.current = routeKey(label);
    void submit(label);
  };

  const openCurrentCourse = () => {
    if (!session) {
      return;
    }

    lockedIdRef.current = activeCourse;
    assembleTargetRef.current = 1;
    setPhase("course");
  };

  const toggleDay = (day: number) => {
    if (session) {
      setSession(toggleCourseDay(session, day));
    }
  };

  const resetProfile = () => {
    window.sessionStorage.removeItem(LEARNER_SNAPSHOT_KEY);
    setSession(null);
    setLearnerSnapshot(null);
  };

  if (hasHydratedSession && !learnerSnapshot) {
    return <main className="prototype-screen min-h-[100svh] bg-[var(--page)]" style={themeVars[theme]}><LearnerOnboarding onComplete={setLearnerSnapshot} /></main>;
  }

  const activeCluster = constellationConfigs.find((item) => item.id === activeCourse);
  const activeColor = activeCluster?.color ?? "#8B6BFF";
  const themeLabel = theme === "dark" ? "Светлая тема" : "Темная тема";
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <main
      className="prototype-screen relative min-h-[100svh] overflow-hidden bg-[var(--page)] text-[var(--text)] transition-colors duration-500"
      style={themeVars[theme]}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[var(--vignette)] transition-colors duration-500" />

      <button
        type="button"
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        className="prototype-control absolute left-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass)] px-4 py-2 text-sm font-medium text-[var(--text-2)] backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--text)] sm:left-7 sm:top-6"
      >
        <ThemeIcon aria-hidden className="size-4" />
        {themeLabel}
      </button>

      {session ? (
        <button
          type="button"
          onClick={openCurrentCourse}
          className="prototype-control absolute right-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass)] px-4 py-2 text-sm font-medium text-[var(--text-2)] backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--text)] sm:right-7 sm:top-6"
        >
          <CheckCircle2 aria-hidden className="size-4" />
          Мой курс
        </button>
      ) : null}

      {phase === "idle" ? (
        <section className="prototype-fade pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--pill)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-2)]">
            <span className="prototype-pulse size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
            AI-методист
          </div>

          <h1 className="max-w-[14ch] text-balance text-[clamp(38px,6.2vw,74px)] font-semibold leading-[1.04] tracking-normal">
            Курс, который говорит на твоем языке
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-[clamp(15px,1.6vw,19px)] leading-8 text-[var(--text-2)]">
            Напиши, чему хочешь научиться. AI-методист соберет личную траекторию, объяснения и задания под твой опыт,
            цель и способ мышления.
          </p>

          <div className="pointer-events-auto mt-10 w-[min(680px,92vw)]">
            <div className="flex items-center gap-2 rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass)] py-2 pl-4 pr-2 shadow-[var(--input-shadow)] backdrop-blur-xl sm:gap-3 sm:pl-5">
              <input
                value={query}
                onChange={(event) => onInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Например: хочу разобраться в AI для работы"
                className="prototype-input min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--text)] outline-none sm:text-[15px]"
              />
              <button
                type="button"
                onClick={() => void submit()}
                disabled={isGenerating || !query.trim()}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[13px] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_-10px_rgba(120,100,255,0.75)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:px-5"
                style={{ background: "var(--accent-grad)" }}
              >
                <span className="hidden sm:inline">Собрать мой курс</span>
                <Send aria-hidden className="size-4" />
              </button>
            </div>

            <div className="mt-3 grid gap-2 text-left sm:grid-cols-3">
              <label className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass)] px-3 py-2 text-xs text-[var(--text-2)] backdrop-blur-xl">
                Цель
                <input
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="Например, применять в работе"
                  className="mt-1 block w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--placeholder)]"
                />
              </label>
              <label className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass)] px-3 py-2 text-xs text-[var(--text-2)] backdrop-blur-xl">
                Уровень
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as LearnerLevel)}
                  className="mt-1 block w-full bg-transparent text-sm text-[var(--text)] outline-none"
                >
                  <option value="beginner">С нуля</option>
                  <option value="basic">Базовый</option>
                  <option value="intermediate">Продолжающий</option>
                </select>
              </label>
            </div>

            {generationError ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-left text-sm text-[var(--text)]" aria-live="polite">
                <span>{generationError}</span>
                <button
                  type="button"
                  onClick={() => void submit()}
                  className="shrink-0 rounded-lg px-2 py-1 font-semibold text-[var(--accent-key)] transition hover:bg-[var(--accent-tint)]"
                >
                  Повторить
                </button>
              </div>
            ) : null}
          </div>

          <div className="pointer-events-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
            {prototypeSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => pickSuggestion(suggestion)}
                className="rounded-full border border-[var(--glass-border)] bg-[var(--pill)] px-4 py-2 text-sm text-[var(--text-2)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-tint)] hover:text-[var(--text)]"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <p className="mt-6 max-w-md text-sm text-[var(--text-3)]">
            Сначала - 7-дневная персональная траектория и первый адаптированный урок.
          </p>
        </section>
      ) : null}

      {phase === "assembling" ? (
        <section className="prototype-fade pointer-events-none absolute inset-0 z-10 grid place-items-center px-4 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--accent-key)] shadow-[var(--lesson-shadow)]">
              <Sparkles aria-hidden className="prototype-spin size-6" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-5xl">
              Собираю личную траекторию
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-2)]">
              Генерируем на бесплатной модели OpenRouter: цель, уровень, контекст, примеры, первое задание и точку проверки.
            </p>
          </div>
        </section>
      ) : null}

      {phase === "course" && course && session ? (
        <section
          className="absolute inset-0 z-10 overflow-y-auto px-4 py-20 sm:px-6 lg:px-8"
          style={{ background: "var(--course-bg)" }}
        >
          <div className="mx-auto grid min-h-[calc(100svh-10rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.84fr_1.16fr]">
            <aside className="prototype-fade rounded-[22px] border border-[var(--panel-border)] bg-[var(--panel)] p-5 shadow-[var(--panel-shadow)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-2)]">Learning passport</p>
                  <h2 className="mt-2 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">
                    Профиль обучения
                  </h2>
                </div>
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white shadow-[0_16px_32px_-18px_rgba(0,0,0,0.7)]"
                  style={{ background: activeColor }}
                >
                  {activeCourse.toUpperCase()}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {course.passport.map((item, index) => (
                  <div
                    key={item.label}
                    className="prototype-chip rounded-2xl border border-[var(--panel-border)] bg-[var(--chip-bg)] p-4 shadow-[var(--chip-shadow)]"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-key)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--text)]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--badge-border)] bg-[var(--badge-bg)] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-key)]">
                  <ArrowRight aria-hidden className="size-4" />
                  Почему такой маршрут
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{course.whyThisRoute}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--pill)] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">
                  {session.completedDays.length} из 7 дней выполнено
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-3)]">
                  Карта хранится только в этой вкладке и исчезнет после её закрытия.
                </p>
              </div>

              <button
                type="button"
                onClick={restart}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--pill)] px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-tint)]"
              >
                <RefreshCcw aria-hidden className="size-4" />
                Собрать другой курс
              </button>
              <button type="button" onClick={resetProfile} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[var(--panel-border)] px-4 py-3 text-sm font-semibold text-[var(--text-2)]">
                Изменить мой профиль
              </button>
            </aside>

            <div className="prototype-fade space-y-4">
              <div
                className="rounded-[24px] border border-[var(--lesson-border)] p-5 shadow-[var(--lesson-shadow)] backdrop-blur-xl sm:p-6"
                style={{ background: "var(--lesson-grad)" }}
              >
                <p className="text-sm font-semibold text-[var(--text-2)]">7-дневная траектория</p>
                <h2 className="mt-2 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-5xl">
                  {course.title}
                </h2>

                <div className="mt-6 grid gap-3">
                  {modules.map((module, index) => {
                    const isComplete = session.completedDays.includes(module.day);

                    return (
                    <article
                      key={module.day}
                      className="prototype-chip relative grid gap-3 rounded-2xl border border-[var(--node-rest-border)] bg-[var(--node-rest-bg)] p-4 shadow-[var(--node-rest-shadow)] sm:grid-cols-[88px_1fr] sm:items-center"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <div className="flex items-center gap-3 sm:block">
                        <span
                          className="grid size-9 place-items-center rounded-xl text-sm font-bold text-white"
                          style={{ background: index === 0 ? activeColor : "var(--accent-grad)" }}
                        >
                          {module.day}
                        </span>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-3)] sm:mt-2">
                          {module.label}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold leading-6 text-[var(--text)]">{module.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">{module.objective}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-3)]">Практика: {module.practice}</p>
                        <button
                          type="button"
                          onClick={() => toggleDay(module.day)}
                          className="mt-3 rounded-lg border border-[var(--badge-border)] bg-[var(--badge-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-key)] transition hover:bg-[var(--accent-tint)]"
                        >
                          {isComplete ? "Снять отметку" : "Отметить выполненным"}
                        </button>
                      </div>
                    </article>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-[20px] border border-[var(--panel-border)] bg-[var(--panel)] p-5 shadow-[var(--panel-shadow)] backdrop-blur-xl">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-key)]">
                    <CheckCircle2 aria-hidden className="size-4" />
                    Первый адаптированный урок
                  </p>
                  <h3 className="mt-3 text-xl font-semibold leading-tight text-[var(--text)]">
                    {course.firstLesson.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">
                    {course.firstLesson.explanation}
                  </p>
                </article>

                <article className="rounded-[20px] border border-[var(--panel-border)] bg-[var(--panel)] p-5 shadow-[var(--panel-shadow)] backdrop-blur-xl">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent-key)]">
                    <Sparkles aria-hidden className="size-4" />
                    Задание + feedback
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{course.firstLesson.task}</p>
                  <div className="mt-4 rounded-2xl border border-[var(--badge-border)] bg-[var(--badge-bg)] p-3 text-sm leading-6 text-[var(--text)]">
                    {course.firstLesson.feedbackPrompt}
                  </div>
                </article>
              </div>

              <p className="px-1 text-center text-xs text-[var(--text-3)]">
                Создано с OpenRouter: {course.model}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
