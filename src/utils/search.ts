import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { trpc } from "./trpc";
import { CarpoolFeature } from "./types";

/**
 * Listens to updates from `value` - on updates, new queries are sent to Mapbox search, with customization
 * of `type` as well as a function to handle the return values.
 *
 * @param value the search value to "listen" to
 * @param type the type of the object sent to the query, either "address%2Cpostcode" or "neighborhood%2Cplace"
 * @param setFunc the function which will be called to update with new features
 */
export default function useSearch({
  value,
  type,
  setFunc,
}: {
  value: string;
  type: "address%2Cpostcode" | "neighborhood%2Cplace";
  setFunc: Dispatch<SetStateAction<CarpoolFeature[]>>;
}) {
  const query = trpc.mapbox.search.useQuery(
    {
      value: value,
      types: type,
      proximity: "ip",
      country: "us",
      autocomplete: true,
    },
    {
      onSuccess: (data) => {
        /* the standard Feature type does not describe the full breadth of properties 
        available such as "place_name" and "center" */
        setFunc((data?.features || []) as CarpoolFeature[]);
      },
      onError: (error) => {
        toast.error(`Something went wrong: ${error}`);
      },
      enabled: false,
    },
  );
  useEffect(() => {
    if (value) {
      query.refetch();
    }
  }, [value, query]);
}
