const { Octokit } = require("@octokit/rest");
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const { name, email, song } = JSON.parse(event.body);
    if (!name || !email || !song) {
        return {
            statusCode: 400,
            body: 'Bad Request'
        };
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    const content = `
    Name: ${name}
    Email: ${email}
    Song: ${song}
    `;

    const fileName = `requests/${uuidv4()}.txt`;
    try {
        await octokit.repos.createOrUpdateFileContents({
            owner: 'your-github-username',
            repo: 'song-requests-db',
            path: fileName,
            message: 'New song request',
            content: Buffer.from(content).toString('base64')
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Request submitted successfully!' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: 'Failed to submit request'
        };
    }
};
