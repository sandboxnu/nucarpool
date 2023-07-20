import { Fragment, useState } from "react";

interface OverlayProps {
  onClose: () => void;
  children: JSX.Element;
}

const Overlay = (props: OverlayProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => {
    setIsOpen(false);
    props.onClose();
  };

  return (
    <Fragment>
      {isOpen && (
        <div className="">
          <div
            className="bg-black/[0.5] w-screen h-screen fixed top-0 left-0 cursor-pointer z-10"
            onClick={onClose}
          />
          <div className="bg-white fixed top-0 right-0 left-0 bottom-0 m-auto z-10 p-8 w-fit h-fit">
            <div className="flex justify-end items-center">
              <button
                className="border-0 bg-transparent text-4xl"
                type="button"
                onClick={onClose}
              />
            </div>
            {props.children}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Overlay;
