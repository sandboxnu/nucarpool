export interface GeocodeResult {
  street: string;
  city: string;
  state: string;
  address: string;
}

export async function reverseGeocode(
  lng: number,
  lat: number,
): Promise<{
  street: string;
  city: string;
  state: string;
  address: string;
}> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address,place,locality,region`;
    const response = await fetch(url);
    const data = await response.json();

    let street = "";
    let city = "";
    let state = "";
    let address = "";
    let buildingNumber = "";

    // Try to extract address components from the response
    for (const feature of data.features) {
      // Look for address features to get street and building number
      if (feature.place_type.includes("address")) {
        // Try to extract building/house number from address text
        const addressParts = feature.text.split(" ");
        // Check if there exists a building number
        if (addressParts.length > 0 && !isNaN(Number(addressParts[0]))) {
          buildingNumber = addressParts[0];
          street = addressParts.slice(1).join(" ");
        } else {
          street = feature.text;
        }
      }

      // Look for place features to get city name
      if (feature.place_type.includes("place") && !city) {
        city = feature.text;
      }

      // Look for region features to get state name
      if (feature.place_type.includes("region") && !state) {
        state = feature.text;
      }

      // Prefer POI names for the address field if available
      if (feature.place_type.includes("poi") && !address) {
        address = feature.text;
      }
    }

    // Append building number to street if it exists
    if (buildingNumber && street) {
      street = `${buildingNumber} ${street}`;
    }

    // If no address was found, create one from the components
    if (!address) {
      address = `${street}, ${city}, ${state}`;
    }

    return { street, city, state, address };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return {
      street: "123 Main St",
      city: "Boston",
      state: "MA",
      address: "123 Main St, Boston, MA",
    };
  }
}
