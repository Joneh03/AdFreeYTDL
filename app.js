const ytdl = require("ytdl-core");
const readline = require("readline");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// Enable console I/O
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Infinite prompt for input
(function promptLoop() {
    // Prompt user to enter yt video url
    rl.question(`Paste youtube video url (q - quit): `, async (url) => {
        // Input to end the program
        if (url === "q") {
            rl.close();
            return;
        }

        // Check if input URL is correct
        try {
            // Store video title in global variable
            await ytdl.getInfo(url).then((info) => {
                video_title = adjustTitle(info.videoDetails.title);
                rl.write(`Downloading '${video_title}'\n\n`);
            });

            // Create a readable stream from given URL
            let stream = ytdl(url, {
                filter: "audioonly",
                quality: "highestaudio",
            });

            // Convert stream from .mp4 to .mp3
            let proc = ffmpeg({ source: stream });

            // Create a file in given path
            proc.saveToFile(`./Downloads/${video_title}.mp3`);
        } catch (err) {
            rl.write(`There's been a problem, try another URL\n${err}\n\n`);
        }
        
        // Ask for another url
        promptLoop();
    });
})();

// Remove unwanted text from video title
function adjustTitle(title) {
    const garbage = [
        " Official Video", " Official Music Video", " (Official Video)", " (Official Music Video)",
        " [Music Video]", " (Music Video)", " Lyrics", " LYRICS", " | GRM Daily",
        " ()", " []", " ( )", " [ ]", "|", "\\", "/", ":", "*", "?", "\"", "<", ">",
    ];

    // Delete found word from title and loop over
    for (let i = 0; i < garbage.length; i++) {
        if (title.includes(garbage[i])) {
            title = title.replace(garbage[i], "");
            i = 0;
        }
    }

    return title;
}
