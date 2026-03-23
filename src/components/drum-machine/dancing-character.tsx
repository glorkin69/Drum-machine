"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { getThemeColors } from "@/lib/theme-colors";
import type { Genre } from "@/lib/drum-patterns";

// ─── Types ────────────────────────────────────────────────────────
interface DancingCharacterProps {
  isPlaying: boolean;
  bpm: number;
  currentStep: number;
  genre: Genre;
}

type SceneType = "fetch" | "dancing" | "tricks" | "petting" | "bouncing";

interface SceneState {
  scene: SceneType;
  progress: number; // 0-1 within scene
  beatPhase: number; // 0-1 within beat
}

// ─── Scene Definitions ───────────────────────────────────────────
const SCENES: SceneType[] = ["fetch", "dancing", "tricks", "petting", "bouncing"];

const SCENE_LABELS: Record<SceneType, string> = {
  fetch: "FETCH!",
  dancing: "DANCE PARTY",
  tricks: "GOOD BOY!",
  petting: "BELLY RUBS",
  bouncing: "BEAT BOUNCE",
};

// ─── Interpolation helpers ───────────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function bounceEase(t: number): number {
  return Math.abs(Math.sin(t * Math.PI));
}

// ─── Fluffy Dog SVG ──────────────────────────────────────────────
function FluffyDogSVG({
  strokeColor,
  fillColor,
  accentColor,
  bounce,
  tailWag,
  legPhase,
  headTilt,
  bodyY,
  expression,
  rollAngle,
  jumpY,
  scaleX,
}: {
  strokeColor: string;
  fillColor: string;
  accentColor: string;
  bounce: number;
  tailWag: number;
  legPhase: number;
  headTilt: number;
  bodyY: number;
  expression: "happy" | "excited" | "tongue" | "sleeping";
  rollAngle: number;
  jumpY: number;
  scaleX: number;
}) {
  const by = bodyY + bounce + jumpY;
  const frontLegOffset = Math.sin(legPhase * Math.PI * 2) * 4;
  const backLegOffset = Math.sin((legPhase + 0.5) * Math.PI * 2) * 4;
  const tailAngle = Math.sin(tailWag * Math.PI * 2) * 35;

  return (
    <g
      transform={`translate(0, ${by}) rotate(${rollAngle}, 30, 28) scale(${scaleX}, 1)`}
      style={{ transformOrigin: "30px 28px" }}
    >
      {/* Shadow */}
      <ellipse
        cx={30}
        cy={46 - jumpY * 0.3}
        rx={lerp(16, 12, Math.abs(jumpY) / 10)}
        ry={lerp(3, 2, Math.abs(jumpY) / 10)}
        fill={strokeColor}
        opacity={lerp(0.15, 0.05, Math.abs(jumpY) / 10)}
      />

      {/* Tail - fluffy curved */}
      <path
        d={`M 12 24 Q ${8 + Math.sin((tailAngle * Math.PI) / 180) * 8} ${14 + Math.cos((tailAngle * Math.PI) / 180) * 4} ${4 + Math.sin((tailAngle * Math.PI) / 180) * 6} ${10}`}
        fill="none"
        stroke={accentColor}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* Tail fluff tip */}
      <circle
        cx={4 + Math.sin((tailAngle * Math.PI) / 180) * 6}
        cy={10}
        r={3}
        fill={accentColor}
        opacity={0.6}
      />

      {/* Back legs */}
      <line
        x1={16}
        y1={34}
        x2={14 + backLegOffset * 0.5}
        y2={44 + backLegOffset * 0.3}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={22}
        y1={34}
        x2={20 - backLegOffset * 0.5}
        y2={44 - backLegOffset * 0.3}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Body - fluffy ellipse */}
      <ellipse cx={30} cy={28} rx={18} ry={12} fill={fillColor} stroke={strokeColor} strokeWidth="2" />
      {/* Fluffy body texture */}
      <ellipse cx={30} cy={26} rx={16} ry={10} fill={accentColor} opacity={0.15} />
      <path
        d="M 18 22 Q 22 19 26 22 M 28 20 Q 32 17 36 20 M 34 22 Q 38 19 42 22"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
        opacity={0.3}
      />

      {/* Front legs */}
      <line
        x1={38}
        y1={34}
        x2={40 + frontLegOffset * 0.5}
        y2={44 + frontLegOffset * 0.3}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1={44}
        y1={34}
        x2={46 - frontLegOffset * 0.5}
        y2={44 - frontLegOffset * 0.3}
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Paws */}
      <ellipse cx={14 + backLegOffset * 0.5} cy={45 + backLegOffset * 0.3} rx={2.5} ry={1.5} fill={accentColor} stroke={strokeColor} strokeWidth="0.8" />
      <ellipse cx={20 - backLegOffset * 0.5} cy={45 - backLegOffset * 0.3} rx={2.5} ry={1.5} fill={accentColor} stroke={strokeColor} strokeWidth="0.8" />
      <ellipse cx={40 + frontLegOffset * 0.5} cy={45 + frontLegOffset * 0.3} rx={2.5} ry={1.5} fill={accentColor} stroke={strokeColor} strokeWidth="0.8" />
      <ellipse cx={46 - frontLegOffset * 0.5} cy={45 - frontLegOffset * 0.3} rx={2.5} ry={1.5} fill={accentColor} stroke={strokeColor} strokeWidth="0.8" />

      {/* Head */}
      <g transform={`rotate(${headTilt}, 46, 20)`}>
        <ellipse cx={46} cy={20} rx={10} ry={9} fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        {/* Ears - floppy */}
        <ellipse cx={38} cy={13} rx={4} ry={6} fill={fillColor} stroke={strokeColor} strokeWidth="1.5" transform="rotate(-20, 38, 13)" />
        <ellipse cx={54} cy={13} rx={4} ry={6} fill={fillColor} stroke={strokeColor} strokeWidth="1.5" transform="rotate(20, 54, 13)" />
        {/* Inner ears */}
        <ellipse cx={38} cy={13} rx={2.5} ry={4} fill={accentColor} opacity={0.3} transform="rotate(-20, 38, 13)" />
        <ellipse cx={54} cy={13} rx={2.5} ry={4} fill={accentColor} opacity={0.3} transform="rotate(20, 54, 13)" />

        {/* Snout */}
        <ellipse cx={50} cy={22} rx={5} ry={3.5} fill={fillColor} stroke={strokeColor} strokeWidth="1" />
        {/* Nose */}
        <ellipse cx={53} cy={21} rx={2} ry={1.5} fill={strokeColor} />

        {/* Eyes */}
        {expression === "sleeping" ? (
          <>
            <line x1={42} y1={18} x2={46} y2={18} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={49} y1={18} x2={53} y2={18} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={44} cy={17} r={1.8} fill={strokeColor} />
            <circle cx={51} cy={17} r={1.8} fill={strokeColor} />
            {/* Eye shine */}
            <circle cx={44.5} cy={16.5} r={0.6} fill={fillColor} />
            <circle cx={51.5} cy={16.5} r={0.6} fill={fillColor} />
          </>
        )}

        {/* Mouth / tongue */}
        {expression === "tongue" && (
          <>
            <path d="M 48 24 Q 50 26 52 24" fill="none" stroke={strokeColor} strokeWidth="1" strokeLinecap="round" />
            <path d="M 49 25 Q 50 29 51 25" fill="#E8732A" stroke="#C0392B" strokeWidth="0.5" />
          </>
        )}
        {expression === "happy" && (
          <path d="M 48 24 Q 50 27 52 24" fill="none" stroke={strokeColor} strokeWidth="1" strokeLinecap="round" />
        )}
        {expression === "excited" && (
          <>
            <path d="M 47 24 Q 50 28 53 24" fill="none" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
            <ellipse cx={50} cy={26} rx={2} ry={1.2} fill="#E8732A" opacity={0.7} />
          </>
        )}
      </g>
    </g>
  );
}

// ─── Person SVG ──────────────────────────────────────────────────
function PersonSVG({
  strokeColor,
  fillColor,
  accentColor,
  bounce,
  leftArmAngle,
  rightArmAngle,
  leftLegAngle,
  rightLegAngle,
  bodyTilt,
  headY,
  expression,
  holdingBall,
  crouching,
}: {
  strokeColor: string;
  fillColor: string;
  accentColor: string;
  bounce: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftLegAngle: number;
  rightLegAngle: number;
  bodyTilt: number;
  headY: number;
  expression: "smile" | "grin" | "laugh";
  holdingBall: boolean;
  crouching: number; // 0-1 for crouch amount
}) {
  const baseY = bounce + crouching * 8;
  const torsoH = lerp(30, 22, crouching);
  const neckY = 12 + headY + baseY;
  const hipY = neckY + torsoH;
  const torsoX = Math.sin((bodyTilt * Math.PI) / 180) * 4;

  const shoulderY = neckY + 6;
  const armLen = 20;
  const lsx = 50 + torsoX * 0.5 - 8;
  const rsx = 50 + torsoX * 0.5 + 8;

  const lax = lsx + Math.cos((leftArmAngle * Math.PI) / 180) * armLen;
  const lay = shoulderY - Math.sin((leftArmAngle * Math.PI) / 180) * armLen;
  const rax = rsx + Math.cos((rightArmAngle * Math.PI) / 180) * armLen;
  const ray = shoulderY - Math.sin((rightArmAngle * Math.PI) / 180) * armLen;

  const legLen = 22;
  const lhx = 50 + torsoX * 0.3 - 6;
  const rhx = 50 + torsoX * 0.3 + 6;
  const lfx = lhx + Math.sin((leftLegAngle * Math.PI) / 180) * legLen;
  const lfy = hipY + Math.cos((leftLegAngle * Math.PI) / 180) * legLen;
  const rfx = rhx + Math.sin((rightLegAngle * Math.PI) / 180) * legLen;
  const rfy = hipY + Math.cos((rightLegAngle * Math.PI) / 180) * legLen;

  const headCx = 50 + torsoX * 0.3;
  const headCy = neckY - 6;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx={50 + torsoX * 0.5} cy={96} rx={14} ry={3} fill={strokeColor} opacity={0.12} />

      {/* Legs */}
      <line x1={lhx} y1={hipY} x2={lfx} y2={lfy} stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      <line x1={rhx} y1={hipY} x2={rfx} y2={rfy} stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      {/* Shoes */}
      <ellipse cx={lfx} cy={lfy + 1.5} rx={4.5} ry={2} fill={accentColor} stroke={strokeColor} strokeWidth="0.8" />
      <ellipse cx={rfx} cy={rfy + 1.5} rx={4.5} ry={2} fill={accentColor} stroke={strokeColor} strokeWidth="0.8" />

      {/* Body */}
      <line x1={50 + torsoX * 0.3} y1={neckY} x2={50 + torsoX * 0.3} y2={hipY} stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
      {/* Vest */}
      <path
        d={`M ${lsx} ${shoulderY} L ${lhx} ${hipY} L ${rhx} ${hipY} L ${rsx} ${shoulderY} Z`}
        fill={accentColor}
        opacity={0.25}
      />

      {/* Arms */}
      <line x1={lsx} y1={shoulderY} x2={lax} y2={lay} stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={rsx} y1={shoulderY} x2={rax} y2={ray} stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      {/* Hands */}
      <circle cx={lax} cy={lay} r={2.5} fill={fillColor} stroke={strokeColor} strokeWidth="1.2" />
      <circle cx={rax} cy={ray} r={2.5} fill={fillColor} stroke={strokeColor} strokeWidth="1.2" />

      {/* Ball in hand */}
      {holdingBall && (
        <circle cx={rax} cy={ray - 4} r={3.5} fill={accentColor} stroke={strokeColor} strokeWidth="1" />
      )}

      {/* Head */}
      <circle cx={headCx} cy={headCy} r={10} fill={fillColor} stroke={strokeColor} strokeWidth="2" />
      {/* Cap */}
      <path
        d={`M ${headCx - 10} ${headCy - 3} Q ${headCx - 6} ${headCy - 13} ${headCx + 2} ${headCy - 12} Q ${headCx + 8} ${headCy - 11} ${headCx + 12} ${headCy - 5}`}
        fill={accentColor}
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Face */}
      <circle cx={headCx - 3.5} cy={headCy - 1} r={1.3} fill={strokeColor} />
      <circle cx={headCx + 3.5} cy={headCy - 1} r={1.3} fill={strokeColor} />
      {expression === "smile" && (
        <path d={`M ${headCx - 3.5} ${headCy + 3.5} Q ${headCx} ${headCy + 7} ${headCx + 3.5} ${headCy + 3.5}`} fill="none" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
      )}
      {expression === "grin" && (
        <path d={`M ${headCx - 4} ${headCy + 3} Q ${headCx} ${headCy + 8} ${headCx + 4} ${headCy + 3}`} fill="none" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
      )}
      {expression === "laugh" && (
        <>
          <path d={`M ${headCx - 4} ${headCy + 3} Q ${headCx} ${headCy + 9} ${headCx + 4} ${headCy + 3}`} fill="none" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx={headCx} cy={headCy + 5} rx={2.5} ry={1.8} fill={strokeColor} />
        </>
      )}
    </g>
  );
}

// ─── Ball SVG ────────────────────────────────────────────────────
function BallSVG({ x, y, strokeColor, accentColor, visible }: {
  x: number;
  y: number;
  strokeColor: string;
  accentColor: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <g>
      <circle cx={x} cy={y} r={3.5} fill={accentColor} stroke={strokeColor} strokeWidth="1" />
      <path
        d={`M ${x - 2} ${y - 1.5} Q ${x} ${y - 3} ${x + 2} ${y - 1.5}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.5"
        opacity={0.5}
      />
    </g>
  );
}

// ─── Heart particles ─────────────────────────────────────────────
function HeartParticles({ active, accentColor, phase }: {
  active: boolean;
  accentColor: string;
  phase: number;
}) {
  if (!active) return null;
  const hearts = [
    { x: 70, y: 10, delay: 0 },
    { x: 78, y: 15, delay: 0.33 },
    { x: 65, y: 8, delay: 0.66 },
  ];

  return (
    <g>
      {hearts.map((h, i) => {
        const p = ((phase + h.delay) % 1);
        const opacity = p < 0.7 ? 1 - p / 0.7 : 0;
        const floatY = h.y - p * 15;
        return (
          <text
            key={i}
            x={h.x + Math.sin(p * Math.PI * 3) * 3}
            y={floatY}
            fontSize="6"
            fill={accentColor}
            opacity={opacity * 0.7}
          >
            ♥
          </text>
        );
      })}
    </g>
  );
}

// ─── Music notes particles ───────────────────────────────────────
function MusicNotes({ active, accentColor, phase }: {
  active: boolean;
  accentColor: string;
  phase: number;
}) {
  if (!active) return null;
  const notes = ["♪", "♫", "♩"];

  return (
    <g>
      {notes.map((note, i) => {
        const p = ((phase + i * 0.33) % 1);
        const opacity = p < 0.8 ? 1 - p / 0.8 : 0;
        const x = 5 + i * 25 + Math.sin(p * Math.PI * 2) * 4;
        const y = 5 - p * 12;
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize="5"
            fill={accentColor}
            opacity={opacity * 0.6}
          >
            {note}
          </text>
        );
      })}
    </g>
  );
}

// ─── Scene renderers ─────────────────────────────────────────────

function renderFetchScene(
  progress: number,
  beatPhase: number,
  strokeColor: string,
  fillColor: string,
  accentColor: string,
) {
  // Person throws ball, dog runs to fetch
  const throwPhase = progress < 0.3 ? progress / 0.3 : 1;
  const fetchPhase = progress < 0.3 ? 0 : Math.min((progress - 0.3) / 0.5, 1);
  const returnPhase = progress < 0.8 ? 0 : (progress - 0.8) / 0.2;

  const beatBounce = Math.sin(beatPhase * Math.PI * 2) * 2;
  const ballThrown = throwPhase >= 1;
  const dogHasBall = fetchPhase >= 0.9;

  // Ball arc
  const ballX = ballThrown ? lerp(52, 85, easeInOut(Math.min(fetchPhase * 1.5, 1))) : 52;
  const ballArc = ballThrown ? Math.sin(Math.min(fetchPhase * 1.5, 1) * Math.PI) * -20 : 0;
  const ballY = ballThrown ? lerp(30, 35, fetchPhase) + ballArc : 30;

  // Dog position - runs to ball then back
  const dogX = dogHasBall
    ? lerp(85, 55, easeInOut(returnPhase)) - 30
    : lerp(0, 55, easeInOut(fetchPhase)) - 30;

  return (
    <>
      <g transform={`translate(${dogX}, 0)`}>
        <FluffyDogSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce}
          tailWag={beatPhase * 2 + progress * 5}
          legPhase={fetchPhase < 1 && fetchPhase > 0 ? progress * 8 : returnPhase > 0 ? progress * 8 : beatPhase * 0.3}
          headTilt={dogHasBall ? 5 : -5 * Math.sin(progress * Math.PI * 4)}
          bodyY={0}
          expression={dogHasBall ? "happy" : fetchPhase > 0 ? "excited" : "tongue"}
          rollAngle={0}
          jumpY={0}
          scaleX={dogHasBall && returnPhase > 0 ? -1 : 1}
        />
      </g>

      <g transform="translate(55, 10)">
        <PersonSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce * 0.5}
          leftArmAngle={-15}
          rightArmAngle={ballThrown ? lerp(40, 120, easeInOut(throwPhase)) : lerp(120, 40, easeInOut(progress * 3 % 1))}
          leftLegAngle={-5 + beatBounce * 0.5}
          rightLegAngle={5 - beatBounce * 0.5}
          bodyTilt={throwPhase < 1 ? -5 * throwPhase : 0}
          headY={0}
          expression={dogHasBall && returnPhase > 0.5 ? "laugh" : "grin"}
          holdingBall={!ballThrown}
          crouching={returnPhase > 0.5 ? (returnPhase - 0.5) * 0.6 : 0}
        />
      </g>

      <BallSVG
        x={ballX}
        y={ballY}
        strokeColor={strokeColor}
        accentColor={accentColor}
        visible={ballThrown && !dogHasBall}
      />
    </>
  );
}

function renderDancingScene(
  progress: number,
  beatPhase: number,
  strokeColor: string,
  fillColor: string,
  accentColor: string,
) {
  const beat = beatPhase * Math.PI * 2;
  const beatBounce = Math.sin(beat) * 3;
  const sway = Math.sin(progress * Math.PI * 6) * 8;

  return (
    <>
      <MusicNotes active={true} accentColor={accentColor} phase={progress * 3 % 1} />

      <g transform="translate(-5, 0)">
        <FluffyDogSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce}
          tailWag={beatPhase * 3}
          legPhase={beatPhase}
          headTilt={sway * 0.6}
          bodyY={0}
          expression="excited"
          rollAngle={sway * 0.3}
          jumpY={Math.abs(beatBounce) * 0.5}
          scaleX={1}
        />
      </g>

      <g transform="translate(45, 10)">
        <PersonSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce}
          leftArmAngle={lerp(-60, -120, bounceEase(beatPhase))}
          rightArmAngle={lerp(60, 120, bounceEase(beatPhase + 0.5))}
          leftLegAngle={lerp(-15, 15, bounceEase(beatPhase))}
          rightLegAngle={lerp(15, -15, bounceEase(beatPhase))}
          bodyTilt={sway * 0.4}
          headY={beatBounce * 0.3}
          expression="laugh"
          holdingBall={false}
          crouching={0}
        />
      </g>
    </>
  );
}

function renderTricksScene(
  progress: number,
  beatPhase: number,
  strokeColor: string,
  fillColor: string,
  accentColor: string,
) {
  // Dog does different tricks: sit → jump → roll
  const trickPhase = progress * 3; // 0-1 sit, 1-2 jump, 2-3 roll
  const beatBounce = Math.sin(beatPhase * Math.PI * 2) * 1.5;

  let dogJumpY = 0;
  let dogRoll = 0;
  let dogCrouch = 0;
  let dogExpression: "happy" | "excited" | "tongue" | "sleeping" = "happy";

  if (trickPhase < 1) {
    // Sit
    dogCrouch = easeInOut(trickPhase < 0.5 ? trickPhase * 2 : 1) * 0.5;
    dogExpression = "happy";
  } else if (trickPhase < 2) {
    // Jump
    const jp = (trickPhase - 1);
    dogJumpY = -Math.sin(jp * Math.PI) * 15;
    dogExpression = "excited";
  } else {
    // Roll over
    const rp = (trickPhase - 2);
    dogRoll = easeInOut(rp) * 360;
    dogExpression = "tongue";
  }

  // Person points / commands
  const pointUp = trickPhase >= 1 && trickPhase < 2;

  return (
    <>
      <g transform="translate(-5, 0)">
        <FluffyDogSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce + dogCrouch * 6}
          tailWag={beatPhase * 2}
          legPhase={trickPhase < 1 ? 0 : beatPhase * 0.3}
          headTilt={trickPhase < 1 ? 10 : 0}
          bodyY={dogCrouch * 4}
          expression={dogExpression}
          rollAngle={dogRoll}
          jumpY={dogJumpY}
          scaleX={1}
        />
      </g>

      <g transform="translate(50, 10)">
        <PersonSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce * 0.4}
          leftArmAngle={-20}
          rightArmAngle={pointUp ? 150 : 70}
          leftLegAngle={-3 + beatBounce}
          rightLegAngle={3 - beatBounce}
          bodyTilt={0}
          headY={beatBounce * 0.2}
          expression={trickPhase >= 2 ? "laugh" : "grin"}
          holdingBall={false}
          crouching={0}
        />
      </g>

      {/* Star particles for tricks */}
      {trickPhase >= 1 && (
        <g>
          {[0, 1, 2].map((i) => {
            const p = ((progress * 4 + i * 0.33) % 1);
            const opacity = p < 0.6 ? 1 - p / 0.6 : 0;
            return (
              <text
                key={i}
                x={20 + i * 12 + Math.sin(p * Math.PI * 2) * 4}
                y={8 - p * 10}
                fontSize="5"
                fill={accentColor}
                opacity={opacity * 0.7}
              >
                ★
              </text>
            );
          })}
        </g>
      )}
    </>
  );
}

function renderPettingScene(
  progress: number,
  beatPhase: number,
  strokeColor: string,
  fillColor: string,
  accentColor: string,
) {
  const beatBounce = Math.sin(beatPhase * Math.PI * 2) * 1;
  const petMotion = Math.sin(progress * Math.PI * 8) * 3;

  return (
    <>
      <HeartParticles active={true} accentColor={accentColor} phase={progress * 2 % 1} />

      <g transform="translate(-2, 3)">
        <FluffyDogSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce}
          tailWag={beatPhase * 4}
          legPhase={0}
          headTilt={petMotion * 0.5}
          bodyY={2}
          expression="tongue"
          rollAngle={0}
          jumpY={0}
          scaleX={1}
        />
      </g>

      <g transform="translate(42, 8)">
        <PersonSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={beatBounce * 0.3}
          leftArmAngle={-30}
          rightArmAngle={lerp(40, 60, bounceEase(progress * 4))}
          leftLegAngle={-5}
          rightLegAngle={10}
          bodyTilt={-5}
          headY={beatBounce * 0.2}
          expression="smile"
          holdingBall={false}
          crouching={0.4 + petMotion * 0.02}
        />
      </g>
    </>
  );
}

function renderBouncingScene(
  progress: number,
  beatPhase: number,
  strokeColor: string,
  fillColor: string,
  accentColor: string,
) {
  const beat = beatPhase * Math.PI * 2;
  const strongBounce = Math.abs(Math.sin(beat)) * 6;
  const halfBounce = Math.abs(Math.sin(beat * 2)) * 3;

  return (
    <>
      <MusicNotes active={true} accentColor={accentColor} phase={beatPhase} />

      <g transform="translate(-5, 0)">
        <FluffyDogSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={0}
          tailWag={beatPhase * 4}
          legPhase={beatPhase * 2}
          headTilt={Math.sin(beat) * 6}
          bodyY={0}
          expression="excited"
          rollAngle={0}
          jumpY={-strongBounce}
          scaleX={1}
        />
      </g>

      <g transform="translate(45, 10)">
        <PersonSVG
          strokeColor={strokeColor}
          fillColor={fillColor}
          accentColor={accentColor}
          bounce={-halfBounce}
          leftArmAngle={lerp(-40, -100, bounceEase(beatPhase * 2))}
          rightArmAngle={lerp(40, 100, bounceEase(beatPhase * 2 + 0.5))}
          leftLegAngle={lerp(-8, 8, bounceEase(beatPhase * 2))}
          rightLegAngle={lerp(8, -8, bounceEase(beatPhase * 2))}
          bodyTilt={Math.sin(beat) * 4}
          headY={-halfBounce * 0.3}
          expression="laugh"
          holdingBall={false}
          crouching={0}
        />
      </g>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export function DancingCharacter({ isPlaying, bpm, currentStep, genre }: DancingCharacterProps) {
  const { theme } = useTheme();
  const tc = getThemeColors(theme);

  const [currentScene, setCurrentScene] = useState<SceneType>("bouncing");
  const [sceneProgress, setSceneProgress] = useState(0);
  const [beatPhase, setBeatPhase] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const animFrameRef = useRef<number>(0);
  const sceneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBeatRef = useRef(-1);
  const sceneStartRef = useRef(performance.now());
  const sceneDurationRef = useRef(6000); // 6 seconds default

  // Theme colors
  const strokeColor = tc.textPrimary;
  const fillColor = tc.panelBg;
  const accentColor = tc.accentOrange;
  const borderColor = tc.panelBorder;
  const bgColor = tc.displayBg;

  // Scene rotation
  const rotateScene = useCallback(() => {
    setTransitioning(true);
    setOpacity(0);

    setTimeout(() => {
      setCurrentScene((prev) => {
        const currentIdx = SCENES.indexOf(prev);
        let nextIdx = (currentIdx + 1) % SCENES.length;
        // Skip to a random scene sometimes for variety
        if (Math.random() > 0.6) {
          nextIdx = Math.floor(Math.random() * SCENES.length);
          if (nextIdx === currentIdx) nextIdx = (nextIdx + 1) % SCENES.length;
        }
        return SCENES[nextIdx];
      });
      setSceneProgress(0);
      sceneStartRef.current = performance.now();
      sceneDurationRef.current = 5000 + Math.random() * 3000; // 5-8s
      setTransitioning(false);
      setOpacity(1);
    }, 300); // Fade transition duration
  }, []);

  // Auto-rotate scenes
  useEffect(() => {
    if (!isPlaying) {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      return;
    }

    const scheduleNext = () => {
      sceneTimerRef.current = setTimeout(() => {
        rotateScene();
        scheduleNext();
      }, sceneDurationRef.current);
    };

    scheduleNext();
    return () => {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
    };
  }, [isPlaying, rotateScene]);

  // Reset on play/stop
  useEffect(() => {
    if (isPlaying) {
      setCurrentScene(SCENES[Math.floor(Math.random() * SCENES.length)]);
      setSceneProgress(0);
      sceneStartRef.current = performance.now();
      sceneDurationRef.current = 5000 + Math.random() * 3000;
    }
  }, [isPlaying]);

  // Beat detection from currentStep
  useEffect(() => {
    if (!isPlaying || currentStep < 0) return;
    const beatIdx = Math.floor(currentStep / 4);
    if (beatIdx !== lastBeatRef.current) {
      lastBeatRef.current = beatIdx;
    }
  }, [isPlaying, currentStep]);

  // Animation loop - synced to BPM
  useEffect(() => {
    const beatDurationMs = (60 / bpm) * 1000; // quarter note

    const animate = (timestamp: number) => {
      const elapsed = timestamp - sceneStartRef.current;
      const sceneDur = sceneDurationRef.current;

      // Scene progress (0-1)
      setSceneProgress(Math.min(elapsed / sceneDur, 1));

      // Beat phase (0-1) synced to BPM
      if (isPlaying) {
        const beatProgress = (elapsed % beatDurationMs) / beatDurationMs;
        setBeatPhase(beatProgress);
      } else {
        // Slow idle breathing
        const idlePhase = (Math.sin(elapsed / 1500 * Math.PI * 2) + 1) / 2;
        setBeatPhase(idlePhase);
        setSceneProgress((elapsed % 8000) / 8000);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, bpm]);

  // Render the current scene
  const sceneContent = useMemo(() => {
    const args = [sceneProgress, beatPhase, strokeColor, fillColor, accentColor] as const;

    if (!isPlaying) {
      // Idle: petting scene (calm)
      return renderPettingScene(sceneProgress, beatPhase, strokeColor, fillColor, accentColor);
    }

    switch (currentScene) {
      case "fetch":
        return renderFetchScene(...args);
      case "dancing":
        return renderDancingScene(...args);
      case "tricks":
        return renderTricksScene(...args);
      case "petting":
        return renderPettingScene(...args);
      case "bouncing":
        return renderBouncingScene(...args);
      default:
        return renderBouncingScene(...args);
    }
  }, [currentScene, sceneProgress, beatPhase, strokeColor, fillColor, accentColor, isPlaying]);

  const sceneLabel = isPlaying
    ? SCENE_LABELS[currentScene] || "VIBING"
    : "CHILLING";

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{
        width: "min(280px, 70vw)",
        minWidth: "min(280px, 70vw)",
      }}
    >
      {/* Animation container - responsive */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          width: "min(270px, 68vw)",
          height: "min(110px, 28vw)",
          backgroundColor: bgColor,
          border: `2px solid ${isPlaying ? accentColor : borderColor}`,
          boxShadow: isPlaying
            ? `0 0 12px ${accentColor}33, inset 0 0 20px ${accentColor}0D`
            : `inset 0 0 15px rgba(0,0,0,0.3)`,
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* CRT scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)`,
            zIndex: 10,
          }}
        />

        {/* Scene viewport - centered and contained */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 5,
            opacity: opacity,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <svg
            viewBox="0 0 110 55"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={{ overflow: "hidden", maxWidth: "100%", maxHeight: "100%" }}
          >
            {/* Ground line */}
            <line
              x1={0}
              y1={50}
              x2={110}
              y2={50}
              stroke={strokeColor}
              strokeWidth="0.5"
              opacity={0.15}
            />
            {sceneContent}
          </svg>
        </div>

        {/* Beat flash indicator */}
        {isPlaying && currentStep % 4 === 0 && (
          <div
            className="absolute top-1 right-1 rounded-full"
            style={{
              width: "min(6px, 1.5vw)",
              height: "min(6px, 1.5vw)",
              backgroundColor: tc.ledActive,
              boxShadow: `0 0 6px ${tc.ledActive}`,
              animation: "beatFlash 0.15s ease-out",
              zIndex: 11,
            }}
          />
        )}
      </div>

      {/* Label */}
      <span
        className="font-mono text-center leading-tight"
        style={{
          fontSize: "clamp(0.4rem, 1.2vw, 0.5rem)",
          color: isPlaying ? accentColor : tc.textMuted,
          letterSpacing: "0.08em",
          transition: "color 0.3s",
        }}
      >
        {sceneLabel}
      </span>
    </div>
  );
}
