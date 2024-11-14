interface ProgressBarProps {
  step: number;
}

const ProgressBar = ({ step }: ProgressBarProps) => {
  console.log(step);
  return (
    <div className="z-10 mt-48 flex w-full items-center justify-center space-x-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 w-40 rounded ${
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
