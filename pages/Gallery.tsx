import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import styles from '../styles/gallery.module.scss'; 

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Number of artworks per page
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchArtworks();
  }, [page]);

  const fetchArtworks = async () => {
    try {
      const res = await axios.get('http://localhost:8080/artworks', { params: { page, limit } });
      setArtworks(res.data);
      setFilteredArtworks(res.data);
      setTotalPages(Math.ceil(res.data.length / limit)); // Set total pages dynamically
    } catch (error) {
      console.error('Failed to fetch artworks', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = artworks.filter(
      (art) =>
        art.title.toLowerCase().includes(query) ||
        art.artist.toLowerCase().includes(query) 
    );
    setFilteredArtworks(filtered);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles['gallery-page']}>
        {/* Search Bar */}
        <div className={styles['search-bar']}>
          <input
            type="text"
            placeholder="Search for artworks or artists..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Artworks Grid */}
        <div className={styles['artworks-grid']}>
          {filteredArtworks.length > 0 ? (
            filteredArtworks.map((art) => (
              <div key={art.id} className={styles['art-card']}>
                <img src={art.image_url} alt={art.title} className={styles['art-thumbnail']} />
                <div className={styles['art-info']}>
                  <h3>{art.title}</h3>
                  <p>{art.artist}</p> {/*  */}
                  <button onClick={() => router.push(`/artwork/${art.id}`)}>View Details</button>
                </div>
              </div>
            ))
          ) : (
            <p>No artworks found.</p>
          )}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
