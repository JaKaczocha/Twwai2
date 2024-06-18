import  UserModel  from '../schemas/user.schema';
import {IUser} from "../models/user.model";

class UserService {
    public async createNewOrUpdate(user: IUser) {
        try {
            if (!user._id) {
                 user.role = 'user';
                user.isAdmin = false;
                user.active = false;
                const dataModel = new UserModel(user);
                return await dataModel.save();
            } else {
                const existingUser = await UserModel.findById(user._id);
                if (!existingUser) {
                    throw new Error('User not found');
                }
                user.role = existingUser.role; 
                user.isAdmin = existingUser.isAdmin;
                user.active = existingUser.active;
                return await UserModel.findByIdAndUpdate(user._id, { $set: user }, { new: true });
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }
 
    public async getByEmailOrName(name: string) {
        try {
            const result = await UserModel.findOne({ $or: [{ email: name }, { name: name }] });
            if (result) {
                return result;
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas pobierania danych:', error);
            throw new Error('Wystąpił błąd podczas pobierania danych');
        }
    }
 
    public async getByEmail(email: string) {
        try {
            const result = await UserModel.findOne({ email: email });
            if (result) {
                return result;
            }
        } catch (error) {
            console.error(' przez mail Wystąpił błąd podczas pobierania danych:', error);
            throw new Error(' przez mail Wystąpił błąd podczas pobierania danych');
        }
    }

    public async deleteUser(userId: string) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.role === 'user' && user.isAdmin === false) {
                await UserModel.findByIdAndDelete(userId);
                return user;
            } else {
                throw new Error('Cannot delete admin user');
            }
        } catch (error) {
            console.error('Error during user deletion:', error);
            throw new Error('Error during user deletion');
        }
    }

    public async toggleActive(userId: string, active: boolean) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
    
           
            if (user.isAdmin) {
                throw new Error('Cannot change active status for admin users');
            }
    
            
            user.active = active;
            await user.save();
            return user;
        } catch (error) {
            console.error('Error during updating user active status:', error);
            throw new Error('Error during updating user active status');
        }
    }

    public async getAllUsers() {
        try {
            const users = await UserModel.find({ role: 'user' }, 'name email active');
            return users;
        } catch (error) {
            console.error('Error during fetching all users:', error);
            throw new Error('Error during fetching all users');
        }
    }

    public async createNewOrUpdateAdmin(user: IUser) {
        try {
            if (!user._id) {
               
                const dataModel = new UserModel(user);
                return await dataModel.save();
            } else {
                const existingUser = await UserModel.findById(user._id);
                if (!existingUser) {
                    throw new Error('User not found');
                }
                user.role = existingUser.role; 
                user.isAdmin = existingUser.isAdmin; 
                user.active = existingUser.active;
                return await UserModel.findByIdAndUpdate(user._id, { $set: user }, { new: true });
            }
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }
 }
 
 export default UserService;
