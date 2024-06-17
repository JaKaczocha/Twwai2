import { Request, Response, NextFunction, Router, query } from 'express';
import Controller from '../interfaces/controller.interface';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import DataService from '../modules/services/data.service';
import { IData } from 'modules/models/data.model';
import Joi = require('joi');



class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    

    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/:id`,checkIdParam,  this.addData);
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`,checkIdParam,  this.getEntryById);
        this.router.get(`${this.path}/:id/latest`,checkIdParam,  this.getEntriesInRangeById);
        this.router.get(`${this.path}/:id/:num`,checkIdParam,  this.getEntriesInRangeById);
        this.router.delete(`${this.path}/all`, this.deleteAllEntries);
        this.router.delete(`${this.path}/:id`,checkIdParam,  this.deleteEntryById);
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

}

export default DataController;