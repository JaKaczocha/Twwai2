import { Request, Response, NextFunction, Router, query } from 'express';
import Controller from '../interfaces/controller.interface';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import DataService from '../modules/services/data.service';
import { IData } from 'modules/models/data.model';
import Joi = require('joi');

import { auth } from '../middlewares/auth.middleware';
import { admin } from '../middlewares/admin.middleware';

class DataController implements Controller {
    public path = '/api/data';
    public path3 = '/api/data3';
    public router = Router();
    

    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/:id`,checkIdParam,  this.addData);
        this.router.get(`${this.path}/latest/:userId`,auth, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id/:userId`,auth,checkIdParam,  this.getEntryById);
        this.router.get(`${this.path}/:id/latest/:userId`,auth,checkIdParam,  this.getEntriesInRangeById);
        this.router.get(`${this.path}/:id/:num/:userId`,auth,checkIdParam,  this.getEntriesInRangeById);
        this.router.delete(`${this.path}/all/:userId`,auth, admin, this.deleteAllEntries);
        this.router.delete(`${this.path}/:id/:userId`,auth,admin,checkIdParam,  this.deleteEntryById);
        this.router.get(`${this.path3}/:id/latestDate`,checkIdParam, this.getLatestDataForDevice);
    }

    private getEntryById = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const allData = await this.dataService.query(id);
        response.status(200).json(allData);
     };
     

    private getEntriesInRangeById= async (request: Request, response: Response, next: NextFunction) => {
        const { id, num } = request.params;
        const limit = num ? +num : 1;

        if (isNaN(parseInt(id, 10))) {
            return response.status(400).send('Missing or invalid device ID parameter!');
        }

        const allData = await this.dataService.get(id, limit);
        response.status(200).json(allData);
    };

    private getLatestReadingsFromAllDevices= async (request: Request, response: Response, next: NextFunction) => {
        const allData = await this.dataService.getAllNewest();
        response.status(200).json(allData);
    };

    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;
     
        const schema = Joi.object({
            air: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().integer().positive().required(),
                        value: Joi.number().positive().required()
                    })
                )
                .unique((a, b) => a.id === b.id),
            deviceId: Joi.number().integer().positive().valid(parseInt(id, 10)).required()
         });

        const data: IData = {
            temperature: parseFloat(air[0].value),
            pressure: parseFloat(air[1].value),
            humidity: parseFloat(air[2].value), 
            deviceId: parseInt(id), 
            readingDate: new Date() 
        };
       
        try {
           
            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
        }
     };
     

    private deleteAllEntries = async (request: Request, response: Response, next: NextFunction) => {
        await this.dataService.deleteData({});
        response.sendStatus(200);
    };

    private deleteEntryById  = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        await this.dataService.deleteData({ deviceId: id });
        response.sendStatus(200);
    };

    private getLatestDataForDevice = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
    
        try {
           const latestData = await this.dataService.getLatestReadingDateForDevice(parseInt(id));
    
            if (latestData) {
                
                response.status(200).json(latestData);
            } else {
                 response.status(404).json({ error: 'No data found for the specified device.' });
            }
        } catch (error) {
            console.error(`Failed to get latest data for device ${id}: ${error}`);
            response.status(500).json({ error: 'Failed to fetch latest data.' });
        }
    };
    

}

export default DataController;