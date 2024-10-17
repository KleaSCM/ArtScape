import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Artwork {
  id: number;
  title: string;
  image_url: string;
}

const UserProfile = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [bio, setBio] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const userRes = await axios.get(`http://localhost:8080/users/${id}`);
      setBio(userRes.data.bio);

      const artworksRes = await axios.get('http://localhost:8080/artworks', {
        params: { user_id: id },
      });
      setArtworks(artworksRes.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      <p>{bio}</p>

      <div className="artworks">
        {artworks.map((art) => (
          <div key={art.id} className="art-card">
            <img src={art.image_url} alt={art.title} />
            <h3>{art.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
