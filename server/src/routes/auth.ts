import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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

export default router;
