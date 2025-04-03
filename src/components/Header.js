import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  h1 {
    color: #4a6fa5;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-left: 20px;
  }

  a {
    color: #333;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 5px;
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    
    &:hover, &.active {
      background-color: #4a6fa5;
      color: white;
    }
  }
`;

export default function Header({ onAdminClick }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Logo>
        <h1>Notes App</h1>
      </Logo>
      <Nav>
        <ul>
          <li><a href="#" className="active">Home</a></li>
          {currentUser && currentUser.isAdmin && (
            <li><a onClick={onAdminClick}>Admin Panel</a></li>
          )}
          <li><a onClick={handleLogout}>Logout</a></li>
        </ul>
      </Nav>
    </HeaderContainer>
  );
}