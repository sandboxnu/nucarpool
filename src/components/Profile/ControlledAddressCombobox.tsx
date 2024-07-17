import { Combobox, Transition } from "@headlessui/react";
import { Control, Controller, FieldError } from "react-hook-form";
import { OnboardingFormInputs } from "../../pages/profile";
import { Fragment, SetStateAction } from "react";
import { CarpoolFeature, CarpoolAddress } from "../../utils/types";

interface ControlledAddressComboboxProps {
  control: Control<OnboardingFormInputs>;
  name: "startAddress" | "companyAddress";
  addressSelected: CarpoolAddress;
  addressSetter: (val: SetStateAction<CarpoolAddress>) => void;
  addressUpdater: (val: SetStateAction<string>) => void;
  addressSuggestions: CarpoolFeature[];
  error?: FieldError;
  isDisabled: boolean;
}

const ControlledAddressCombobox = (props: ControlledAddressComboboxProps) => {
  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field: { ref, ...fieldProps } }) => (
        <Combobox
          className={`relative w-full`}
          as="div"
          value={props.addressSelected}
          onChange={(val: CarpoolFeature) => {
            props.addressSetter(val);
            fieldProps.onChange(val.place_name);
          }}
          ref={ref}
        >
          {props.isDisabled ? (
            <input
              className={`h-12 w-full rounded-md bg-gray-100 px-3 py-2 text-gray-400 shadow-sm ${
                props.error ? "border-northeastern-red" : "border-gray-200"
              }`}
              type="text"
              disabled={true}
              value={props.addressSelected.place_name}
            />
          ) : (
            <Combobox.Input
              className={`h-12 w-full rounded-md px-3 py-2 shadow-sm ${
                props.error ? "border-northeastern-red" : "border-black"
              }`}
              displayValue={(feat: CarpoolAddress) =>
                feat.place_name ? feat.place_name : ""
              }
              type="text"
              onChange={(e) => {
                if (e.target.value === "") {
                  props.addressSetter({
                    place_name: "",
                    center: [0, 0],
                  });
                  fieldProps.onChange("");
                } else {
                  props.addressUpdater(e.target.value);
                }
              }}
            />
          )}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute w-full rounded-md bg-white text-base shadow-lg focus:outline-none ">
              {props.addressSuggestions.length === 0 ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                props.addressSuggestions.map((feat) => (
                  <Combobox.Option
                    key={feat.id}
                    className={({ active }) =>
                      `cursor-default select-none border-black p-3 ${
                        active ? "bg-blue-400 text-white" : "text-gray-900"
                      }`
                    }
                    value={feat}
                  >
                    {feat.place_name}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </Combobox>
      )}
    />
  );
};

export default ControlledAddressCombobox;
