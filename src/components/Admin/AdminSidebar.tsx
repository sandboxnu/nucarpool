type AdminSidebarProps = {
  option: string;
  setOption: React.Dispatch<React.SetStateAction<string>>;
};

const AdminSidebar = ({ option, setOption }: AdminSidebarProps) => {
  const baseButton =
    "px-4 py-2 text-northeastern-red font-montserrat text-base md:text-lg ";
  const selectedButton = " font-bold underline underline-offset-8 ";
  return (
    <div className="h-full w-full  ">
      <div className="mt-6 flex flex-col items-start gap-4">
        <button
          className={baseButton + (option === "management" && selectedButton)}
          onClick={() => setOption("management")}
        >
          Management
        </button>
        <button
          className={baseButton + (option === "data" && selectedButton)}
          onClick={() => setOption("data")}
        >
          Data
        </button>
      </div>
    </div>
  );
};
export default AdminSidebar;
