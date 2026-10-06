// Autorização por papel (role). Use DEPOIS do authMiddleware, que preenche req.user a partir do JWT.
// Exemplo: router.post('/', authMiddleware, requireRole('INSTRUCTOR'), controller)
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Acesso negado: você não tem permissão para esta ação." });
  }
  next();
};
