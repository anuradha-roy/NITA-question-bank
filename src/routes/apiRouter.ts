import express, { type Request, type Response } from "express";
import controllers from "../controllers/controller";
import openaiController from "../controllers/openai";

const apiRoute = express.Router();

apiRoute.route("/")
    .get((_req: Request, res: Response) => {
        res.send("API Home");
    })
    .post((_req: Request, res: Response) => {
        res.send("API Home, Dosen't Expect any Data.");
    });

apiRoute.route("/departments")
    .get((_req: Request, res: Response) => {
        try {
            controllers.getAvailableDepartements().then((result: any) => {
                if (result === null) {
                    res.status(404).send("No departments found.");
                    return;
                }
                res.status(200).json(result);
            });
        } catch (error) {
            res.status(500).send("Error fetching available departments.");
        }
    });

apiRoute.route("/:departmentId/courses")
    .get((req: Request, res: Response) => {
        const departmentId = req.params.departmentId;
        try {
            controllers.getAvailableCoursesOfDepartment(departmentId).then((result: any) => {
                if (result === null) {
                    res.status(404).send("No course found within "+ departmentId + " department.");
                    return;
                }
                res.status(200).json(result);
            });
        } catch (error) {
            res.status(500).send("Error fetching available course in a department.");
        }

    });

apiRoute.route("/course/:course_code/")
    .get((req: Request, res: Response) => {
        const courseCode = req.params.course_code;
        try {
            controllers.getCourseDetailsByCourseCode(courseCode).then((result: any) => {
                if (result === null) {
                    res.status(404).send("No Course found with the specified Course Code.");
                    return;
                }
                res.status(200).json(result);
            });
        } catch (error) {
            res.status(500).send("Error fetching course details.");
        }
    });

/**
 * This route is used to get all questionPapers of the specified course code.
 * aditionally it can also filter the results by year, semester and examType.
 * Example URL : http://<Host>/api/questions/CS5102?year=2019&semester=even&examType=endsem
 */
apiRoute.route("/questions/:course_code")
    .get((req: Request, res: Response) => {
        const courseCode = req.params.course_code;
        try {
            controllers.getAllQuestionPapers(courseCode, req.query).then((result: any) => {
                if (result === null) {
                    res.status(404).send("No question papers found with the specified Course Code.");
                    return;
                }
                res.status(200).json(result);
            });
        } catch (error) {
            res.status(500).send("Error fetching question papers.");
        }
    });

apiRoute.route("/suggestions/:course_code")
    .get((req: Request, res: Response) => {
        const courseCode = req.params.course_code;
        try {
            openaiController.getSuggestions(courseCode).then((result: any) => {
                if (result === null || result === undefined) {
                    res.status(404).send("No suggestions found with the specified Course Code.");
                    return;
                }
                console.log(result.content);
                res.status(200).send(result);
            });
        } catch (error) {
            res.status(500).send("Error fetching suggestions.");
        }
    });

export { apiRoute };
