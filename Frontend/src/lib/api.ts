export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://187.127.121.139:3000"
).replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const uploadUrl = (fileName?: string | null) => {
  if (!fileName) return "/general_profil.png";
  if (/^(https?:|data:)/i.test(fileName)) return fileName;

  const normalizedName = fileName.replace(/^\/?uploads\//, "");
  return apiUrl(`/uploads/${normalizedName}`);
};
