export function checkBenchieSupport() {
    const isProduction = process.env.NODE_ENV === "production";
    const t = (url: string, cdn: string) => `${cdn}/${url}`;
    const CDN_URL = "https://cdn.example.com"; 

    if (!isProduction) return false;
    return (
      typeof t !== "undefined" &&
      typeof CDN_URL !== "undefined" &&
      typeof t === "function" &&
      typeof CDN_URL === "string"
    );
  }
  