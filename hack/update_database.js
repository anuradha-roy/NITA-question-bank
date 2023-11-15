const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const dataFolderPath = "./data/";

const githubUserName = "anuradha-roy";
const githubRepoName = "NITA-question-bank";


const DepartmentTableDATA = [];
const CourseTableDATA = [];
const QuestionPapersTableDATA = [];


// Creating Table details from the /data folder

class TreeNode {
    constructor(name, fullPath, level, parent) {
        this.name = name;
        this.fullPath = fullPath;
        this.children = [];
        this.level = level;
        this.parent = parent;
    }
}

function buildTreeStructure(folderPath, level) {
    const rootNode = new TreeNode("data", folderPath, level, null);
    traverseFolders(folderPath, rootNode);
    return rootNode;
}

function traverseFolders(folderPath, parentNode) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const stats = fs.statSync(fullPath);

        const newNode = new TreeNode(file, fullPath, parentNode.level + 1, parentNode);
        parentNode.children.push(newNode);
        if (stats.isDirectory()) {
            traverseFolders(fullPath, newNode);
        } 
    }
}

function BFSTraversAndFillDetails(rootNode) {
    const queue = [rootNode];
    while (queue.length > 0) {
        const node = queue.shift();
        for (const child of node.children) {
            queue.push(child);
        }
        const stats = fs.statSync(node.fullPath);
        if(node.level === 1){
            // level 1 here all the departments are present
            addDepartments(node.name);
        }
        if(node.level === 3){
            // level 2 here all the courses are present
            // level 3 inside each course
            if (stats.isFile() && node.name ==="course_data.json") {
                addCources(node.parent, node.fullPath);
            }
        }
        if(stats.isFile() && node.name.endsWith(".pdf")) {
            addQuestionPaperDetailsFromPath(node.fullPath);
        }
    }
}

function addDepartments(departmentId) {
    DepartmentTableDATA.push({
        id: departmentId,
        name: capitalizeWords(departmentId),
    });
}

function addCources(course, courseDataPath) {
    // const courseData = JSON.parse(fs.readFileSync(courseDataPath));
    const courseTitle = JSON.parse(fs.readFileSync(courseDataPath)).course_title;
    CourseTableDATA.push({
        code: course.name,
        course_title: courseTitle,
        department_id: course.parent.name,
    });
}


function addQuestionPaperDetailsFromPath(paperPath) {
    const parsedPath = path.parse(paperPath);
    const dirList = parsedPath.dir.split(path.sep);
    // remove the first data folder
    dirList.shift();
    let [department_id, course_code, year, semester] = dirList;
    let [exam_type, title] = parsedPath.name.split("-");
    semester = capitalizeWords(semester);
    exam_type = capitalizeWords(exam_type);


    const url = createUrlFromPath(paperPath);

    QuestionPapersTableDATA.push({
        url,
        year,
        semester,
        exam_type,
        course_code
    });
}
// util functions
function createUrlFromPath(paperPath) {
    const url = paperPath.replace(/\\/g, "/");
    return "raw.githubusercontent.com/"+githubUserName+"/"+ githubRepoName +"/main/" + url;
}

function capitalizeWords(str) {
    return str
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

const root = buildTreeStructure(dataFolderPath, 0);
BFSTraversAndFillDetails(root);
console.log(DepartmentTableDATA);
console.log(CourseTableDATA);
console.log(QuestionPapersTableDATA);

//-------------------------------------------------
//  DB functions and update the database according to the data
//-------------------------------------------------

const UserName = process.env.DB_USER_NAME || "dev";
const Password = process.env.DB_PASSWORD || "password" ;
const Database = process.env.DATABASE_NAME || "devDB";
const Host = process.env.DB_HOST || "localhost";

const pool = mysql.createPool({
    host: Host,
    user: UserName,
    password: Password,
    database: Database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function executeQuery (sql, values) {
    let connection;
    try {
        let connection = await pool.getConnection();
        const [rows] = await connection.query(sql, values);
        connection.release();
        return rows;
    } finally {
        if (connection != null) {
            console.log("Connection released finally");
            connection.release();
        }
    }
}

async function UpdateDepartmentTable(){
    console.log("Updating department Table Started");
    await executeQuery("SELECT * FROM department").then(async (departmentTableDB) => {

        for( const department of DepartmentTableDATA){
         // check if new department is added
            const departmentDB = departmentTableDB.find((dpmt) => dpmt.id === department.id);
            if(departmentDB === undefined){
                const query = "INSERT INTO department (id, name) VALUES (?, ?)";
                const values = [department.id, department.name];
                // console.log(query, values);
                await executeQuery(query, values);
            }

            // check if any departments details are changed
            else if(departmentDB.name !== department.name){
                const query = "UPDATE department SET name = ? WHERE id = ?";
                const values = [department.name, department.id];
                await executeQuery(query, values);
            }
        }
        // check if any department is deleted
        for(const departmentDB of departmentTableDB){
            const department = DepartmentTableDATA.find((department) => department.id === departmentDB.id);
            if(department === undefined){
                const query = "DELETE FROM department WHERE id = ?";
                const values = [departmentDB.id];
                await executeQuery(query, values);
            }
        }
    });
}



async function UpdateCourseTable(){
    console.log("Updating Course Table Started");
    await executeQuery("SELECT * FROM course").then(async (courseTableDB) => {

        for( const course of CourseTableDATA){
        // check if it is already present in courseFromDB
            const courseDB = courseTableDB.find((crs) => crs.code === course.code);
            if(courseDB === undefined){
                const query = "INSERT INTO course (code, course_title, department_id) VALUES (?, ?, ?)";
                const values = [course.code, course.course_title, course.department_id];
                await executeQuery(query, values);
            }

            // check if any course details are changed
            else if(courseDB.course_name !== course.course_name || courseDB.department_id !== course.department_id){
                const query = "UPDATE course SET course_title = ? WHERE code = ?";
                const values = [course.course_title, course.code];
                await executeQuery(query, values);
            }
        }
        // check if any course is deleted
        // TODO: Delete might not work as it is referenced in department_course table fk constraint
        for(const courseDB of courseTableDB){
            const course = CourseTableDATA.find((course) => course.code === courseDB.code);
            if(course === undefined){
                const query = "DELETE FROM course WHERE code = ?";
                const values = [courseDB.code];
                await executeQuery(query, values);
            }
        }
    });
}





async function UpdateQuestionPaperTable(){
    console.log("Updating Question Paper Table Started");
    executeQuery("SELECT * FROM question_paper").then((questionPapers) => {
        const QuestionPaperTableDB = questionPapers;

        for( const questionPaper of QuestionPapersTableDATA){
        // check if it is already present in questionPaperFromDB
            const questionPaperDB = QuestionPaperTableDB.find((qp) => qp.url === questionPaper.url);
            if(questionPaperDB === undefined){
                const query = "INSERT INTO question_paper (url, year, semester, exam_type, course_code) VALUES (?, ?, ?, ?, ?)";
                const values = [questionPaper.url, questionPaper.year, questionPaper.semester, questionPaper.exam_type, questionPaper.course_code];
                executeQuery(query, values);
            }
        }
        // check if any question paper is deleted
        for(const questionPaperDB of QuestionPaperTableDB){
            const questionPaper = QuestionPapersTableDATA.find((questionPaper) => questionPaper.url === questionPaperDB.url);
            if(questionPaper === undefined){
                const query = "DELETE FROM question_paper WHERE url = ?";
                const values = [questionPaperDB.url];
                executeQuery(query, values);
            }
        }
    });
}

async function UpdateDatabase(){
    await UpdateDepartmentTable();
    await UpdateCourseTable();
    await UpdateQuestionPaperTable();
}

UpdateDatabase().then(() => {
    console.log("Done");
});

setTimeout(() => {
    process.exit(0);
}, 10000);