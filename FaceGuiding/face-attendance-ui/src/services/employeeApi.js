import { API_BASE_URL } from "../utils/constants.js";

export async function getEmployees() {
  const response = await fetch(
    `${API_BASE_URL}/User`
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : "Không thể lấy danh sách nhân viên"
    );
  }

  return data;
}