import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  // Cek apakah path sudah memiliki query parameter
  const separator = path.includes('?') ? '&' : '?';
  // Buat URLSearchParams untuk fleksibilitas jika nanti ingin menambah parameter lain
  const params = new URLSearchParams();
  params.set(type, message);

  return redirect(`${path}${separator}${params.toString()}`);
}
