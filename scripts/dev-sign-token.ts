import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'dev_local_secret_change_me';

const claims = {
  sub: 'demo-user',
  email: 'demo@nourishiq.org',
  role: 'admin',
  orgId: 'demo-org'
};

const token = jwt.sign(claims, secret, { algorithm: 'HS256', expiresIn: '1h', audience: 'nourishiq', issuer: 'nourishiq-local' });
console.log(token);
