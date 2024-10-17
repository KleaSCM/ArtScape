import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useCart } from '../../contexts/cartContext';

const ArtworkDetail = () => {
  const [artwork, setArtwork] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchArtwork(id);
    }
  }, [id]);

  const fetchArtwork = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/artworks/${id}`);
      setArtwork(res.data);
    } catch (error) {
      console.error('Failed to fetch artwork:', error);
    }
  };

  if (!artwork) return <div>Loading...</div>;

  return (
    <div>
      <img src={artwork.image_url} alt={artwork.title} />
      <h1>{artwork.title}</h1>
      <p>Artist: {artwork.artist}</p>
      <p>Price: ${artwork.price}</p>
      <button onClick={() => addToCart(artwork)}>Add to Cart</button>
    </div>
  );
};

export default ArtworkDetail;
