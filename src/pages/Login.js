import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 15px 30px;
  text-align: center;

  h1 {
    color: #4a6fa5;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
`;

const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px;
`;

const AuthBox = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 30px;
`;

const Form = styled.form`
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }
`;

const Button = styled.button`
  display: inline-block;
  padding: 10px 20px;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #166088;
  }
`;

const Message = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  background-color: ${props => props.type === 'error' ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.type === 'error' ? '#dc3545' : '#28a745'};
  display: ${props => props.show ? 'block' : 'none'};
`;

const LinkText = styled.p`
  margin-top: 20px;
  text-align: center;

  a {
    color: #4a6fa5;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Header>
        <h1>Notes App</h1>
      </Header>
      <Main>
        <AuthBox>
          <h2>Login to Your Account</h2>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormGroup>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Message show={error} type="error">
              {error}
            </Message>
          </Form>
          <LinkText>
            Don't have an account? <Link to="/register">Register</Link>
          </LinkText>
        </AuthBox>
      </Main>
    </Container>
  );
}