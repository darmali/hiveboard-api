// controllers/taskController.ts
import { Request, Response } from "express";
import { TaskService } from "../services/taskService.js";
import { AppError, handleError } from "../utils/errors.js";

export class TaskController {
    private taskService: TaskService;
  
    constructor() {
      this.taskService = new TaskService();
    }
  
    getTasks = async (req: Request, res: Response) => {
      try {
        const { project_id } = req.params;
        const { company_id } = req.company;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
  
        const result = await this.taskService.getTasks(
          Number(project_id),
          company_id,
          page,
          pageSize
        );
  
        res.status(200).json(result);
      } catch (error) {
        handleError(error, res);
      }
    };
  
    assignUsersToTask = async (req: Request, res: Response) => {
      try {
        const { project_id, task_id } = req.params;
        const { company_id, company_name } = req.company;
        const { user_ids } = req.body;
  
        const taskName = await this.taskService.assignUsersToTask(
          Number(project_id),
          Number(task_id),
          user_ids,
          company_id,
          company_name
        );
  
        res.status(200).json({
          message: `Users successfully assigned to task: ${taskName}`,
        });
      } catch (error) {
        handleError(error, res);
      }
    };

    unassignUsersFromTask = async (req: Request, res: Response) => {    
        try {
          const { project_id, task_id } = req.params;
          const { company_id, company_name } = req.company;
          const { user_ids } = req.body;
    
          const taskName = await this.taskService.unassignUsersFromTask(
            Number(project_id),
            Number(task_id),
            user_ids,
            company_id,
            company_name
          );
  
          res.status(201).json({
            message: `Users successfully unassigned from task: ${taskName}`,
          }); 
          
        } catch (error) {
          handleError(error, res);
        }
    };

    createTask = async (req: Request, res: Response) => {
      try {
        const { project_id } = req.params;
        const { company_id, company_name } = req.company;
        const { userId } = req;
        const data = req.cleanBody;

        const task = await this.taskService.createTask(
          Number(project_id),
          company_id,
          data,
          userId,
          company_name
        );
        res.status(201).json({
          message: `Task created successfully: ${task.task_name}`,
        }); 
      } catch (error) {
        handleError(error, res);
      }
    };

    getTask = async (req: Request, res: Response) => {
      try {
        const { task_id, project_id } = req.params;
        const { company_id, company_name } = req.company;
        const task = await this.taskService.getTask(Number(task_id), Number(project_id), company_id, company_name);
        res.status(200).json(task);
      } catch (error) {
        handleError(error, res);
      }
    };
  
   
  }