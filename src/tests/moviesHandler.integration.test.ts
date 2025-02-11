import moviesHandler from "@/pages/api/movies";
import { createMocks } from "node-mocks-http";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Movie from "@/db/models/Movie";

let mongoServer: MongoMemoryServer;
jest.setTimeout(30000); // Increase timeout to 30 seconds, bc database exchanges need time

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "testdb" });
});

afterEach(async () => {
  await Movie.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Movies API - Integration Test", () => {
  // getAllMovies test
  test("getAllMovies should return all movies with status 200", async () => {
    await Movie.create([
      {
        netzkinoId: 1,
        slug: "movie-1",
        title: "Movie 1",
        year: "2022",
        overview: "This is movie 1",
        regisseur: "Director 1",
        stars: "Star 1, Star 2",
        imgNetzkino: "image1.jpg",
        imgNetzkinoSmall: "image1-small.jpg",
        imgImdb: "imdb1.jpg",
        queries: ["action"],
        dateFetched: "2024-02-11",
      },
    ]);

    const { req, res } = createMocks({ method: "GET" });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData();
    expect(responseData.length).toBe(1);
    expect(responseData[0]).toHaveProperty("title", "Movie 1");
  });

  test("getAllMovies should return 404 if no movies exist", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ status: "Not Found" });
  });

  // getMovieBySlug test

  test("getMovieBySlug should return a movie by slug with status 200", async () => {
    const movieData = {
      netzkinoId: 1,
      slug: "movie-1",
      title: "Movie 1",
      year: "2022",
      overview: "This is movie 1",
      regisseur: "Director 1",
      stars: "Star 1, Star 2",
      imgNetzkino: "image1.jpg",
      imgNetzkinoSmall: "image1-small.jpg",
      imgImdb: "imdb1.jpg",
      queries: ["action"],
      dateFetched: "2024-02-11", // Single string (matches model)
    };

    await Movie.create(movieData);

    const { req, res } = createMocks({
      method: "GET",
      query: { slug: "movie-1" }, // Pass slug as query param
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData();

    // Fix: Check the first movie in the array
    expect(Array.isArray(responseData)).toBe(true);
    expect(responseData.length).toBe(1);
    expect(responseData[0]).toHaveProperty("slug", "movie-1");
    expect(responseData[0]).toHaveProperty("title", "Movie 1");
  });

  test("getMovieBySlug should return 404 if movie with slug is not found", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { slug: "non-existing-movie" }, // Slug does not exist
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ status: "Not Found" });
  });

  // getMovieByQuery test

  test("should return movies matching the query with status 200", async () => {
    await Movie.create([
      {
        netzkinoId: 1,
        slug: "movie-1",
        title: "Movie 1",
        year: "2022",
        overview: "This is movie 1",
        regisseur: "Director 1",
        stars: "Star 1, Star 2",
        imgNetzkino: "image1.jpg",
        imgNetzkinoSmall: "image1-small.jpg",
        imgImdb: "imdb1.jpg",
        queries: ["action"], // ✅ Matching query
        dateFetched: "2024-02-11",
      },
      {
        netzkinoId: 2,
        slug: "movie-2",
        title: "Movie 2",
        year: "2023",
        overview: "This is movie 2",
        regisseur: "Director 2",
        stars: "Star A, Star B",
        imgNetzkino: "image2.jpg",
        imgNetzkinoSmall: "image2-small.jpg",
        imgImdb: "imdb2.jpg",
        queries: ["action"], // ✅ Matching query
        dateFetched: "2024-02-11",
      },
      {
        netzkinoId: 3,
        slug: "movie-3",
        title: "Movie 3",
        year: "2024",
        overview: "This is movie 3",
        regisseur: "Director 3",
        stars: "Star X, Star Y",
        imgNetzkino: "image3.jpg",
        imgNetzkinoSmall: "image3-small.jpg",
        imgImdb: "imdb3.jpg",
        queries: ["drama"], // ❌ Does not match "action"
        dateFetched: "2024-02-11",
      },
    ]);

    const { req, res } = createMocks({
      method: "GET",
      query: { query: "action" }, // ✅ Searching for movies with "action"
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData();
    expect(responseData.length).toBe(2); // ✅ Two movies match the query
    expect(responseData[0]).toHaveProperty("queries", ["action"]);
    expect(responseData[1]).toHaveProperty("queries", ["action"]);
  });

  test("should return 404 if no movies match the query", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { query: "sci-fi" }, // ❌ No movies have "sci-fi" in queries
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      status: "No movies found for the given query",
    });
  });

  // createMovie and createMovies tests

  test("createMovie should create a single movie successfully", async () => {
    const movieData = {
      netzkinoId: 1,
      slug: "movie-1",
      title: "Movie 1",
      year: "2022",
      overview: "This is movie 1",
      regisseur: "Director 1",
      stars: "Star 1, Star 2",
      imgNetzkino: "image1.jpg",
      imgNetzkinoSmall: "image1-small.jpg",
      imgImdb: "imdb1.jpg",
      queries: ["action"],
      dateFetched: "2024-02-11",
    };

    const { req, res } = createMocks({
      method: "POST",
      body: movieData,
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const responseData = res._getJSONData();
    expect(responseData.success).toBe(true);
    expect(responseData.status).toBe("Movie created");
    expect(responseData.data).toHaveProperty("title", "Movie 1");

    // Verify in the database
    const createdMovie = await Movie.findOne({ slug: "movie-1" });
    expect(createdMovie).not.toBeNull();
    expect(createdMovie?.title).toBe("Movie 1");
  });

  test("createMovies should create multiple movies successfully", async () => {
    const moviesData = [
      {
        netzkinoId: 2,
        slug: "movie-2",
        title: "Movie 2",
        year: "2023",
        overview: "This is movie 2",
        regisseur: "Director 2",
        stars: "Star A, Star B",
        imgNetzkino: "image2.jpg",
        imgNetzkinoSmall: "image2-small.jpg",
        imgImdb: "imdb2.jpg",
        queries: ["drama"],
        dateFetched: "2024-02-11",
      },
      {
        netzkinoId: 3,
        slug: "movie-3",
        title: "Movie 3",
        year: "2024",
        overview: "This is movie 3",
        regisseur: "Director 3",
        stars: "Star X, Star Y",
        imgNetzkino: "image3.jpg",
        imgNetzkinoSmall: "image3-small.jpg",
        imgImdb: "imdb3.jpg",
        queries: ["thriller"],
        dateFetched: "2024-02-11",
      },
    ];

    const { req, res } = createMocks({
      method: "POST",
      body: moviesData,
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const responseData = res._getJSONData();
    expect(responseData.success).toBe(true);
    expect(responseData.status).toBe("Movies created");
    expect(responseData.data).toHaveLength(2);
    expect(responseData.data[0]).toHaveProperty("title", "Movie 2");
    expect(responseData.data[1]).toHaveProperty("title", "Movie 3");

    // Verify in the database
    const createdMovies = await Movie.find();
    expect(createdMovies.length).toBe(2);
  });

  test("createMovie should return 400 if required fields are missing for a single movie", async () => {
    const incompleteMovieData = {
      title: "Incomplete Movie",
    };

    const { req, res } = createMocks({
      method: "POST",
      body: incompleteMovieData,
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty(
      "error",
      "Missing required fields"
    );
  });

  test("createMovies should return 400 if required fields are missing for multiple movies", async () => {
    const incompleteMoviesData = [
      { title: "Movie Without Required Fields" },
      { title: "Another Incomplete Movie" },
    ];

    const { req, res } = createMocks({
      method: "POST",
      body: incompleteMoviesData,
    });

    await moviesHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toHaveProperty(
      "error",
      "Missing required fields"
    );
  });
});
