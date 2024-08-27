"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import { FaStar } from 'react-icons/fa';
import Navbar from "../components/Navbar";
import Link from "next/link";

// Interfaces for TypeScript type definitions

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
}

interface Review {
  rating: number;
  comment: string;
}

interface Trailer {
  key: string;
  site: string;
}

// Helper functions for local storage

/**
 * Load reviews from local storage for a specific movie.
 * @param movieId - The ID of the movie for which to load reviews.
 * @returns Array of reviews for the movie.
 */
const loadReviewsFromLocalStorage = (movieId: number): Review[] => {
  const reviews = localStorage.getItem(`movie-reviews-${movieId}`);
  return reviews ? JSON.parse(reviews) : [];
};

/**
 * Save reviews to local storage for a specific movie.
 * @param movieId - The ID of the movie for which to save reviews.
 * @param reviews - Array of reviews to be saved.
 */
const saveReviewsToLocalStorage = (movieId: number, reviews: Review[]) => {
  localStorage.setItem(`movie-reviews-${movieId}`, JSON.stringify(reviews));
};

export default function Horror() {
  // State hooks
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Fetch horror movies from the API when the component mounts
  useEffect(() => {
    const fetchHorrorMovies = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/movie`,
          {
            params: {
              api_key: '28724032deea325171360465687c13a8',
              with_genres: '27', // Genre ID for Horror
              page: 2 // Page 2 movies
            },
          }
        );
        setMovies(response.data.results); // Update state with fetched movies
      } catch (error) {
        console.error("Error fetching Horror movies:", error);
      }
    };

    fetchHorrorMovies();
  }, []);

  // Load reviews from local storage when the current movie changes
  useEffect(() => {
    if (currentMovie) {
      setReviews(loadReviewsFromLocalStorage(currentMovie.id));
    }
  }, [currentMovie]);

  /**
   * Handle the submission of a review.
   */
  const handleReviewSubmit = () => {
    if (currentMovie && rating !== null && comment) {
      if (rating < 1 || rating > 10) {
        setErrorMessage("Rating must be between 1 and 10.");
        return;
      }
      const newReview: Review = { rating, comment };
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      saveReviewsToLocalStorage(currentMovie.id, updatedReviews);
      setRating(null);
      setComment("");
      setErrorMessage(""); // Clear error message on successful submission
    }
  };

  /**
   * Fetch the trailer for a specific movie.
   * @param movieId - The ID of the movie for which to fetch the trailer.
   */
  const fetchTrailer = async (movieId: number) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos`,
        {
          params: {
            api_key: '28724032deea325171360465687c13a8',
            language: 'en-US',
          },
        }
      );
      const trailers = response.data.results.filter((video: Trailer) => video.site === 'YouTube');
      if (trailers.length > 0) {
        setTrailer(trailers[0]); // Set the first YouTube trailer
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  /**
   * Open the modal for a specific movie and fetch its trailer.
   * @param movie - The movie to be displayed in the modal.
   */
  const openModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setIsModalOpen(true); // Open the modal
    fetchTrailer(movie.id); // Fetch the trailer for the movie
  };

  /**
   * Close the modal and clear the current movie and trailer.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMovie(null);
    setTrailer(null);
  };

  /**
   * Handle changes to the rating input field.
   * @param e - The change event from the input field.
   */
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 1 || value > 10) {
      setErrorMessage("Rating must be between 1 and 10.");
    } else {
      setErrorMessage("");
    }
    setRating(value);
  };

  return (
    <main className="min-h-screen p-10 bg-gray-800">
      <h1 className="text-3xl font-bold mb-8">
        <Link href="/"
          className="text-white hover:text-red-400 transition-colors duration-300">
          Movie Viewer
        </Link>
      </h1>
      <Navbar />

      {/* Grid of horror movies */}
      <div className="grid grid-cols-3 gap-8">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="relative p-4 flex flex-col items-center bg-gray-800 rounded-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={() => openModal(movie)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={200}
              height={300}
              className="object-cover mb-2 rounded"
            />
            <h2 className="text-xl font-semibold mb-2 text-center text-white">{movie.title}</h2>
            <p className="text-sm text-center mb-2 text-gray-300">{movie.overview.substring(0, 100)}...</p>
            <p className="text-sm text-center text-yellow-400">
              Rating: {Math.round((movie.vote_average + Number.EPSILON) * 10) / 10}
            </p>
          </div>
        ))}
      </div>

      {/* Modal for displaying movie details and reviews */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {currentMovie && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">{currentMovie.title}</h2>
            {trailer ? (
              <div className="mb-4">
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={currentMovie.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="object-cover"
                ></iframe>
              </div>
            ) : (
              <img
                src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
                alt={currentMovie.title}
                width={300}
                height={300}
                className="object-cover mb-2 rounded"
              />
            )}
            <p className="mb-4 text-center">{currentMovie.overview}</p>

            {/* Review submission form */}
            <div className="border-t border-gray-300 pt-4 w-full max-w-4xl">
              <h3 className="text-xl mb-2">Leave a Review</h3>
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center mb-2">
                  <FaStar className="text-yellow-400 mr-2" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rating || ""}
                    onChange={handleRatingChange}
                    placeholder="Rating (1-10)"
                    className={`border p-2 mr-4 w-20 ${errorMessage ? 'border-red-500' : ''}`}
                  />
                </div>
                {errorMessage && (
                  <p className="text-red-500 mb-2">{errorMessage}</p>
                )}
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Your review"
                  className="border p-2 w-full max-w-2xl mb-4"
                />
                <button
                  onClick={handleReviewSubmit}
                  className="bg-black text-white py-2 px-4"
                >
                  Submit
                </button>
              </div>

              {/* Display existing reviews */}
              <div className="mt-4">
                <h3 className="text-xl mb-2">Reviews</h3>
                {reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  <ul>
                    {reviews.map((review, index) => (
                      <li key={index} className="border-b py-2">
                        {review.rating} stars: {review.comment}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
