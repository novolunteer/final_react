import { replace, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Bot, ArrowRight, Megaphone } from "lucide-react";
import { getNoticeList } from "../../api/noticeApi";

const FEATURES = [
  {
    path: "/reservation",
    icon: CalendarCheck,
    title: "진료 예약",
    description: "원하는 진료과와 의사를 선택해 간편하게 예약하세요.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "hover:border-blue-200",
  },
  {
    path: "/inquiry/chatbot",
    icon: Bot,
    title: "AI 문의",
    description: "병원 이용시 궁금한 점을 AI 챗봇에게 물어보세요.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "hover:border-violet-200",
  },
];

const PatientHomePage = () => {
  const navigate = useNavigate();
  const { name, userId, roles } = useSelector((s) => s.auth);

  const handleFeatureClick = (path) => {
    if (path !== "/reservation") { navigate(path); return; }
    if (!userId) { navigate("/login"); return; }
    if (!Array.isArray(roles) || !roles.includes("PATIENT")) {
      alert("환자 계정으로만 진료를 예약할 수 있습니다.");
      return;
    }
    navigate(path);
  };

  const { data: noticeData } = useQuery({
    queryKey: ["noticePreview"],
    queryFn: () => getNoticeList(0, 4),
    staleTime: 1000 * 60 * 5,
  });

  const notices = noticeData?.content ?? [];
  const formatDate = (str) => (str ? str.slice(0, 10) : "");

  return (
    <div className="space-y-6">
      {/* 파란 배너 */}
      <div className="rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 px-8 py-10 text-white">
        <p className="text-blue-200 text-sm font-medium mb-3">
          {name ? `${name} 님, 안녕하세요.` : "안녕하세요."}
        </p>
        <h1 className="text-3xl font-bold leading-snug mb-3">
          편리한 진료,<br />스마트한 건강 관리
        </h1>
        <p className="text-blue-100 text-sm leading-relaxed">
          진료 예약부터 공지 확인, AI 의료 문의까지<br />
          필요한 서비스를 한 곳에서 이용하세요.
        </p>
      </div>

      {/* 카드 2개 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map(({ path, icon: Icon, title, description, color, bg, border }) => (
          <Card
            key={path}
            onClick={() => handleFeatureClick(path)}
            className={`cursor-pointer hover:shadow-md transition-all border-zinc-200 ${border} group`}
          >
            <CardHeader className="pb-2">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <CardTitle className="text-base flex items-center justify-between">
                {title}
                <ArrowRight
                  size={15}
                  className="text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                {description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 공지사항 미리보기 */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Megaphone size={15} className="text-blue-600" />
            <span className="text-sm font-semibold text-zinc-800">공지사항</span>
          </div>
          <button
            onClick={() => navigate("/communication")}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            전체보기 <ArrowRight size={12} />
          </button>
        </div>

        <ul className="divide-y divide-zinc-100">
          {notices.length === 0 ? (
            <li className="px-5 py-8 text-sm text-zinc-400 text-center">
              공지사항이 없습니다.
            </li>
          ) : (
            notices.map((n) => (
              <li
                key={n.notificationId}
                onClick={() => navigate("/communication")}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {n.important && (
                    <Badge className="text-[10px] px-1.5 py-0 shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                      중요
                    </Badge>
                  )}
                  <span className="text-sm text-zinc-700 truncate">{n.title}</span>
                </div>
                <span className="text-xs text-zinc-400 shrink-0 ml-3">
                  {formatDate(n.createdAt)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default PatientHomePage;
