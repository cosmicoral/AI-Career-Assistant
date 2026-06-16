export function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="score-ring"
      style={{
        background: `conic-gradient(#0f3b73 ${score * 3.6}deg, #e7edf5 0deg)`
      }}
      aria-label={`Fit score ${score} out of 100`}
    >
      <div>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}
