import { Combobox, Transition } from "@headlessui/react";
import { Control, Controller, FieldError } from "react-hook-form";
import { OnboardingFormInputs } from "../pages/profile";
import { Fragment, SetStateAction, useMemo, useState } from "react";
import { CarpoolFeature, CarpoolAddress } from "../utils/types";
import { debounce } from "lodash";
import useSearch from "../utils/search";

interface ControlledAddressComboboxProps {
  control: Control<OnboardingFormInputs>;
  name: "startAddress" | "companyAddress";
  selectedAddress: CarpoolAddress;
  setSelectedAddress: (val: SetStateAction<CarpoolAddress>) => void;
  error?: FieldError;
}

const ControlledAddressCombobox = (props: ControlledAddressComboboxProps) => {
  const [addressSuggestions, setAddressSuggestions] = useState<
    CarpoolFeature[]
  >([]);

  const [address, setAddress] = useState("");

  const updateAddress = useMemo(() => debounce(setAddress, 250), []);

  useSearch({
    value: address,
    type: "address%2Cpostcode",
    setFunc: setAddressSuggestions,
  });

  return (
    <Controller
      name={props.name}
      control={props.control}
      render={({ field: { ref, ...fieldProps } }) => (
        <Combobox
          className={`relative w-full`}
          as="div"
          value={props.selectedAddress}
          onChange={(val: CarpoolFeature) => {
            console.log("onChange triggered");
            props.setSelectedAddress(val);
            fieldProps.onChange(val.place_name);
          }}
          ref={ref}
        >
          <Combobox.Input
            className={`w-full shadow-sm rounded-md px-3 py-2 h-12 ${
              props.error ? "border-northeastern-red" : "border-black"
            }`}
            displayValue={(feat: CarpoolAddress) =>
              feat.place_name ? feat.place_name : ""
            }
            type="text"
            onChange={(e) => {
              if (e.target.value === "") {
                props.setSelectedAddress({
                  place_name: "",
                  center: [0, 0],
                });
                fieldProps.onChange("");
              } else {
                updateAddress(e.target.value);
              }
            }}
          />
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute w-full rounded-md bg-white text-base shadow-lg focus:outline-none ">
              {addressSuggestions.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                addressSuggestions.map((feat) => (
                  <Combobox.Option
                    key={feat.id}
                    className={({ active }) =>
                      `cursor-default select-none p-3 border-black ${
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
