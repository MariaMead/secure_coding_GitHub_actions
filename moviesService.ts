import {
    QuerySnapshot,
    DocumentData,
    DocumentSnapshot,
} from "firebase-admin/firestore";
import { Movie } from "../models/movieModel";
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
} from "../repositories/firestoreRepository";

const COLLECTION: string = "movies";

/**
 * Retrieves all movies from database.
 * @returns Array of all movies
 */
export const getAllMovies = async (): Promise<Movie[]> => {
    try {
        const snapshot: QuerySnapshot = await getDocuments(COLLECTION);
        const movies: Movie[] = snapshot.docs.map((doc) => {
            const data: DocumentData = doc.data();
            return {
                id: doc.id,
                ...data
            } as Movie;
        });

        return movies;
    } catch (error: unknown) {
        throw error;
    }
};

/**
 * Retrieves a single movie by ID from the database
 * @param id - The ID of the movie to retrieve
 * @returns - The movie by id found
 * @throws - Error when movie by given ID not found
 */
export const getMovieById = async (id: string): Promise<Movie> => {
    const doc: DocumentSnapshot | null = await getDocumentById(COLLECTION, id);

    if(!doc) {
        throw new Error (`Movie with ID ${id} not found`);
    }

    const data: DocumentData | undefined = doc.data();
    const movie: Movie = {
        id: doc.id,
        ...data,
    } as Movie;

    return structuredClone(movie);
}

/**
 * Creates a new movie 
 * @param movieData - The data for the new movie (title, description, genre)
 * optional rating.
 * @returns The created movie with generated ID
 */
export const createMovie = async (movieData: {
    title: string,
    description: string,
    genre: string,
    rating?: number
}): Promise<Movie> => {
    const dateNow = new Date();
    const newMovie: Partial<Movie> ={
        ...movieData,
        createdAt: dateNow
    };

    const movieId: string = await createDocument<Movie>(COLLECTION, newMovie);

    return structuredClone({ id: movieId, ... newMovie} as Movie);

};

/**
 * Updates an existing movie
 * @param id -The ID of the movie to update
 * @param movieData movieData - The field to update (title, description, genre)
 * @returns The updated movie
 * @throws Error if movie with given ID is not found
 */
export const updateMovie = async (
    id: string,
    movieData: Pick<Movie, "title" | "description" | "genre">
): Promise<Movie> => {
    const movie: Movie = await getMovieById(id);
    if (!movie) {
        throw new Error(`Movie with ID ${id} not found`);   
    }

    const updateMovie: Movie = movie;
    if (movieData.title !== undefined) updateMovie.title = movieData.title;
    if (movieData.description !== undefined)
        updateMovie.description = movieData.description;
    if (movieData.genre !== undefined) updateMovie.genre = movieData.genre;

    await updateDocument<Movie>(COLLECTION, id, updateMovie);

    return structuredClone(updateMovie);

}

/**
 * Deletes movie from the database
 * @param id id - The ID of the movie to delete
 * @throws - Error if movie with given ID is not found
 */
export const deleteMovie = async (id: string): Promise<void> => {
    const movie: Movie = await getMovieById(id);
    if(!movie) {
        throw new Error (`Movie with ID ${id} not found`);
    }

    await deleteDocument(COLLECTION, id);
}