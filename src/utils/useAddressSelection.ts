import { useState, useMemo } from "react";
import { debounce } from "lodash";
import useSearch from "../utils/search";
import { CarpoolAddress, CarpoolFeature } from "./types";

export const useAddressSelection = (
  initialAddress: CarpoolAddress = {
    place_name: "",
    center: [0, 0],
    street: "",
    city: "",
    state: ""
  },
) => {
  const [selectedAddress, setSelectedAddress] =
    useState<CarpoolAddress>(initialAddress);
  const [address, setAddress] = useState<string>("");
  const [suggestions, setSuggestions] = useState<CarpoolFeature[]>([]);

  const updateAddress = useMemo(() => debounce(setAddress, 250), []);

  useSearch({
    value: address,
    type: "address%2Cpostcode",
    setFunc: setSuggestions,
  });

  return { selectedAddress, setSelectedAddress, updateAddress, suggestions };
};
