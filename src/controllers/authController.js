import { authService } from '../container.js';
import { handleError } from '../utils/handleError.js';

// 1. Registrar usuário (POST /auth/register)
export const register = async (req, res) => {
  try {
    const newUser = await authService.register(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return handleError(res, error);
  }
};

// 2. Login (POST /auth/login)
export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};
