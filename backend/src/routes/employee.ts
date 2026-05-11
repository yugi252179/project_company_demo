import { Router } from 'express';
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from '../controllers/employee';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// Only Super Admin and Admin can create/view all employees
router.post('/', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN']), createEmployee);
router.get('/', authenticateToken, getEmployees);
router.put('/:id', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN']), updateEmployee);
router.delete('/:id', authenticateToken, authorizeRole(['SUPER_ADMIN', 'ADMIN']), deleteEmployee);

export default router;
