// RequestContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { Request } from "./types";
import data from "../components/Messages/data.json";

interface RequestProviderProps {
  children: React.ReactNode;
}

type RequestContextType = {
  requests: Request[];
};

export const RequestContext = createContext<RequestContextType | undefined>(
  undefined
);

export const RequestProvider = ({ children }: RequestProviderProps) => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    // Simulate fetching data from an API or database
    setRequests(data.requests);
  }, []);

  return (
    <RequestContext.Provider value={{ requests }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequests must be used within a RequestProvider");
  }
  return context;
};
