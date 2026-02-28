import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosConfig";

export interface Author {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  postCount: number;
}

export interface AuthorDetail extends Author {
  posts: {
    id: string;
    title: string;
    slug: string;
    description: string;
    featuredImage: string;
    category: {
      id: string;
      name: string;
    };
    createdAt: string;
  }[];
}

const fetchAuthors = async (): Promise<Author[]> => {
  const response = await axiosInstance.get<Author[]>('/authors');
  return response.data;
};

const useAuthors = () => {
  return useQuery<Author[], Error>({
    queryKey: ['authors'],
    queryFn: fetchAuthors,
  });
};

export const useAuthor = (id: string) => {
  return useQuery<AuthorDetail, Error>({
    queryKey: ['author', id],
    queryFn: async () => {
      const response = await axiosInstance.get<AuthorDetail>(`/authors/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export default useAuthors;
