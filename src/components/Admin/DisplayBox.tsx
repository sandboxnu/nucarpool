interface DisplayBoxProps {
  data: {
    data: number | string;
    label: string;
  }[];
  title: string;
}
const DisplayBox = ({ data, title }: DisplayBoxProps) => {
  return (
    <div className="flex flex-col justify-center space-y-2 rounded-lg border border-black p-6 font-montserrat drop-shadow-2xl  ">
      <div className="text-center text-2xl font-bold">{title}</div>
      <div className="grid grid-flow-col items-center gap-1 divide-x text-center">
        {data.map((data, index) => {
          return (
            <div
              key={index}
              className="flex h-full w-full flex-col  p-2 text-base"
            >
              <strong>{data.label}: </strong>
              {data.data}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplayBox;
