import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const OPEN_LIBRARY_API = 'https://openlibrary.org';

export const searchBooks = async (query) => {
  const response = await axios.get(`${OPEN_LIBRARY_API}/search.json?q=${query}`);
  return response.data.docs;
};

export const getBookDetails = async (id) => {
  const response = await axios.get(`${OPEN_LIBRARY_API}/works/${id}.json`);
  return response.data;
};

export const getBookCover = (coverId) => {
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
};
