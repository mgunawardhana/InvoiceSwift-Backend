import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Item } from '../models/item';

export const createItem = async (req: Request, res: Response) => {
    try {
        const { name, description, price } = req.body;
        const userId = req.user.uid;

        const itemData: Item = {
            name,
            description,
            price,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const itemRef = await db.collection('items').add(itemData);

        res.status(201).json({
            message: 'Item created successfully',
            item: {
                id: itemRef.id,
                ...itemData
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllItems = async (req: Request, res: Response) => {
    try {
        const itemsSnapshot = await db.collection('items').get();
        const items: any[] = [];

        itemsSnapshot.forEach(doc => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({ items });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getItemById = async (req: Request, res: Response) => {
    try {
        const itemId = req.params.id;
        const itemDoc = await db.collection('items').doc(itemId).get();

        if (!itemDoc.exists) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({
            item: {
                id: itemDoc.id,
                ...itemDoc.data()
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.uid;
        const { name, description, price } = req.body;

        // Check if item exists and belongs to the user
        const itemDoc = await db.collection('items').doc(itemId).get();

        if (!itemDoc.exists) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const itemData = itemDoc.data() as Item;

        // Check ownership unless admin
        if (itemData.createdBy !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to update this item' });
        }

        const updateData: Partial<Item> = {
            updatedAt: new Date()
        };

        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price !== undefined) updateData.price = price;

        await db.collection('items').doc(itemId).update(updateData);

        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.uid;

        // Check if item exists and belongs to the user
        const itemDoc = await db.collection('items').doc(itemId).get();

        if (!itemDoc.exists) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const itemData = itemDoc.data() as Item;

        // Check ownership unless admin
        if (itemData.createdBy !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to delete this item' });
        }

        await db.collection('items').doc(itemId).delete();

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
