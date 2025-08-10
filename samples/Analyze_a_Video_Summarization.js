import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import https from "https";
import ffmpeg from "fluent-ffmpeg";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const videoPath = "wingit.webm";
const framePath = "frame.jpg";
const videoUrl = "https://upload.wikimedia.org/wikipedia/commons/3/38/WING_IT%21_-_Blender_Open_Movie-full_movie.webm";

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(`Downloaded ${dest}`);
                resolve();
            });
        }).on("error", (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function extractFrame(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .seekInput(10) // Extract a frame at 10 seconds
            .frames(1)
            .output(outputPath)
            .on("end", () => {
                console.log(`Frame extracted to ${outputPath}`);
                resolve(outputPath);
            })
            .on("error", (err) => {
                reject(new Error(`FFmpeg error: ${err.message}`));
            })
            .run();
    });
}

async function summarizeFrame(imagePath) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const imageData = fs.readFileSync(imagePath).toString("base64");

    const response = await model.generateContent({
        contents: [
            { text: "Summarize this image from a video." },
            { inlineData: { mimeType: "image/jpeg", data: imageData } },
        ],
    });

    console.log("Summary:", response.text);
}

async function main() {
    let videoExists = false;
    let frameExists = false;

    try {
        await downloadFile(videoUrl, videoPath);
        videoExists = true;

        await extractFrame(videoPath, framePath);
        frameExists = true;

        await summarizeFrame(framePath);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        if (videoExists && fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
            console.log(`Cleaned up ${videoPath}`);
        }
        if (frameExists && fs.existsSync(framePath)) {
            fs.unlinkSync(framePath);
            console.log(`Cleaned up ${framePath}`);
        }
    }
}

main();