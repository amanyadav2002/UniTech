import API from "./api";

const studentService = {
  getProfile: async () => {
    const response = await API.get("/student/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await API.put("/student/profile", data);
    return response.data;
  },
  getResources: async () => {
    const response = await API.get("/student/resources");
    return response.data;
  },
  getAttendance: async () => {
    const response = await API.get("/student/attendance");
    return response.data;
  },
  getGrades: async () => {
    const response = await API.get("/student/grades");
    return response.data;
  },
  getNotices: async () => {
    const response = await API.get("/student/notices");
    return response.data;
  },
  getBookmarks: async () => {
    const response = await API.get("/student/bookmarks");
    return response.data;
  },
  addBookmark: async (bookmark) => {
    const response = await API.post("/student/bookmarks", bookmark);
    return response.data;
  },
  removeBookmark: async (itemId) => {
    const response = await API.delete(`/student/bookmarks/${itemId}`);
    return response.data;
  },
  getTasks: async () => {
    const response = await API.get("/student/tasks");
    return response.data;
  },
  createTask: async (taskText) => {
    const response = await API.post("/student/tasks", { text: taskText });
    return response.data;
  },
  toggleTask: async (taskId, completed) => {
    const response = await API.put(`/student/tasks/${taskId}`, { completed });
    return response.data;
  },
  deleteTask: async (taskId) => {
    const response = await API.delete(`/student/tasks/${taskId}`);
    return response.data;
  },
  getSchedule: async () => {
    const response = await API.get("/student/schedule");
    return response.data;
  },
  saveGPA: async (data) => {
    const response = await API.post("/student/gpa", data);
    return response.data;
  },
};

export default studentService;
