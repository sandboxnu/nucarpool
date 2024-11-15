interface ProgressBarProps {
  step: number;
}

const ProgressBar = ({ step }: ProgressBarProps) => {
  console.log(step);
  return (
    <div className="z-10 mx-auto flex w-[600px] items-center gap-6 px-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 flex-1 rounded ${
            i < step
              ? "bg-northeastern-red"
              : i === step
              ? "bg-busy-red"
              : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};
export default ProgressBar;
