import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthService from '../infrastructure/services/auth.service';

vi.mock('../infrastructure/api/client', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
  },
}));

import client from '../infrastructure/api/client';

const mockClient = client as unknown as {
  post: ReturnType<typeof vi.fn>;
  get:  ReturnType<typeof vi.fn>;
};

describe('AuthService (capa HTTP)', () => {

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ── login ────────────────────────────────────────────────────────

  it('login → POST /api/auth/login y guarda el token en localStorage', async () => {
    mockClient.post.mockResolvedValueOnce({
      data: { data: { token: 'jwt.token.here', user: { id: 1, email: 'u@u.com', name: 'U', rol: 'usuario' } } },
    });

    await AuthService.login('u@u.com', 'secret');

    expect(mockClient.post).toHaveBeenCalledWith('/api/auth/login', { email: 'u@u.com', password: 'secret' });
    expect(localStorage.getItem('token')).toBe('jwt.token.here');
  });

  it('login → propaga el error si el servidor responde con 401', async () => {
    mockClient.post.mockRejectedValueOnce({ response: { status: 401, data: { message: 'Credenciales inválidas' } } });

    await expect(AuthService.login('x@x.com', 'wrong')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  // ── register ─────────────────────────────────────────────────────

  it('register → POST /api/auth/register con email, password y name', async () => {
    mockClient.post.mockResolvedValueOnce({ data: { data: { token: 'new.jwt.token' } } });

    await AuthService.register('nuevo@x.com', '123456', 'Nuevo');

    expect(mockClient.post).toHaveBeenCalledWith('/api/auth/register', {
      email: 'nuevo@x.com', password: '123456', name: 'Nuevo',
    });
    expect(localStorage.getItem('token')).toBe('new.jwt.token');
  });

  // ── logout ───────────────────────────────────────────────────────

  it('logout → POST /api/auth/logout y borra el token aunque la API falle', async () => {
    localStorage.setItem('token', 'algo');
    mockClient.post.mockRejectedValueOnce(new Error('network'));

    await AuthService.logout();

    expect(mockClient.post).toHaveBeenCalledWith('/api/auth/logout');
    expect(localStorage.getItem('token')).toBeNull();
  });

  // ── forgot/reset password ────────────────────────────────────────

  it('forgotPassword → POST /api/auth/forgot-password con el email', async () => {
    mockClient.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    await AuthService.forgotPassword('u@u.com');

    expect(mockClient.post).toHaveBeenCalledWith('/api/auth/forgot-password', { email: 'u@u.com' });
  });

  it('resetPassword → POST /api/auth/reset-password con token y new_password', async () => {
    mockClient.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    await AuthService.resetPassword('reset_token_xyz', 'nuevaPass');

    expect(mockClient.post).toHaveBeenCalledWith('/api/auth/reset-password', {
      token: 'reset_token_xyz', new_password: 'nuevaPass',
    });
  });
});
