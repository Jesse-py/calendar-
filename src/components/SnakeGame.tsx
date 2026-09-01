import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gamepad2, Pause, Play, RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const GRID_SIZE = 20;
const BOARD_PX = 480;
const CELL = BOARD_PX / GRID_SIZE;

const START_SPEED_MS = 140;
const MIN_SPEED_MS = 60;
const SPEED_STEP_MS = 4;

const HIGH_SCORE_KEY = 'snake_high_score';

type Point = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
type Status = 'idle' | 'running' | 'paused' | 'over';

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const THEMES = {
  light: {
    board: '#ffffff',
    grid: '#e2e8f0',
    snake: '#4f46e5',
    head: '#3730a3',
    food: '#059669',
    overlay: 'rgba(248, 250, 252, 0.88)',
  },
  dark: {
    board: '#0f172a',
    grid: '#1e293b',
    snake: '#818cf8',
    head: '#c7d2fe',
    food: '#34d399',
    overlay: 'rgba(2, 6, 23, 0.88)',
  },
};

function initialSnake(): Point[] {
  const mid = Math.floor(GRID_SIZE / 2);
  // Head first, tail last.
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

function spawnFood(snake: Point[]): Point {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const free: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return snake[0];
  return free[Math.floor(Math.random() * free.length)];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

interface SnakeGameProps {
  isDarkMode: boolean;
}

export function SnakeGame({ isDarkMode }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state — the loop reads and writes this without re-rendering.
  const gameRef = useRef({
    snake: initialSnake(),
    direction: 'right' as Direction,
    queue: [] as Direction[],
    food: { x: 0, y: 0 } as Point,
    speed: START_SPEED_MS,
  });

  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = window.localStorage.getItem(HIGH_SCORE_KEY);
    const parsed = saved ? Number.parseInt(saved, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  });

  const statusRef = useRef(status);
  statusRef.current = status;

  const scoreRef = useRef(0);
  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;
  const [isRecord, setIsRecord] = useState(false);

  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const colors = themeRef.current;
    const { snake, food } = gameRef.current;

    ctx.fillStyle = colors.board;
    ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID_SIZE; i++) {
      const p = i * CELL + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, BOARD_PX);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(BOARD_PX, p);
      ctx.stroke();
    }

    ctx.fillStyle = colors.food;
    roundRect(ctx, food.x * CELL + CELL * 0.2, food.y * CELL + CELL * 0.2, CELL * 0.6, CELL * 0.6, CELL * 0.3);

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? colors.head : colors.snake;
      const inset = index === 0 ? 1 : 2;
      roundRect(ctx, segment.x * CELL + inset, segment.y * CELL + inset, CELL - inset * 2, CELL - inset * 2, 5);
    });
  }, []);

  const resetGame = useCallback(() => {
    const snake = initialSnake();
    gameRef.current = {
      snake,
      direction: 'right',
      queue: [],
      food: spawnFood(snake),
      speed: START_SPEED_MS,
    };
    scoreRef.current = 0;
    setScore(0);
    setIsRecord(false);
    draw();
  }, [draw]);

  const startGame = useCallback(() => {
    resetGame();
    setStatus('running');
  }, [resetGame]);

  const turn = useCallback((next: Direction) => {
    const game = gameRef.current;
    // Queue turns so two fast inputs in one tick don't fold the snake into itself.
    const last = game.queue.length > 0 ? game.queue[game.queue.length - 1] : game.direction;
    if (next === last || next === OPPOSITES[last]) return;
    if (game.queue.length < 2) game.queue.push(next);
  }, []);

  const tick = useCallback(() => {
    const game = gameRef.current;

    const nextDirection = game.queue.shift();
    if (nextDirection) game.direction = nextDirection;

    const vector = VECTORS[game.direction];
    const head = { x: game.snake[0].x + vector.x, y: game.snake[0].y + vector.y };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID_SIZE || head.y >= GRID_SIZE;
    // The tail cell is vacated on this tick, so it is only fatal while eating.
    const ate = head.x === game.food.x && head.y === game.food.y;
    const body = ate ? game.snake : game.snake.slice(0, -1);
    const hitSelf = body.some((segment) => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
      const finalScore = scoreRef.current;
      if (finalScore > highScoreRef.current) {
        setHighScore(finalScore);
        setIsRecord(true);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
        }
      }
      setStatus('over');
      return;
    }

    game.snake = [head, ...body];

    if (ate) {
      game.food = spawnFood(game.snake);
      game.speed = Math.max(MIN_SPEED_MS, game.speed - SPEED_STEP_MS);
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }

    draw();
  }, [draw]);

  // Fixed-timestep loop driven by rAF so the pace stays even as speed ramps up.
  useEffect(() => {
    if (status !== 'running') return;

    let frame = 0;
    let last = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      accumulator += now - last;
      last = now;
      const step = gameRef.current.speed;
      // Cap catch-up so a backgrounded tab doesn't fast-forward the whole game.
      if (accumulator > step * 3) accumulator = step * 3;
      while (accumulator >= step && statusRef.current === 'running') {
        accumulator -= step;
        tick();
      }
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [status, tick]);

  // Size the canvas for the display's pixel density, then paint the first frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    canvas.width = BOARD_PX * ratio;
    canvas.height = BOARD_PX * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (gameRef.current.food.x === 0 && gameRef.current.food.y === 0) {
      gameRef.current.food = spawnFood(gameRef.current.snake);
    }
    draw();
  }, [draw]);

  // Repaint on theme change so a paused or finished board picks up new colors.
  useEffect(() => {
    draw();
  }, [draw, isDarkMode]);

  useEffect(() => {
    const keyDirections: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right',
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = keyDirections[event.key] ?? keyDirections[event.key.toLowerCase()];
      if (direction) {
        event.preventDefault();
        if (statusRef.current === 'idle') {
          startGame();
        } else if (statusRef.current === 'running') {
          turn(direction);
        }
        return;
      }

      const key = event.key.toLowerCase();
      if (event.key === ' ' || key === 'p') {
        event.preventDefault();
        if (statusRef.current === 'idle' || statusRef.current === 'over') startGame();
        else setStatus((prev) => (prev === 'running' ? 'paused' : 'running'));
        return;
      }
      if (key === 'r') {
        event.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, turn]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (status === 'idle') startGame();
    else if (status === 'running') {
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 'right' : 'left');
      else turn(dy > 0 ? 'down' : 'up');
    }
  };

  const overlay = useMemo(() => {
    if (status === 'idle') {
      return { title: 'Ready?', body: 'Arrow keys, WASD, or swipe to move. Eat the dots, dodge the walls.', cta: 'Start Game' };
    }
    if (status === 'paused') {
      return { title: 'Paused', body: 'Take a breath — the snake will wait.', cta: 'Resume' };
    }
    if (status === 'over') {
      return {
        title: 'Game Over',
        body: isRecord ? `New high score: ${score}!` : `You scored ${score}.`,
        cta: 'Play Again',
      };
    }
    return null;
  }, [status, score, isRecord]);

  const handleOverlayAction = () => {
    if (status === 'paused') setStatus('running');
    else startGame();
  };

  const dpadButton =
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm cursor-pointer flex items-center justify-center w-12 h-12 transition-colors';

  const handleDpad = (direction: Direction) => {
    if (status === 'idle' || status === 'over') startGame();
    else if (status === 'running') turn(direction);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 md:p-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 dark:bg-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-tight">Snake</h2>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Break Room Arcade</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-lg text-center min-w-20">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-1 tracking-widest">Score</span>
            <span className="text-lg font-black text-indigo-900 dark:text-indigo-400 leading-none tabular-nums">{score}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-lg text-center min-w-20">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-1 tracking-widest flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" /> Best
            </span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none tabular-nums">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div
          className="relative w-full max-w-[480px] aspect-square touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%' }}
            className="rounded-lg border border-slate-200 dark:border-slate-800 block"
          />

          {overlay && (
            <div
              className="absolute inset-0 rounded-lg flex flex-col items-center justify-center text-center gap-3 px-6"
              style={{ backgroundColor: theme.overlay }}
            >
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{overlay.title}</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">
                {overlay.body}
              </p>
              <button
                onClick={handleOverlayAction}
                className="mt-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
              >
                {overlay.cta}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (status === 'running') setStatus('paused');
              else if (status === 'paused') setStatus('running');
              else startGame();
            }}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            {status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
          </button>
          <button
            onClick={startGame}
            className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-900 dark:border-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>

        {/* Touch controls — hidden once a keyboard is the obvious input. */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <span />
          <button className={dpadButton} onClick={() => handleDpad('up')} aria-label="Move up">
            <ChevronUp className="w-5 h-5" />
          </button>
          <span />
          <button className={dpadButton} onClick={() => handleDpad('left')} aria-label="Move left">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className={dpadButton} onClick={() => handleDpad('down')} aria-label="Move down">
            <ChevronDown className="w-5 h-5" />
          </button>
          <button className={dpadButton} onClick={() => handleDpad('right')} aria-label="Move right">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <p className={cn(
          'text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center leading-relaxed',
          'hidden sm:block',
        )}>
          Arrows / WASD to steer · Space or P to pause · R to restart
        </p>
      </div>
    </div>
  );
}
