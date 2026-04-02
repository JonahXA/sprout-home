import { useEffect } from "react";
import { isIframe } from "@/lib/utils";

export default function VisualEditAgent() {
 useEffect(() => {
 if (!isIframe) return;
 // If you want visual edit mode later, we can re-enable your full implementation.
 }, []);

 return null;
}
