export function idToImg(imdbLink: string) {
  const imdbKey = process.env.NEXT_PUBLIC_TMDB_KEY;
  const parts = imdbLink.split("/");
  const imdbId = parts.find((part) => part.startsWith("tt"));
  const imdbImgLink = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${imdbKey}&language=de&external_source=imdb_id`;
  return imdbImgLink;
}
