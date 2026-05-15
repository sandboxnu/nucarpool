interface ProgressBarProps {
  step: number;
}

const ProgressBar = ({ step }: ProgressBarProps) => {
  return (
    <div className="z-10 mx-auto flex w-[600px] items-center gap-6 px-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 flex-1 rounded drop-shadow-[1px_6px_2px_rgba(0,0,0,0.35)] ${
            i < step
              ? "bg-northeastern-red"
              : i === step
                ? "bg-busy-red"
                : "bg-white"
          }`}
        />
      ))}
    </div>
  );
};
export default ProgressBar;
