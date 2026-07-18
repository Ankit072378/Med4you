import { StreamClient } from "@stream-io/node-sdk";

// Get your API key and secret from GetStream dashboard
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error(
        "GetStream API credentials are missing in environment variables"
    );
}

// Initialize Stream Client
const streamClient = new StreamClient(apiKey, apiSecret);

export default streamClient;

// Helper function to generate user token
export const generateUserToken = (userId) => {
    return streamClient.createToken(userId);
};

// Helper function to create a call
export const createVideoCall = async (callId, hospitalUserId) => {
    const call = streamClient.video.call("livestream", callId);

    await call.getOrCreate({
        data: {
            created_by_id: hospitalUserId,
            members: [
                {
                    user_id: hospitalUserId,
                    role: "host",
                },
            ],
            settings_override: {
                audio: {
                    mic_default_on: false,
                    default_device: "speaker",
                },
                video: {
                    camera_default_on: true,
                    target_resolution: {
                        width: 1280,
                        height: 720,
                    },
                },
            },
        },
    });

    return call;
};


// Helper function to end a call
export const endVideoCall = async (callId) => {
    try {
        const call = streamClient.video.call("livestream", callId);
        await call.end();
        return true;
    } catch (error) {
        console.error("Error ending video call:", error);
        throw error;
    }
};