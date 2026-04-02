import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Video, BookOpen, FileText } from "lucide-react";

export default function LessonResources({ resources }) {
 if (!resources || resources.length === 0) return null;

 const getIcon = (type) => {
 switch (type) {
 case "video":
 return Video;
 case "article":
 return FileText;
 case "course":
 return BookOpen;
 default:
 return ExternalLink;
 }
 };

 const getColor = (type) => {
 switch (type) {
 case "video":
 return "bg-[#FEF2F2] border-red-200";
 case "article":
 return "bg-[#E8F0FE] border-[#1B2B5E]/30";
 case "course":
 return "bg-[#F3F0FF] border-[#7C3AED]/30";
 default:
 return "from-gray-100 to-gray-200 border-gray-300";
 }
 };

 return (
 <Card className="border-none shadow-lg bg-[#FFF0E6] border-2 border-[#F97316]/30">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-xl">
 <BookOpen className="w-6 h-6 text-orange-600" />
 Additional Resources
 </CardTitle>
 <p className="text-sm text-gray-600 mt-2">Explore these hand-picked resources to deepen your understanding</p>
 </CardHeader>

 <CardContent className="space-y-3">
 {resources.map((resource, index) => {
 const Icon = getIcon(resource.type);
 const colorClass = getColor(resource.type);

 return (
 <a
 key={index}
 href={resource.url}
 target="_blank"
 rel="noopener noreferrer"
 className={`block p-4 rounded-xl bg-gradient-to-r ${colorClass} border-2 hover:shadow-md transition-all group`}
 >
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
 <Icon className="w-5 h-5 text-gray-700" />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
 {resource.title}
 </p>
 <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
 </div>

 {resource.description && <p className="text-sm text-gray-600 mt-1">{resource.description}</p>}

 {resource.duration && (
 <Badge variant="outline" className="mt-2 text-xs">
 {resource.duration}
 </Badge>
 )}
 </div>
 </div>
 </a>
 );
 })}
 </CardContent>
 </Card>
 );
}
