// Regras de cadastro e login.
// Dependências externas (banco, bcrypt, jwt) entram pelo construtor para poderem ser mockadas.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError } from '../errors/AppError.js';
import { USER_ROLES } from '../constants/statuses.js';

export class AuthService {
  constructor({
    userModel,
    hashProvider = bcrypt,
    tokenProvider = jwt,
    jwtSecret = process.env.JWT_SECRET || 'chave_secreta', // mesmo fallback do authMiddleware
    tokenExpiresIn = '8h',
  }) {
    this.userModel = userModel;
    this.hashProvider = hashProvider;
    this.tokenProvider = tokenProvider;
    this.jwtSecret = jwtSecret;
    this.tokenExpiresIn = tokenExpiresIn;
  }

  async register({ name, email, password, role = USER_ROLES.STUDENT }) {
    const existingUser = await this.userModel.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado.');
    }

    const hashedPassword = await this.hashProvider.hash(password, 10);

    return await this.userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });
  }

  async login({ email, password }) {
    const user = await this.userModel.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isPasswordValid = await this.hashProvider.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = this.tokenProvider.sign(
      { id: user.id_users_pk, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: this.tokenExpiresIn }
    );

    return { token };
  }
}
