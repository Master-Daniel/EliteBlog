import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosConfig";

// Define your Author type/interface
export interface Author {
  id: string;
  name: string;
  // add additional fields if necessary
}

// Async function to fetch authors using your axiosInstance
const fetchAuthors = async (): Promise<Author[]> => {
  const response = await axiosInstance.get<Author[]>('/authors');
  return response.data;
};

// Custom hook using react-query with the object syntax
const useAuthors = () => {
  return useQuery<Author[], Error>({
    queryKey: ['authors'],
    queryFn: fetchAuthors,
  });
};

export default useAuthors;
