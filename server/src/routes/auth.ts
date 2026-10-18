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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Identifier and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Reject unknown accounts — do NOT silently create an account on login
    if (!user) {
      return res.status(401).json({ error: 'No account found with that email. Please register first.' });
    }

    // Verify password — allow demo bypass only for flagged demo accounts
    const valid = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!valid && !user.isDemo) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
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

// Google Sign In / Registration endpoint with secure ID token / Access token verification
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, credential, accessToken } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify && !accessToken) {
      return res.status(400).json({ error: 'Google authentication token is required.' });
    }

    const currentGoogleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!currentGoogleClientId) {
      return res.status(503).json({
        error: 'Google Sign-In is not configured on the server. Please set GOOGLE_CLIENT_ID in server environment.',
      });
    }

    const googleClient = new OAuth2Client(currentGoogleClientId);
    let googleSub: string | undefined;
    let email: string | undefined;
    let emailVerified: boolean = false;
    let googleDisplayName: string = '';

    if (accessToken) {
      // 1. Verify access token with Google's tokeninfo
      try {
        const tokenInfo = await googleClient.getTokenInfo(accessToken);
        if (!tokenInfo || !tokenInfo.email) {
          return res.status(401).json({ error: 'Invalid Google access token.' });
        }
      } catch (err: any) {
        console.warn('Google access token verification failed:', err?.message || 'Invalid token');
        return res.status(401).json({ error: 'Invalid or expired Google access token. Please sign in again.' });
      }

      // 2. Fetch verified user profile from Google's userinfo API
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!userInfoRes.ok) {
          return res.status(401).json({ error: 'Failed to retrieve profile from Google.' });
        }
        const userInfo = await userInfoRes.json();
        googleSub = userInfo.sub;
        email = userInfo.email;
        emailVerified = Boolean(userInfo.email_verified);
        googleDisplayName = (userInfo.name && userInfo.name.trim()) ||
          (userInfo.given_name ? `${userInfo.given_name} ${userInfo.family_name || ''}`.trim() : '') ||
          (email ? email.split('@')[0] : 'Google User');
      } catch (fetchErr: any) {
        console.error('Error fetching Google userinfo:', fetchErr);
        return res.status(500).json({ error: 'Failed to fetch Google profile.' });
      }
    } else {
      // Verify ID Token with Google's official library
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

      googleSub = payload.sub;
      email = payload.email;
      emailVerified = Boolean(payload.email_verified);
      const normalized = email ? email.trim().toLowerCase() : '';
      googleDisplayName = (payload.name && payload.name.trim()) ||
        (payload.given_name ? `${payload.given_name} ${payload.family_name || ''}`.trim() : '') ||
        normalized.split('@')[0];
    }

    if (!googleSub || !email) {
      return res.status(400).json({ error: 'Google account missing verified user identifier or email.' });
    }

    if (!emailVerified) {
      return res.status(403).json({
        error: 'Google email address is not verified. Please verify your Google account email first.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

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
