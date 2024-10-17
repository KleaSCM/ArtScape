import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import styles from '../styles/artists.module.scss'; 

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const res = await axios.get('http://localhost:8080/artists');
      setArtists(res.data);
      setFilteredArtists(res.data); // Initialize filtered list
    } catch (error) {
      console.error('Failed to fetch artists', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = artists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(query) 
    );
    setFilteredArtists(filtered);
  };

  const handleViewProfile = (artistId) => {
    router.push(`/artist/${artistId}`);
  };

  return (
    <div>
      <Navbar />
      <div className={styles['artists-page']}>
        {/* Search Bar */}
        <div className={styles['search-bar']}>
          <input
            type="text"
            placeholder="Search for artists..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Artists Grid */}
        <div className={styles['artists-grid']}>
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => (
              <div key={artist.id} className={styles['artist-card']}>
                <img
                  src={artist.profile_image || '/default-profile.jpg'} // Default profile image
                  alt={artist.name}
                  className={styles['profile-image']}
                />
                <div className={styles['artist-info']}>
                  <h3>{artist.name}</h3>
                  <p>{artist.bio.substring(0, 100)}...</p> {/* Show only first 100 characters of bio */}
                  <button onClick={() => handleViewProfile(artist.id)}>View Profile</button>
                </div>
              </div>
            ))
          ) : (
            <p>No artists found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Artists;
