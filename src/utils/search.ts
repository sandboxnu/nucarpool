import { Feature, Geometry, GeoJsonProperties } from "geojson";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { trpc } from "./trpc";


/**
 * Constructs a function that allows for an API call using the given type which
 * will update a component using the given function with features from the API call
 * 
 * @param type the type of the object sent to the query, either "address%2Cpostcode" or "neighborhood%2Cplace"
 * @param setFunc the function which will be called to update with new features
 * @returns A function that responds to an update from an input element
 */
export default function handleSearch({
    type,
    setFunc
}: {
    type: "address%2Cpostcode" | "neighborhood%2Cplace", 
    setFunc: Dispatch<SetStateAction<Feature<Geometry, GeoJsonProperties>[]>>
}) {
    return async (
    e: React.ChangeEvent<HTMLInputElement>
    ) => {
        trpc.useQuery(["mapbox.search", {
        value: e.target.value,
        types: type,
        proximity: "ip",
        country: "us",
        autocomplete: true,
        }], {
        onSuccess: (data) => {
            setFunc(data?.features || []);
        },
        onError: (error) => {
            toast.error(`Something went wrong: ${error}`);
        }
        });
    };
}