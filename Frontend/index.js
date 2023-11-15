const HOST_URL = "http://localhost:3000";

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

async function updateCoursesDropdown() {
    const selectedDepartment = $("#department").val();
    const apiUrl = `${HOST_URL}/api/${selectedDepartment}/courses/`;
    const courses = await fetchData(apiUrl);
    const courseDropdown = $("#course");
    courseDropdown.empty();
    $.each(courses, (index, course) => {
        const courseTitle = course.course_title + " (" + course.code + ")";
        courseDropdown.append($("<option>").text(courseTitle).val(course.code));
    });
    courseDropdown.prop("disabled", false);
}
function createQuestionPaperCard(questionPaper, courseCode) {
    const googleViewURL= "https://docs.google.com/viewerng/viewer?url="+questionPaper.url;
    // add question paper to the questionPaperDiv
    const pdfName = questionPaper.url.split("/").pop();
    const questionPaperCard = $("<div>").addClass("card");
    // add question paper name without link
    const questionPaperName = $("<h3>").text(questionPaper.year + "-"+ questionPaper.semester +"-"+ pdfName);
    // Add download button
    const downloadButton = $("<a>").text("Download");
    downloadButton.attr("href", "https://"+questionPaper.url);
    downloadButton.attr("download", pdfName);
    downloadButton.addClass("download-button");

    // Add view button
    const viewButton = $("<a>").text("View");
    viewButton.attr("href", googleViewURL);
    viewButton.attr("target", "_blank");
    viewButton.addClass("view-button");

    // Append elements to the card
    questionPaperCard.append(questionPaperName);
    questionPaperCard.append(downloadButton);
    questionPaperCard.append(viewButton);

    return questionPaperCard;
}

async function getQuestionPapers() {
    const courseCode = $("#course").val();
    const year = $("#year").val();
    const examType = $("#examType").val();
    const semester = $("#semester").val();

    const apiUrl = `${HOST_URL}/api/questions/${courseCode}?year=${year}&semester=${semester}&exam_type=${examType}`;
    const questionPapers = await fetchData(apiUrl);
    updateQuestionPapersDiv(questionPapers, courseCode);
}

async function updateQuestionPapersDiv(questionPapers, courseCode) {
    const years = new Set();
    const examTypes = new Set();
    const semesters = new Set();
    const questionPaperDiv = $("#questionPapersDiv");
    questionPaperDiv.empty();
    courseTitle = $("#course option:selected").text();
    questionPaperDiv.append($("<h2>").text(courseTitle + $("#year").val()));
    $.each(questionPapers, (index, questionPaper) => {
        years.add(questionPaper.year);
        examTypes.add(questionPaper.exam_type);
        semesters.add(questionPaper.semester);
        // add question paper to the questionPaperDiv
        const questionPaperCard = createQuestionPaperCard(questionPaper, courseCode);
        questionPaperDiv.append(questionPaperCard);
    });
    addOptions("year", years);
    addOptions("examType", examTypes);
    addOptions("semester", semesters);
}


async function populateDepartmentsDropdown() {
    const apiUrl = `${HOST_URL}/api/departments/`;
    const departments = await fetchData(apiUrl);
    const deptDropdown = $("#department");
    deptDropdown.empty();
    deptDropdown.append($("<option>").text("Select Department").val(""));
    $.each(departments, (index, dept) => {
        deptDropdown.append($("<option>").text(dept.name).val(dept.id));
    });
    deptDropdown.change(updateCoursesDropdown);
}

async function addOptions(dropdownId, options) {
    const dropdown = $("#" + dropdownId);
    dropdown.empty();
    dropdown.append($("<option>").text("All").val(""));
    for (const option of options) {
        dropdown.append($("<option>").text(option).val(option));
    }
    dropdown.prop("disabled", false);
}

async function initialize() {
    await populateDepartmentsDropdown();
}

$(document).ready(function () {
    initialize();
});