// ===== File: src/App.jsx =====
import React, { useMemo, useState, useEffect } from "react";
import crossImg from "./assets/cross.png"; // <- place your cross image here
import ringImg from "./assets/ring.png";   // <- place your ring image here
import "./Game.css";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const emptyBoard = () => Array(9).fill(null);

function useGame() {
  const [board, setBoard] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });

  const status = useMemo(() => {
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c], draw: false };
      }
    }
    return { winner: null, line: null, draw: board.every(Boolean) };
  }, [board]);

  const makeMove = (i) => {
    if (board[i] || status.winner) return;
    const next = board.slice();
    next[i] = xIsNext ? "X" : "O";
    setBoard(next);
    setXIsNext((v) => !v);
  };

  const resetRound = () => {
    setBoard(emptyBoard());
    setXIsNext(true);
  };

  const resetMatch = () => {
    setBoard(emptyBoard());
    setXIsNext(true);
    setScore({ X: 0, O: 0 });
  };

  // auto-advance: add point then auto reset
  useEffect(() => {
    if (status.winner) {
      setScore((s) => ({ ...s, [status.winner]: s[status.winner] + 1 }));
      const t = setTimeout(() => resetRound(), 1200);
      return () => clearTimeout(t);
    }
    if (status.draw) {
      const t = setTimeout(() => resetRound(), 800);
      return () => clearTimeout(t);
    }
  }, [status.winner, status.draw]);

  return { board, xIsNext, status, makeMove, resetRound, resetMatch, score };
}

function Cell({ value, onClick, highlight }) {
  return (
    <button className={`cell ${highlight ? "cell--highlight" : ""}`} onClick={onClick}>
      {value && (
        <img
          className="mark"
          src={value === "X" ? crossImg : ringImg}
          alt={value}
          draggable={false}
        />
      )}
      <span className="shine" />
    </button>
  );
}

function WinningLine({ line }) {
  if (!line) return null;
  // convert cell index -> center (percent coords) in 3x3 grid
  const centers = [
    [16.66, 16.66], [50, 16.66], [83.33, 16.66],
    [16.66, 50],    [50, 50],    [83.33, 50],
    [16.66, 83.33], [50, 83.33], [83.33, 83.33],
  ];
  const [a, , c] = line.map((i) => centers[i]);
  const [x1, y1] = a; const [x2, y2] = c;
  return (
    <svg className="winline" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7aa2ff" />
          <stop offset="100%" stopColor="#b388ff" />
        </linearGradient>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#g)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const { board, xIsNext, status, makeMove, resetMatch, score } = useGame();
  const headline = status.winner
    ? `${status.winner} wins!`
    : status.draw
    ? "Draw"
    : `${xIsNext ? "X" : "O"}'s turn`;

  return (
    <div className="page">
      <div className="wrap">
        <header className="header">
          <div className="turn">
            <img className="turn__icon" src={xIsNext ? crossImg : ringImg} alt="turn" />
            <h1 className="title">{headline}</h1>
          </div>
          <button className="btn" onClick={resetMatch}>Reset Match</button>
        </header>

        <section className="score">
          <div className="score__card">
            <img src={crossImg} alt="X" />
            <span>X</span>
            <strong>{score.X}</strong>
          </div>
          <div className="score__card">
            <img src={ringImg} alt="O" />
            <span>O</span>
            <strong>{score.O}</strong>
          </div>
        </section>

        <div className="board">
          {board.map((v, i) => (
            <Cell
              key={i}
              value={v}
              onClick={() => makeMove(i)}
              highlight={status.line?.includes(i)}
            />
          ))}
          <WinningLine line={status.line} />
        </div>

        <footer className="hint">Auto-resets after each round ✨</footer>
      </div>
    </div>
  );
}


