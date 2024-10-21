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
              <p>
              This application and any related transportation arrangements and
              services are provided on an ”AS IS” basis and without any warranty
              or condition, express, implied or statutory. User agrees and
              acknowledges that they assume full, exclusive and sole
              responsibility for the use of and reliance on any services through
              this application, including any ride arranged, offered, solicited,
              accepted or provided, and further agrees and acknowledges that
              their use is entirely at their own risk. User agrees to accept all
              risks associated with participating in any transportation
              arrangements or services engaged in through this application. This
              application and any related transportation services are created
              and are operated exclusively by Northeastern students;
              Northeastern University is not the provider of any transportation
              arrangements or services through this application and does not
              exercise any oversight or control over any transportation
              arrangements or services engaged in by users of this application.
              Northeastern University has no control over and is not responsible
              for this application or the safety of users or the suitability,
              quality, safety, maintenance, licensure, registration or insurance
              of any drivers, passengers or vehicles.
              </p> <br/>
              <p>
              User also agrees that Northeastern University is not responsible for the security or
              privacy of any data users provide or is collected by the use of the application. By
              using this application and participating in any transportation services or
              arrangements, the user agrees to accept all such risks and agrees that Northeastern
              University is not responsible for the acts or omissions of any users and is not liable
              for claims or damages, including property damage or personal injury, arising out of or
              related to use of the application or the transportation services or arrangements
              engaged in by users. User agrees to indemnify and hold harmless Northeastern,
              including all affiliates, subsidiaries, parents, successors and assigns, directors,
              employees, agents, from and against any claims, actions, suits, losses, costs,
              liabilities and expenses (including reasonable attorneys' fees) relating to or arising
              out of your use of this application and any related transportation arrangements and
              services. 
              </p> <br/>
              <p>
              By using the Carpool service, you acknowledge that you may receive emails related to system events, 
              actions taken by other users, updates to the service, and announcements about new features or products. 
              You also acknowledge that your email address may be shared with other users as necessary to facilitate carpool-related arrangements or interactions through the service. 
              By clicking the ”I Agree” button below, you confirm that you understand and accept these terms. 
              These terms are subject to updates, and continued use of the service constitutes acknowledgment of those updates.
              </p>
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
