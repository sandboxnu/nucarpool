import { useState } from "react";
import { Dialog } from "@headlessui/react";

export const ComplianceModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <Dialog open={isOpen} onClose={() => {}}>
      <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="flex h-4/6 w-5/6 flex-col content-center justify-center gap-4 rounded-md bg-white p-9 shadow-md sm:h-4/6 sm:w-4/6 md:h-3/6 md:w-3/6">
            <Dialog.Title className="text-center text-2xl font-bold">
              Carpool Terms and Conditions
            </Dialog.Title>
            <div className="scroll overflow-y-auto">
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots in a piece of classical Latin literature from 45 BC,
              making it over 2000 years old. Richard McClintock, a Latin
              professor at Hampden-Sydney College in Virginia, looked up one of
              the more obscure Latin words, consectetur, from a Lorem Ipsum
              passage, and going through the cites of the word in classical
              literature, discovered the undoubtable source. Lorem Ipsum comes
              from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et (The
              Extremes of Good and Evil) by Cicero, written in 45 BC. This book
              is a treatise on the theory of ethics, very popular during the
              Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit
              amet, comes from a line in section 1.10.32. The standard chunk of
              Lorem Ipsum used since the 1500s is reproduced below for those
              interested. Sections 1.10.32 and 1.10.33 from de Finibus Bonorum
              et Malorum by Cicero are also reproduced in their exact original
              form, accompanied by English versions from the 1914 translation by
              H. Rackham.testing
            </div>
            <button
              className="w-25 rounded-md border-2 border-red-700 bg-red-700 p-1 text-slate-50 "
              onClick={() => setIsOpen(false)}
            >
              I Agree
            </button>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};
