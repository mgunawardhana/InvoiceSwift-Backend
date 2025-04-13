import express from 'express';
import * as itemController from '../controller/itemController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// All item routes require authentication
router.use(authenticate);

// CRUD operations for items
router.post('/', itemController.createItem);
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;