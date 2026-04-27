import jwtAxios , {API_BASE_URL} from "./jwtAxios";

<<<<<<< HEAD
const host = "/api/surgery";
=======
const host = `${API_BASE_URL}/surgery`;
>>>>>>> 9a1f610be75b450ca0528488807f139d64137260

export const getSurgeryList = async () => {
  const res = await jwtAxios.get(host);
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

export const registerSurgery = async (data) => {
  const res = await jwtAxios.post(host, data);
  return res.data?.content;
};

export const registerEmergencySurgery = async (data) => {
  const res = await jwtAxios.post(`${host}/emergency`, data);
  return res.data?.content;
};

export const updateSurgery = async (data) => {
  const res = await jwtAxios.put(host, data);
  return res.data?.content;
};

export const cancelSurgery = async (surgeryId) => {
  const res = await jwtAxios.delete(`${host}/${surgeryId}`);
  return res.data;
};
