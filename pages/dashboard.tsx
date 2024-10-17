import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const [bio, setBio] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [title, setTitle] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [story, setStory] = useState('');
  const router = useRouter();

  // Fetch artist's current bio and artworks
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login'); // Redirect to login if not authenticated
        return;
      }

      try {
        const bioRes = await axios.get('http://localhost:8080/artist/bio', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBio(bioRes.data.bio);

        const artworksRes = await axios.get('http://localhost:8080/artist/artworks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtworks(artworksRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update artist bio
  const updateBio = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8080/artist/bio',
        { bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Bio updated!');
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };

  // Upload new artwork
  const uploadArtwork = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/artist/artworks',
        { title, image_url: imageURL, price, story },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Artwork uploaded!');
      setTitle('');
      setImageURL('');
      setPrice(0);
      setStory('');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Delete artwork
  const deleteArtwork = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/artist/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtworks((prev) => prev.filter((art) => art.id !== id));
      alert('Artwork deleted!');
    } catch (error) {
      console.error('Failed to delete artwork:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Artist Dashboard</h1>

      {/* Artist Bio Section */}
      <div className="section bio-section">
        <h2>Update Your Bio</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write your bio here..."
        />
        <button onClick={updateBio}>Update Bio</button>
      </div>

      {/* Upload Artwork Section */}
      <div className="section upload-section">
        <h2>Upload New Artwork</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Artwork Title"
        />
        <input
          type="text"
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
          placeholder="Image URL"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          placeholder="Price in USD"
        />
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Write a story about the artwork..."
        />
        <button onClick={uploadArtwork}>Upload Artwork</button>
      </div>

      {/* Manage Uploaded Artworks Section */}
      <div className="section manage-artworks">
        <h2>Your Uploaded Artworks</h2>
        <div className="artworks-list">
          {artworks.map((art) => (
            <div key={art.id} className="artwork-item">
              <img src={art.image_url} alt={art.title} />
              <h3>{art.title}</h3>
              <p>Price: ${art.price.toFixed(2)}</p>
              <p>Story: {art.story}</p>
              <button onClick={() => deleteArtwork(art.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
