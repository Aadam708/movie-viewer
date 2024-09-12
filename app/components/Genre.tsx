"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import Navbar from "./Navbar";
import Link from "next/link";
import SearchBar from "./SearchBar";

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
interface GenreProps {
  genre: string; 
  page: number;
}



// Load reviews from local storage for a specific movie
// @param {number} movieId - The ID of the movie for which to load reviews
// @returns {Review[]} - An array of reviews for the specified movie
const loadReviewsFromLocalStorage = (movieId: number): Review[] => {
  const reviews = localStorage.getItem(`movie-reviews-${movieId}`);
  return reviews ? JSON.parse(reviews) : [];
};

// Save reviews to local storage for a specific movie
// @param {number} movieId - The ID of the movie for which to save reviews
// @param {Review[]} reviews - An array of reviews to save for the specified movie
const saveReviewsToLocalStorage = (movieId: number, reviews: Review[]) => {
  localStorage.setItem(`movie-reviews-${movieId}`, JSON.stringify(reviews));
};

export default function Home({genre,page}:GenreProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [comment, setComment] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [sortOption, setSortOption] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Fetches a list of movies from the API when the component mounts
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/movie`,
          {
            params: {
              api_key: '28724032deea325171360465687c13a8',
              page: page,
              with_genres:genre
            },
          }
        );
        setMovies(response.data.results);
        setFilteredMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching  movies:", error);
      }
    };

    fetchMovies();
  }, []);

  // Loads reviews from local storage when the current movie changes
  useEffect(() => {
    if (currentMovie) {
      setReviews(loadReviewsFromLocalStorage(currentMovie.id));
    }
  }, [currentMovie]);

  // Handles submitting a new review for the current movie
  // Validates the rating and then updates the reviews list and local storage
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
      setErrorMessage("");
    }
  };

  // Fetches the trailer for a movie from the API based on its ID
  // @param {number} movieId - The ID of the movie for which to fetch the trailer
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
        setTrailer(trailers[1]);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  // Opens the modal to display movie details or reviews
  // @param {Movie} movie - The movie object to be displayed in the modal
  const openModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setIsModalOpen(true);
    setActiveTab('details');
    fetchTrailer(movie.id);
  };

  // Closes the movie details modal and resets state
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMovie(null);
    setTrailer(null);
  };

  // Handles changes in the rating input field
  // @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the rating input*
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 1 || value > 10) {
      setErrorMessage("Rating must be between 1 and 10.");
    } else {
      setErrorMessage("");
    }
    setRating(value);
  };

  // Filters the movies based on the user's search query
  // @param {string} query - The search query entered by the user
  const handleSearch = (query: string) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMovies(filtered);
  };

  // Renders star icons based on the rating value
  // @param {number} rating - The rating value to be represented by stars
  // @returns {JSX.Element} - A JSX element containing star icons

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    const emptyStars = Math.max(0, 10 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <>
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <FaStar key={`full-${i}`} className="text-yellow-400" />
          ))}
        {hasHalfStar && (
          <FaStarHalfAlt key="half" className="text-yellow-400" />
        )}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <FaRegStar key={`empty-${i}`} className="text-yellow-400" />
          ))}
      </>
    );
  };

  // Sorts the reviews based on the selected sorting option
  // @returns {Review[]} - A sorted array of reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'newest') {
      return reviews.indexOf(b) - reviews.indexOf(a); // Newest first
    } else if (sortOption === 'highest') {
      return b.rating - a.rating; // Highest rating first
    } else {
      return a.rating - b.rating; // Lowest rating first
    }
  });

  return (
    <main className="min-h-screen p-10 bg-gray-800">
      <h1 className="text-3xl font-bold mb-8">
        <Link href="/" className="text-white hover:text-red-400 transition-colors duration-300">
          Movie Viewer
        </Link>
      </h1>
      <Navbar />
      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-3 gap-8 mt-8">
        {filteredMovies.map((movie) => (
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
            <p className="text-sm text-center text-yellow-400">Rating: {Math.round((movie.vote_average + Number.EPSILON) * 10) / 10}</p>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {currentMovie && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">{currentMovie.title}</h2>

            <div className="flex mb-4">
              <button
                className={`px-4 py-2 mr-2 rounded border border-gray-400 ${
                  activeTab === 'details'
                    ? 'bg-gray-400 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                } transition-colors duration-300`}
                onClick={() => setActiveTab('details')}
              >
                Movie Details
              </button>
              <button
                className={`px-4 py-2 rounded border border-gray-400 ${
                  activeTab === 'reviews'
                    ? 'bg-gray-400 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                } transition-colors duration-300`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="mb-4">
                {trailer ? (
                  <div className="mb-4 flex flex-row justify-center">
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
                  <div className="mb-4 flex flex-row justify-center">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
                      alt={currentMovie.title}
                      width={250}
                      height={250}
                      className="object-cover mb-2 rounded"
                    />
                  </div>
                )}
                <p className="mb-4 text-center">{currentMovie.overview}</p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                <div className="border-t border-gray-300 pt-4">
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
                    <textarea
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

                  {/* Review Sorting Dropdown */}
                  <div className="flex justify-end mb-4">
                    <label className="mr-2">Sort by:</label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as 'newest' | 'highest' | 'lowest')}
                      className=" border border-gray-400 rounded-md p-2 -mt-2"
                    >
                      <option value="newest">Newest</option>
                      <option value="highest">Highest</option>
                      <option value="lowest">Lowest</option>
                    </select>
                  </div>

                  {/* Display existing reviews */}
                  <div className="mt-4">
                    <h3 className="text-xl mb-2">Reviews</h3>
                    {sortedReviews.length === 0 ? (
                      <p>No reviews yet.</p>
                    ) : (
                      <ul>
                        {sortedReviews.map((review, index) => (
                          <li key={index} className="mb-4 p-4 bg-gray-500 rounded-lg">
                            <div className="flex items-center mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-white">{review.comment}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </main>
  );
}
