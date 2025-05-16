import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from 'firebase/auth';
import logo from "./assets/logo.png";

/**
 * NavBar component renders the navigation bar with menu options and user profile.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string[]} [props.lists=[]] - Array of audition list names to display in the dropdown menu.
 * @returns {JSX.Element} The rendered navigation bar component.
 *
 * @example
 * <NavBar lists={['List 1', 'List 2']} />
 */
export default function NavBar({ lists = [] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleListClick = (listName) => {
    navigate('/', { state: { selectedList: listName } });
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    },
    dropdownMenu: {
      position: 'absolute',
      top: '40px',
      right: '0',
      backgroundColor: '#2A2B38',
      borderRadius: '5px',
      padding: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 2000,
      display: isMenuOpen ? 'block' : 'none',
    },
    menuItem: {
      color: 'whitesmoke',
      padding: '8px 15px',
      cursor: 'pointer',
      display: 'block',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease',
      fontSize: '22px',
    },
    subMenu: {
      paddingLeft: '15px',
      borderLeft: '2px solid #C52727',
    },
    userProfile: {
      borderTop: '1px solid #C52727',
      marginTop: '10px',
      paddingTop: '10px',
      color: 'whitesmoke',
      fontSize: '0.9rem'
    }
  };

  return (
    <nav>
      <img 
        src={logo} 
        alt="Logo" 
        className="Homelogo" 
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      />
      <div style={menuStyles.container}>
        <img
          className="menu-icon"
          width="35"
          height="35"
          src="https://img.icons8.com/material-outlined/35/F5F5F5/menu--v1.png"
          alt="menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ cursor: 'pointer' }}
        />
        <div style={menuStyles.dropdownMenu}>
          <div style={menuStyles.menuItem}>
            <div
              style={menuStyles.menuItem}
              onClick={() => navigate('/castform')}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Submit Audition
            </div>
          </div>
          <div style={menuStyles.menuItem}>
            <div
              style={menuStyles.menuItem}
              onClick={() => navigate('/create-brief')}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Create Brief
            </div>
          </div>
          <div style={menuStyles.menuItem}>
            Audition Lists
            <div style={menuStyles.subMenu}>
                {lists.length > 0 ? (
                lists.map((list, index) => (
                    <div
                    key={index}
                    style={menuStyles.menuItem}
                    onClick={() => handleListClick(list)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                    {list}
                    </div>
                ))
                ) : (
                <div
                    style={menuStyles.menuItem}
                    onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                    }}
                >
                    View All Lists
                </div>
                )}
            </div>
            </div>
          {auth.currentUser && (
            <div style={menuStyles.userProfile}>
              <div>{auth.currentUser.email}</div>
              <div 
                style={menuStyles.menuItem}
                onClick={handleLogout}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1E1F28'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}