import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';


import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import { auth } from '../middlewares/auth.middleware';
import { admin } from '../middlewares/admin.middleware';

import mailjet from 'node-mailjet';


const mailjetClient = mailjet.apiConnect('7db5a15c168e304e0209966395bd4d9c', '06164fcbdf077023a2e1e39bcfcaa4b8');





class UserController implements Controller {
    public path = '/api/user';
    public router = Router();
    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();
 
    constructor() {
        this.initializeRoutes();
    }
 
    private initializeRoutes() {
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
        this.router.delete(`${this.path}/:userId`, auth, admin, this.deleteUser); 
        this.router.patch(`${this.path}/:userId/active`, auth, admin, this.toggleActive);
        this.router.get(`${this.path}/all`, auth, admin, this.getAllUsers);
        this.router.post(`${this.path}/create-admin`, this.createAdmin); 
    }
 
    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const {login, password} = request.body;
     
        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                response.status(401).json({error: 'Unauthorized'});
            }
            await this.passwordService.authorize(user.id, await this.passwordService.hashPassword(password));
            const token = await this.tokenService.create(user);
            response.status(200).json(this.tokenService.getToken(token));
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(401).json({error: 'Unauthorized'});
        }
     };
     
 
    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        try {
            // Ensure new users are created with role 'user' and isAdmin false
            userData.role = 'user';
            userData.isAdmin = false;
            userData.active = false;
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password);
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            return response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            return response.status(400).json({ error: 'Bad request', value: error.message });
        }
    };
 
    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params;
 
        try {
            const result = await this.tokenService.remove(userId);
            return response.status(200).send(result);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            return response.status(401).json({ error: 'Unauthorized' });
        }
    };
 
    private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        const { email } = request.body;
 
        try {
            const user = await this.userService.getByEmail(email);
            if (!user) {
                return response.status(404).json({ error: 'User not found' });
            }
 
            // Generate a new password (you can use any method to generate a password)
            const newPassword = Math.random().toString(36).slice(-8);
 
            // Hash the new password
            const hashedPassword = await this.passwordService.hashPassword(newPassword);
 
            // Update the user's password in the database
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });
 
            // Send the new password via email
            const requestPayload = {
                Messages: [
                    {
                        From: {
                            Email: 'jakub44295@gmail.com', // Use the email address you verified with Mailjet
                            Name: 'Your Name'
                        },
                        To: [
                            {
                                Email: email,
                                Name: user.name
                            }
                        ],
                        Subject: 'Password Reset',
                        TextPart: `Your new password is: ${newPassword}`,
                        HTMLPart: `<p>Your new password is: <strong>${newPassword}</strong></p>`
                    }
                ]
            };
 
            await mailjetClient.post('send', { version: 'v3.1' }).request(requestPayload);
            return response.status(200).json({ message: 'New password has been sent to your email' });
        } catch (error) {
            console.error(`Error: ${error.message}`);
            return response.status(500).json({ error: 'Internal server error' });
        }
    };

    private deleteUser = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params;
        try {
            const user = await this.userService.deleteUser(userId);
            if (user) {
                return response.status(200).json({ message: 'User deleted successfully' });
            } else {
                return response.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            return response.status(500).json({ error: 'Internal server error' });
        }
    };





    private toggleActive = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params;
        const { active } = request.body;
    
        try {
            const user = await this.userService.toggleActive(userId, active);
            if (user) {
                return response.status(200).json({ message: 'User active status updated successfully', user });
            } else {
                return response.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            if (error.message === 'Cannot change active status for admin users') {
                return response.status(403).json({ error: 'Forbidden: Cannot change active status for admin users' });
            }
            return response.status(500).json({ error: 'Internal server error' });
        }
    };

    private getAllUsers = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAllUsers();
            return response.status(200).json(users);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            return response.status(500).json({ error: 'Internal server error' });
        }
    };

    private createAdmin = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        try {
            // Ustawienie roli admin
            userData.role = 'admin';
            userData.isAdmin = true;
            userData.active = true;
            const user = await this.userService.createNewOrUpdateAdmin(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password);
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            return response.status(200).json(user);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            return response.status(400).json({ error: 'Bad request', value: error.message });
        }
    };
 }
 
 export default UserController;