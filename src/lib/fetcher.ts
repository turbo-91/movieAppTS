// useSWR fetcher

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error fetching movies");
  return response.json();
};
