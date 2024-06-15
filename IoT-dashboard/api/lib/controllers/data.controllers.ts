import { Request, Response, NextFunction, Router } from 'express';
import Controller from '../interfaces/controller.interface';

let testArr = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/:id`, this.addData);
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, this.getEntryById);
        this.router.get(`${this.path}/:id/latest`, this.getLatestEntryById);
        this.router.get(`${this.path}/:id/:num`, this.getEntriesInRangeById);
        this.router.delete(`${this.path}/all`, this.deleteAllEntries);
        this.router.delete(`${this.path}/:id`, this.deleteEntryById);
    }

    private getEntryById = (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id);
        const entry = testArr[id];
        if (entry !== undefined) {
            res.json({ id: id, value: entry });
        } else {
            res.status(404).json({ message: `Entry with id ${id} not found.` });
        }
    }

    private getLatestEntryById = (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id);
        const filteredArr = testArr.filter((_, index) => index % 2 === id % 2); // Select elements based on id parity
        if (filteredArr.length === 0) {
            res.status(404).json({ message: `No entries found for id ${id}.` });
        } else {
            const latest = Math.max(...filteredArr);
            res.json({ id: id, latestValue: latest });
        }
    }

    private getEntriesInRangeById = (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id);
        const num = parseInt(req.params.num);
        const startIndex = id * num;
        const entries = testArr.slice(startIndex, startIndex + num);
        res.json({ id: id, entries: entries });
    }

    private getLatestReadingsFromAllDevices = (req: Request, res: Response, next: NextFunction) => {
        const latest = Math.max(...testArr);
        res.json({ latestReading: latest });
    }

    private addData = (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id);
        const newData = req.body.data;

        if (typeof newData === 'number') {
            testArr.push(newData);
            res.status(201).json({ message: `Data added to device ${id}`, newData: newData });
        } else {
            res.status(400).json({ message: 'Invalid data format. Expected a number.' });
        }
    }

    private deleteAllEntries = (req: Request, res: Response, next: NextFunction) => {
        testArr = [];
        res.json({ message: 'All entries deleted successfully.' });
    }

    private deleteEntryById = (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id);
        if (id >= 0 && id < testArr.length) {
            const deletedEntry = testArr.splice(id, 1);
            res.json({ message: `Entry with id ${id} deleted successfully.`, deletedEntry: deletedEntry });
        } else {
            res.status(404).json({ message: `Entry with id ${id} not found.` });
        }
    }

}

export default DataController;