/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import AuthenticationPage from '../page';
import { useUser } from '@/firebase';

// Mock the necessary hooks and modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/firebase', () => ({
  ...jest.requireActual('@/firebase'), // import and retain all actual exports
  useUser: jest.fn(), // mock useUser
  useAuth: () => ({
    signOut: jest.fn(),
  }),
  initiateEmailSignIn: jest.fn(),
  initiateEmailSignUp: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));


describe('AuthenticationPage', () => {
  const mockedUseUser = useUser as jest.Mock;

  it('renders sign-in form by default and allows switching to sign-up', async () => {
    mockedUseUser.mockReturnValue({ user: null, isUserLoading: false });
    
    render(<AuthenticationPage />);

    // Check for the Sign In tab's title and description
    expect(screen.getByRole('heading', { name: /sign in/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/enter your email below to login to your account/i)).toBeInTheDocument();

    // Check for form elements in Sign In
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Switch to Sign Up tab
    await act(async () => {
        fireEvent.click(screen.getByRole('tab', { name: /sign up/i }));
    });

    // Check for the Sign Up tab's title and description
    expect(screen.getByRole('heading', { name: /sign up/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/enter your information to create an account/i)).toBeInTheDocument();

    // Check for form elements in Sign Up
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/email/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument();
  });
  
   it('shows loading state', () => {
    mockedUseUser.mockReturnValue({ user: null, isUserLoading: true });
    
    render(<AuthenticationPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
});
