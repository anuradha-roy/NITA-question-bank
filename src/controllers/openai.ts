import https from 'https';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import controller from "./controller";
import OpenAI from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// write a function that takes a prompt and return the oprnai chat response
async function getOpenAIResponse(prompt: string) {
    // console.log("getOpenAIResponse called");
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature: 1,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    console.log("getOpenAIResponse responsded");
    // console.log(response.choices[0].message.content);
    return response.choices[0].message;
}

interface Paper {
    id: string;
    url: string;
    // Add other properties as needed
}

async function getLastQuestions(courseCode: string) {
    const papers = await controller.getAllQuestionPapers(courseCode, {});
    const lastTwoPapers = papers.slice(0, 2) as Paper[];

    // Ensure the temp directory exists
    fs.mkdirSync('./temp', { recursive: true });

    // Download the last two question papers in a temp dir
    const promises = lastTwoPapers.map((paper) => new Promise((resolve, reject) => {
        const filePath = `./temp/${paper.id}.pdf`;
        const file = fs.createWriteStream(filePath);
        const request = https.get("https://" + paper.url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(async () => {
                    // Read the PDF content
                    if (fs.existsSync(filePath)) {
                        const dataBuffer = fs.readFileSync(filePath);
                        const pdfData = await pdfParse(dataBuffer);
                        // Delete the temp file
                        fs.rmSync(filePath);
                        resolve(pdfData.text);
                    }
                });
            });
        }).on('error', (err) => {
            console.error(`Got error: ${err.message}`);
        });

        request.on('error', function (err) { // Handle error
            console.log(err);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Error unlinking file: ${unlinkErr}`);
                    }
                });
            }
            reject(err);
        });

        request.end();
    }));

    const results = await Promise.all(promises);
    return results.join('');
}

async function getSuggestions(courseCode: string) {
    // console.log("getSuggestions called");
    const lastQuestions = await getLastQuestions(courseCode);
    const prompt = "Analyze the previous year's question papers for [Subject/Exam] and highlight the important topics I should cover for next year Exam. Also, provide additional related topics and questions that might be important for the upcoming exam.\n" + lastQuestions;
    console.log(prompt);
    const resp = await getOpenAIResponse(prompt);
    return resp;
}


export default {
    getSuggestions
};