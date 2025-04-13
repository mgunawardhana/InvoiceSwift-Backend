import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { generateToken } from '../utils/jwt';
import { User } from '../models/user';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, displayName, role = 'user', phoneNumber } = req.body;

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
            phoneNumber
        });

        // Create user document in Firestore
        const userData: User = {
            uid: userRecord.uid,
            email: userRecord.email || email,
            displayName: userRecord.displayName || displayName,
            role,
            createdAt: new Date(),
            phoneNumber: userRecord.phoneNumber || phoneNumber
        };

        await db.collection('users').doc(userRecord.uid).set(userData);

        // Generate JWT token
        const token = generateToken(userRecord.uid, role);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                role
            },
            token
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        // Verify the Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Get user from Firestore
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            // Create user in Firestore if they don't exist (for social logins)
            const userRecord = await auth.getUser(uid);
            const userData: User = {
                uid: userRecord.uid,
                email: userRecord.email || '',
                displayName: userRecord.displayName,
                role: 'user',
                createdAt: new Date(),
                phoneNumber: userRecord.phoneNumber
            };

            await db.collection('users').doc(uid).set(userData);

            // Generate JWT token
            const token = generateToken(uid, 'user');

            return res.status(200).json({
                message: 'User logged in successfully',
                user: userData,
                token
            });
        }

        const userData = userDoc.data() as User;

        // Generate JWT token
        const token = generateToken(uid, userData.role);

        res.status(200).json({
            message: 'User logged in successfully',
            user: userData,
            token
        });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const uid = req.user.uid;
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userDoc.data();

        res.status(200).json({ user: userData });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const uid = req.user.uid;
        const { displayName, phoneNumber } = req.body;

        // Update user in Firebase Auth
        const updateData: any = {};
        if (displayName) updateData.displayName = displayName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        await auth.updateUser(uid, updateData);

        // Update user in Firestore
        await db.collection('users').doc(uid).update({
            ...updateData,
            updatedAt: new Date()
        });

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};