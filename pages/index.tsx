import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Slider from 'react-slick'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from '../components/Navbar'; 
import styles from '../styles/home.module.scss'; 

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter();

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await axios.get('http://localhost:8080/artworks');
      const allArtworks = res.data;

      setArtworks(allArtworks);

      // Select 4 random artworks for the hero section
      if (allArtworks.length > 0) {
        const randomArtworks = allArtworks.sort(() => 0.5 - Math.random()).slice(0, 4);
        setFeaturedArtworks(randomArtworks);
      }

      setLoading(false); // End loading
    } catch (error) {
      console.error('Failed to fetch artworks', error);
      setLoading(false); // End loading even on error
    }
  };

  // Settings for the react-slick slider (hero section)
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  if (loading) {
    return <div className={styles.loading}>Loading artworks...</div>; // Loading state
  }

  return (
    <div className={styles.home}>
      <Navbar /> {/*  */}

      {/* Hero Section: Slideshow of Featured Artworks */}
      <div className={styles['hero-section']}>
        {featuredArtworks.length > 0 ? (
          <Slider {...sliderSettings}>
            {featuredArtworks.map((art) => (
              <div key={art.id} className={styles['hero-slide']}>
                <img src={art.image_url} alt={art.title} className={styles['hero-image']} />
                <div className={styles['hero-caption']}>
                  <h2>{art.title}</h2>
                  <button onClick={() => router.push(`/artwork/${art.id}`)}>View Artwork</button>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p>No featured artworks available.</p>
        )}
      </div>

      {/* Gallery Section: Display a scrollable gallery of artworks */}
      <div className={styles.gallery}>
        <h1>Art Gallery</h1>
        {artworks.length > 0 ? (
          <div className={styles['artworks-grid']}>
            {artworks.map((art) => (
              <div
                key={art.id}
                className={styles['art-card']}
                onClick={() => router.push(`/artwork/${art.id}`)}
              >
                <img src={art.image_url} alt={art.title} className={styles['art-thumbnail']} />
                <h3>{art.title}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles['no-artworks']}>
            <p>No artworks have been uploaded yet.</p>
            <button onClick={() => router.push('/dashboard')}>Become an Artist</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
