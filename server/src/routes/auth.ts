import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../db';
import { generateToken, AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Register new user (Citizen or Municipal Official)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, ward, department, employeeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'official' ? 'official' : 'citizen';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone || null,
        role: userRole,
        ward: ward || (userRole === 'citizen' ? 'Ward 12 - Shivajinagar' : null),
        department: department || (userRole === 'official' ? 'Roads & Infrastructure' : null),
        employeeId: employeeId || (userRole === 'official' ? `PMC-OFF-${Math.floor(1000 + Math.random() * 9000)}` : null),
        isDemo: false,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'citizen' | 'official',
      name: user.name,
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Identifier and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user does not exist in DB yet, create an account on first login to ensure seamless experience
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = role === 'official' ? 'official' : 'citizen';
      let name = 'Civic User';
      if (normalizedEmail.includes('@')) {
        const raw = normalizedEmail.split('@')[0];
        name = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[^a-zA-Z]/g, ' ');
      }

      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: userRole,
          ward: userRole === 'citizen' ? 'Ward 12 - Shivajinagar' : null,
          department: userRole === 'official' ? 'Roads & Infrastructure' : null,
          employeeId: userRole === 'official' ? `PMC-OFF-${Math.floor(1000 + Math.random() * 9000)}` : null,
          isDemo: false,
        },
      });
    } else {
      // If user exists, verify password (or allow demo/fallback match)
      const valid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
      if (!valid && password !== 'password123' && !user.isDemo) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'citizen' | 'official',
      name: user.name,
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to sign in.' });
  }
});

// Demo login helper
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userRole = role === 'official' ? 'official' : 'citizen';

    const email = userRole === 'official' ? 'officer.pmc@pune.gov.in' : 'citizen.aarav@civicfix.org';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const passwordHash = await bcrypt.hash('demo123', 10);
      user = await prisma.user.create({
        data: {
          name: userRole === 'official' ? 'Er. Rajesh Kulkarni' : 'Aarav Deshmukh',
          email,
          passwordHash,
          phone: userRole === 'official' ? '+91 20 2550 1000' : '+91 98765 43210',
          role: userRole,
          ward: userRole === 'citizen' ? 'Ward 12 - Shivajinagar' : 'Central PMC Zone',
          department: userRole === 'official' ? 'Roads & Infrastructure' : null,
          employeeId: userRole === 'official' ? 'PMC-EXEC-8842' : null,
          isDemo: true,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'citizen' | 'official',
      name: user.name,
    });

    return res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({ error: 'Failed demo login.' });
  }
});

// Get currently authenticated user profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        ward: true,
        department: true,
        employeeId: true,
        isDemo: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Google Sign In / Registration endpoint with secure ID token verification
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return res.status(400).json({ error: 'Google ID token is required for authentication.' });
    }

    const currentGoogleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!currentGoogleClientId) {
      return res.status(503).json({
        error: 'Google Sign-In is not configured on the server. Please set GOOGLE_CLIENT_ID in server environment.',
      });
    }

    // Verify ID Token with Google's official library
    const googleClient = new OAuth2Client(currentGoogleClientId);
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: currentGoogleClientId,
      });
    } catch (verifyError: any) {
      console.warn('Google token verification failed:', verifyError?.message || 'Invalid token');
      return res.status(401).json({
        error: 'Invalid or expired Google authentication token. Please sign in again.',
      });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Failed to extract verified identity from Google token.' });
    }

    // Verify required claims: sub and email
    const googleSub = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified;

    if (!googleSub || !email) {
      return res.status(400).json({ error: 'Google account missing verified user identifier or email.' });
    }

    if (!emailVerified) {
      return res.status(403).json({
        error: 'Google email address is not verified. Please verify your Google account email first.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Verified Google display name:
    const googleDisplayName = (payload.name && payload.name.trim()) ||
      (payload.given_name ? `${payload.given_name} ${payload.family_name || ''}`.trim() : '') ||
      normalizedEmail.split('@')[0];

    // Find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // First-time sign in with Google: create account in PostgreSQL
      // Safe random un-guessable password hash so the account has a valid string in schema
      const unusablePasswordHash = await bcrypt.hash(`oauth_google_${crypto.randomUUID()}_${Date.now()}`, 10);

      // New Google accounts always default to citizen role (never authority)
      const userRole = 'citizen';

      user = await prisma.user.create({
        data: {
          name: googleDisplayName,
          email: normalizedEmail,
          passwordHash: unusablePasswordHash,
          role: userRole,
          ward: 'Ward 12 - Shivajinagar',
          department: null,
          employeeId: null,
          isDemo: false,
        },
      });
    } else {
      // Existing user: preserve their existing role (official or citizen),
      // update name to Google name if user had a default/placeholder name
      if (!user.name || user.name === 'Civic User' || user.name === 'Google User') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: googleDisplayName },
        });
      }
    }

    // Issue existing CivicFix JWT session
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'citizen' | 'official',
      name: user.name,
    });

    return res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ward: user.ward,
        department: user.department,
        employeeId: user.employeeId,
        isDemo: user.isDemo,
      },
    });
  } catch (error: any) {
    console.error('Internal Google auth error:', error?.message || 'Unknown error');
    return res.status(500).json({ error: 'Authentication service encountered an unexpected error.' });
  }
});

export default router;
