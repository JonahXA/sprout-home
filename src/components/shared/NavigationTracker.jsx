import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isIframe } from "@/lib/utils";

export default function NavigationTracker() {
 const location = useLocation();

 useEffect(() => {
 if (!isIframe) return;
 window.parent?.postMessage(
 {
 type: "app_changed_url",
 url: window.location.href,
 },
 "*"
 );
 }, [location]);

 return null;
}
