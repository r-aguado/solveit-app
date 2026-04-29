// Middleware que inyecta el company_id del usuario en las requests
// Simplifica el acceso a req.companyId en los controladores

const tenantMiddleware = (req, res, next) => {
  if (req.user) {
    req.companyId = req.user.company_id;
  }
  next();
};

module.exports = tenantMiddleware;
