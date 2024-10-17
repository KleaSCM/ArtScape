import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/Navbar.module.scss'; 

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">ArtScape</Link>
      </div>
      <ul className={styles['nav-links']}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/Gallery">Gallery</Link>
        </li>
        <li>
          <Link href="/artists">artists</Link>
        </li>
        <li>
          <Link href="/cart">Cart</Link>
        </li>
        {!isLoggedIn ? (
          <>
            <li>
              <Link href="/register">Register</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <button onClick={handleLogout} className={styles['logout-btn']}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
