import { Router } from 'express';
import { login, createSuperAdmin } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.post('/setup-superadmin', createSuperAdmin);

export default router;
