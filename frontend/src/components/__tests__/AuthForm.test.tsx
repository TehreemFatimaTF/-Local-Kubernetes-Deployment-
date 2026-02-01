import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from '@/components/AuthForm'
import { apiClient } from '@/lib/api'

// Mock the API client
jest.mock('@/lib/api', () => ({
  apiClient: {
    login: jest.fn(),
    register: jest.fn(),
  },
}))

// Mock useRouter
const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

describe('AuthForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Login Form', () => {
    it('renders login form correctly', () => {
      render(<AuthForm type="login" />)

      expect(screen.getByText(/Welcome Back!/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" />)

      const emailInput = screen.getByLabelText(/Email Address/i)
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const submitButton = screen.getByRole('button', { name: /Sign In/i })

      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      const user = userEvent.setup()
      render(<AuthForm type="login" />)

      const emailInput = screen.getByLabelText(/Email Address/i)
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const submitButton = screen.getByRole('button', { name: /Sign In/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '12345')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 6 characters long/i)).toBeInTheDocument()
      })
    })

    it('handles successful login', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        data: {
          data: {
            token: 'mock-token',
            user: { id: '1', email: 'test@example.com' }
          }
        },
        error: null
      }

      ;(apiClient.login as jest.Mock).mockResolvedValue(mockResponse)

      render(<AuthForm type="login" />)

      const emailInput = screen.getByLabelText(/Email Address/i)
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const submitButton = screen.getByRole('button', { name: /Sign In/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(apiClient.login).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(localStorage.setItem).toHaveBeenCalledWith('better-auth-token', 'mock-token')
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('handles login error', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        data: null,
        error: 'Invalid credentials'
      }

      ;(apiClient.login as jest.Mock).mockResolvedValue(mockResponse)

      render(<AuthForm type="login" />)

      const emailInput = screen.getByLabelText(/Email Address/i)
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const submitButton = screen.getByRole('button', { name: /Sign In/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Signup Form', () => {
    it('renders signup form correctly', () => {
      render(<AuthForm type="signup" />)

      expect(screen.getByText(/Join Us Today!/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
    })

    it('validates password match', async () => {
      const user = userEvent.setup()
      render(<AuthForm type="signup" />)

      const emailInput = screen.getByLabelText(/Email Address/i)
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
      const submitButton = screen.getByRole('button', { name: /Create Account/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password456')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('handles successful signup', async () => {
      const user = userEvent.setup()
      const mockResponse = {
        data: {
          data: {
            token: 'mock-token',
            user: { id: '1', email: 'test@example.com' }
          }
        },
        error: null
      }

      ;(apiClient.register as jest.Mock).mockResolvedValue(mockResponse)

      render(<AuthForm type="signup" />)

      const emailInput = screen.getByLabelText(/Email Address/i)
      const passwordInput = screen.getByLabelText(/^Password$/i)
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i)
      const submitButton = screen.getByRole('button', { name: /Create Account/i })

      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(apiClient.register).toHaveBeenCalledWith('newuser@example.com', 'password123')
        expect(localStorage.setItem).toHaveBeenCalledWith('better-auth-token', 'mock-token')
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })
})
