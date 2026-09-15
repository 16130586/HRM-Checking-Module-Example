import { API_BASE_URL } from "../utils/constants.js";

/**
 * Register face
 */
export async function registerFace(
  userId,
  base64Images
) {
  const response = await fetch(
    `${API_BASE_URL}/Attendance/register/${userId}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        base64Images,
      }),
    }
  );

  const data = await parseResponse(
    response
  );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Đăng ký khuôn mặt thất bại"
      )
    );
  }

  return data;
}


/**
 * Check-in by face
 */
export async function checkIn(
  base64Image
) {
  const response = await fetch(
    `${API_BASE_URL}/Attendance/check-in`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        base64Image,
      }),
    }
  );

  const data = await parseResponse(
    response
  );

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Chấm công thất bại"
      )
    );
  }

  return data;
}


/**
 * Parse JSON / plain-text API response.
 */
async function parseResponse(
  response
) {
  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    return await response.json();
  }

  return await response.text();
}


/**
 * Convert API error into readable message.
 */
function getErrorMessage(
  data,
  fallback
) {
  if (typeof data === "string") {
    return data || fallback;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.title) {
    return data.title;
  }

  return fallback;
}