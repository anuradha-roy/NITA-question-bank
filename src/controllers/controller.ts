import { executeQuery } from "../database/connectDB";


/**
 * This function is used to get all departments avalible.
 * @returns All Departments.
 * @throws An error if the database query fails.
 * @example
 */
async function getAvailableDepartements (): Promise<any> {
    const query = "SELECT * FROM department";
    const result = await executeQuery(query);
    if (result.length === 0) {
            return null; // No department found
    }
    return result;
}

async function getAvailableCoursesOfDepartment(departmentId: string): Promise<any> {
    const query = `SELECT * FROM course WHERE department_id = ?`;
    const values = [departmentId];
    const result = await executeQuery(query, values);
    if (result.length === 0) {
            return null; // No institute found with the specified ID
    }
    return result;
}

async function getCourseDetailsByCourseCode(courseCode: string): Promise<any> {
    const query = `SELECT * FROM course WHERE code = ?`;
    const values = [courseCode];
    const result = await executeQuery(query, values);
    if (result.length === 0) {
            return null; // No institute found with the specified ID
    }
    return result;
}


async function getAllQuestionPapers (courseCode: string, filters: any): Promise<any> {
    let sql = `
    SELECT *
    FROM question_paper qp
    WHERE qp.course_code = ?
    `;
    const values = [courseCode];

    if(filters.year){
        sql += "AND qp.year = ?";
        values.push(filters.year);
    }
    if(filters.semester){
        sql += "AND qp.semester = ?";
        values.push(filters.semester);
    }
    if(filters.examType){
        sql += "AND qp.exam_type = ?";
        values.push(filters.exam_type);
    }

    const result = await executeQuery(sql + ";", values);
    if (result.length === 0) {
            return null; // No question papers found with the specified Parameters
    }
    const courseInfo = await getCourseDetailsByCourseCode(courseCode);

    result.course_title = courseInfo.course_title;

    return result;
}


export default { 
    getAvailableDepartements,
    getAvailableCoursesOfDepartment ,
    getCourseDetailsByCourseCode,
    getAllQuestionPapers
};
