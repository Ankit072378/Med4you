import { axiosInstance } from "@/lib/axios";

export async function patientSignup(data) {
    try {
        const res = await axiosInstance.post("/auth/patientSignup", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Patient signup failed" };
    }
}

export async function doctorSignup(data) {
    try {
        const res = await axiosInstance.post("/auth/doctorSignup", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Doctor signup failed" };
    }
}

export async function hospitalSignup(data) {
    try {
        const res = await axiosInstance.post("/auth/hospitalSignup", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Hospital signup failed" };
    }
}

export async function login(data) {
    try {
        const res = await axiosInstance.post("/auth/login", data);
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
}

export async function logout() {
    try {
        const res = await axiosInstance.post("/auth/logout");
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Logout failed" };
    }
}

export async function me() {
    try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Fetch user failed" };
    }
}


// Upload profile photo for Doctor/Patient (single image)
export async function postProfilePhoto(imageFile) {
    try {
        const formData = new FormData();
        formData.append("images", imageFile);

        const res = await axiosInstance.post("/auth/profilePhoto", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Profile photo upload failed" };
    }
}

// Upload photos for Hospital (up to 4 images)
export async function postPhotos(imageFiles) {
    try {
        const formData = new FormData();
        
        // Append multiple images
        if (Array.isArray(imageFiles)) {
            imageFiles.forEach((file) => {
                formData.append("images", file);
            });
        } else {
            formData.append("images", imageFiles);
        }

        const res = await axiosInstance.post("/auth/postPhotos", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || { message: "Hospital photos upload failed" };
    }
}

export async function uploadVerificationDocs(userId, files) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await axiosInstance.post(
        `/auth/upload-verification/${userId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
}
