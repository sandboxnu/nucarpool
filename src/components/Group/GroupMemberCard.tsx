interface groupMemberCardProps {
  name: string;
  email: string;
}

export const GroupMemberCard = (props: groupMemberCardProps) => {
  return (
    <div className="m-2 flex items-center">
      <div className="flex-1">
        <h1 className="text-xl font-bold">{props.name}</h1>
        <p className="text-sm">{props.email}</p>
      </div>
      <div className="flex-grow"></div>
      <div className="flex items-center justify-center">
        <button className="w-[150px] rounded-md bg-red-700 px-4 py-2 text-white">
          {props.name}
        </button>
      </div>
    </div>
  );
};
