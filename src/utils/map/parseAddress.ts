import { CarpoolFeature } from "../types";

export function parseMapboxFeature(feature: any): CarpoolFeature {
  let street = "";
  let city = "";
  let state = "";
  let buildingNumber = "";

  // extract from the main text field for street
  street = feature.text || "";

  // extract city and state from context array
  if (feature.context) {
    for (const context of feature.context) {
      // look for place (city)
      if (context.id.startsWith("place") && !city) {
        city = context.text;
      }
      // look for region (state)
      else if (context.id.startsWith("region") && !state) {
        state = context.text;
      }
      // check for neighborhood as fallback for city
      else if (context.id.startsWith("neighborhood") && !city) {
        city = context.text;
      }
      // check for locality as another fallback for city
      else if (context.id.startsWith("locality") && !city) {
        city = context.text;
      }
    }
  }

  // extract building number if present in street
  if (street && !buildingNumber) {
    const addressParts = street.split(" ");
    if (addressParts.length > 0 && !isNaN(Number(addressParts[0]))) {
      buildingNumber = addressParts[0];
      street = addressParts.slice(1).join(" ");
    }
  }

  // append building number if we found one
  if (buildingNumber && street) {
    street = `${buildingNumber} ${street}`;
  }

  // if we still don't have city/state, try to parse from place_name
  if (feature.place_name && (!street || !city || !state)) {
    const fallbackResult = parseAddressFromPlaceName(feature.place_name);

    if (!street && fallbackResult.street) {
      street = fallbackResult.street;
    }
    if (!city && fallbackResult.city) {
      city = fallbackResult.city;
    }
    if (!state && fallbackResult.state) {
      state = fallbackResult.state;
    }
  }

  return {
    id: feature.id,
    place_name: feature.place_name,
    center: feature.center,
    street: street || "",
    city: city || "",
    state: state || "",
    geometry: feature.geometry,
    properties: feature.properties,
    type: feature.type,
  };
}


function parseAddressFromPlaceName(placeName: string): { street: string; city: string; state: string } {
  let street = "";
  let city = "";
  let state = "";

  const parts = placeName.split(",").map(part => part.trim());

  // Parse street from first part
  if (parts.length > 0) {
    const streetParts = parts[0].split(" ");

    // Check if first part is a building number (convertible to integer)
    if (streetParts.length > 0 && !isNaN(Number(streetParts[0]))) {
      // Skip the building number and use the rest for street
      street = streetParts.slice(1).join(" ");
    } else {
      // Use entire first part as street
      street = parts[0];
    }
  }

  // Parse city from second part (if exists)
  if (parts.length > 1) {
    city = parts[1];
  }

  // Parse state from third part (if exists)
  if (parts.length > 2) {
    const stateZipParts = parts[2].split(" ");

    // Find state by taking all non-numeric parts before the first number
    const stateParts: string[] = [];
    for (const part of stateZipParts) {
      if (!isNaN(Number(part))) {
        // Stop when we hit a number (zip code)
        break;
      }
      stateParts.push(part);
    }

    state = stateParts.join(" ");
  }

  // If we still don't have state, try to extract from the second part
  if (!state && parts.length > 1) {
    const secondPart = parts[1];
    const secondPartSplit = secondPart.split(" ");

    // If second part has both city and state (less common but possible)
    if (secondPartSplit.length >= 2) {
      // Assume last word might be state abbreviation
      const potentialState = secondPartSplit[secondPartSplit.length - 1];
      if (potentialState.length === 2 && /^[A-Z]{2}$/.test(potentialState)) {
        state = potentialState;
        // Remove state from city
        city = secondPartSplit.slice(0, -1).join(" ");
      }
    }
  }

  return { street, city, state };
}
