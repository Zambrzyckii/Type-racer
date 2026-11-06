import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login form', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});
