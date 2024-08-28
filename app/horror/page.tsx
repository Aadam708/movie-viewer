"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
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

// Helper function to load reviews from local storage
const loadReviewsFromLocalStorage = (movieId: number): Review[] => {
  const reviews = localStorage.getItem(`movie-reviews-${movieId}`);
  return reviews ? JSON.parse(reviews) : [];
};

// Helper function to save reviews to local storage
const saveReviewsToLocalStorage = (movieId: number, reviews: Review[]) => {
  localStorage.setItem(`movie-reviews-${movieId}`, JSON.stringify(reviews));
};

export default function Horror() {
  const [movies, setMovies] = useState<Movie[]>([]); // State to hold all fetched movies
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]); // State to hold movies filtered by search
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null); // State for the movie currently selected
  const [rating, setRating] = useState<number | null>(null); // State for the rating input value
  const [trailer, setTrailer] = useState<Trailer | null>(null); // State for the movie's trailer
  const [comment, setComment] = useState<string>(""); // State for the review comment input
  const [reviews, setReviews] = useState<Review[]>([]); // State to hold reviews for the current movie
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control the modal visibility
  const [errorMessage, setErrorMessage] = useState<string>(""); // State to hold error messages
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details'); // State to toggle between movie details and reviews tabs
  const [sortOption, setSortOption] = useState<'newest' | 'highest' | 'lowest'>('newest'); // State to sort reviews

  useEffect(() => {
    const fetchHorrorMovies = async () => {
      try {
        // Fetch horror movies from the API
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/movie`,
          {
            params: {
              api_key: '28724032deea325171360465687c13a8',
              with_genres: '27', // Genre ID for Horror
              page: 2
            },
          }
        );
        setMovies(response.data.results);
        setFilteredMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching Horror movies:", error);
      }
    };

    fetchHorrorMovies();
  }, []);

  useEffect(() => {
    if (currentMovie) {
      // Load reviews from local storage when the current movie is set
      setReviews(loadReviewsFromLocalStorage(currentMovie.id));
    }
  }, [currentMovie]);

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

  const fetchTrailer = async (movieId: number) => {
    try {
      // Fetch movie trailers from the API
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
        setTrailer(trailers[1]); // Set the second trailer from the list
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  // Function to open the modal and set the current movie
  const openModal = (movie: Movie) => {
    setCurrentMovie(movie);
    setIsModalOpen(true);
    setActiveTab('details');
    fetchTrailer(movie.id);
  };

  // Function to close the modal and reset state
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMovie(null);
    setTrailer(null);
  };

  // Function to handle changes in rating input
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < 1 || value > 10) {
      setErrorMessage("Rating must be between 1 and 10.");
    } else {
      setErrorMessage("");
    }
    setRating(value);
  };

  // Function to handle movie search
  const handleSearch = (query: string) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMovies(filtered);
  };

  // Function to render star ratings based on the review rating
  const renderStars = (rating: number) => {
    // Calculate the number of full stars, half stars, and empty stars
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

  // Sort reviews based on the selected option
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
      {/* Header section */}
      <h1 className="text-3xl font-bold mb-8">
        <Link href="/" className="text-white hover:text-red-400 transition-colors duration-300">
          Movie Viewer
        </Link>
      </h1>

      {/* Navbar component */}
      <Navbar />

      {/* Search bar component */}
      <SearchBar onSearch={handleSearch} />

      {/* Movie grid section */}
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

      {/* Modal component */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {currentMovie && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">{currentMovie.title}</h2>

            {/* Tab navigation buttons */}
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

            {/* Conditional rendering based on the active tab */}
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
                  {/* Review submission form */}
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
                              {/* Render star rating for each review */}
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
