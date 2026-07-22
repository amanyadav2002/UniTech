import API from "./api";

const facultyService = {
  getProfile: async () => {
    const response = await API.get("/faculty/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await API.put("/faculty/profile", data);
    return response.data;
  },
  getClasses: async () => {
    const response = await API.get("/faculty/classes");
    return response.data;
  },
  getAttendanceRoster: async (params) => {
    const response = await API.get("/faculty/attendance", { params });
    return response.data;
  },
  submitAttendance: async (data) => {
    const response = await API.post("/faculty/attendance", data);
    return response.data;
  },
  getGrades: async (params) => {
    const response = await API.get("/faculty/grades", { params });
    return response.data;
  },
  submitGrade: async (data) => {
    const response = await API.post("/faculty/grades", data);
    return response.data;
  },
  getNotices: async () => {
    const response = await API.get("/faculty/notices");
    return response.data;
  },
  createNotice: async (data) => {
    const response = await API.post("/faculty/notices", data);
    return response.data;
  },
  updateNotice: async (id, data) => {
    const response = await API.put(`/faculty/notices/${id}`, data);
    return response.data;
  },
  deleteNotice: async (id) => {
    const response = await API.delete(`/faculty/notices/${id}`);
    return response.data;
  },
  getSchedule: async () => {
    const response = await API.get("/faculty/schedule");
    return response.data;
  },
  getResources: async () => {
    const response = await API.get("/faculty/resources");
    return response.data;
  },
  uploadResource: async (data) => {
    const response = await API.post("/faculty/resources", data);
    return response.data;
  },
  deleteResource: async (id) => {
    const response = await API.delete(`/faculty/resources/${id}`);
    return response.data;
  },
};

export default facultyService;
