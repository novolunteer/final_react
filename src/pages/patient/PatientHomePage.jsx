import { useNavigate } from "react-router-dom";
import hospitalImg from "../../assets/hospital.jpg";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Bot, Megaphone, ArrowRight } from "lucide-react";
import { getNoticeList } from "../../api/noticeApi";

const FEATURE_CARDS = [
  {
    path: "/reservation",
    icon: CalendarCheck,
    title: "진료 예약",
    subtitle: "Appointment",
    description: "원하는 진료과와 의사를\n선택해 간편하게 예약하세요.",
    bg: "rgba(29, 78, 216, 0.93)",
    isReservation: true,
    delay: 0,
  },
  {
    path: "/inquiry/chatbot",
    icon: Bot,
    title: "AI 문의",
    subtitle: "AI Chatbot",
    description: "궁금한 점을 AI 챗봇에게\n언제든지 물어보세요.",
    bg: "rgba(109, 40, 217, 0.93)",
    isReservation: false,
    delay: 120,
  },
  {
    path: "/communication",
    icon: Megaphone,
    title: "공지사항",
    subtitle: "Notice",
    description: "병원 공지 및 이벤트 소식을\n빠르게 확인하세요.",
    bg: "rgba(180, 83, 9, 0.93)",
    isReservation: false,
    delay: 240,
  },
];

const PatientHomePage = () => {
  const navigate = useNavigate();
  const { name, userId, roles } = useSelector((s) => s.auth);

  const handleCardClick = (card) => {
    if (card.isReservation) {
      if (!userId) { navigate("/login"); return; }
      if (!Array.isArray(roles) || !roles.includes("PATIENT")) {
        alert("환자 계정으로만 진료를 예약할 수 있습니다.");
        return;
      }
    }
    navigate(card.path);
  };

  const { data: noticeData } = useQuery({
    queryKey: ["noticePreview"],
    queryFn: () => getNoticeList(0, 4),
    staleTime: 1000 * 60 * 5,
  });

  const notices = noticeData?.content ?? [];
  const formatDate = (str) => (str ? str.slice(0, 10) : "");

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-card {
          opacity: 0;
          animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-card:hover { filter: brightness(1.12); }
      `}</style>

      <div className="space-y-5">
        {/* Hero + Cards */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${hospitalImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "460px",
          }}
        >
          {/* 어두운 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/75" />

          {/* 인사말 + 헤드라인 */}
          <div className="relative z-10 px-8 pt-10 text-white">
            <p className="text-blue-200 text-sm font-medium mb-3">
              {name ? `${name} 님, 안녕하세요.` : "안녕하세요."}
            </p>
            <h1 className="text-3xl font-bold leading-snug">
              편리한 진료,<br />스마트한 건강 관리
            </h1>
            <p className="text-white/60 text-sm mt-3 leading-relaxed">
              진료 예약부터 AI 의료 문의, 공지 확인까지<br />
              필요한 서비스를 한 곳에서 이용하세요.
            </p>
          </div>

          {/* 슬라이드업 카드 3개 */}
          <div className="absolute bottom-0 left-0 right-0 z-20 grid grid-cols-3">
            {FEATURE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.path}
                  className="hero-card cursor-pointer group p-6 flex flex-col justify-between transition-all duration-200"
                  style={{
                    background: card.bg,
                    minHeight: "190px",
                    animationDelay: `${card.delay}ms`,
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  <div>
                    <p className="text-white/55 text-xs font-medium mb-1 tracking-wide">
                      {card.subtitle}
                    </p>
                    <h2 className="text-white text-xl font-bold mb-3">{card.title}</h2>
                    <p className="text-white/75 text-sm leading-relaxed whitespace-pre-line">
                      {card.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/75 text-sm mt-4 group-hover:text-white group-hover:gap-3 transition-all duration-200">
                    바로가기 <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 공지사항 리스트 */}
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
    </>
  );
};

export default PatientHomePage;
