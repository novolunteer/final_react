import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getMySchedule } from "../../../api/hr/staffScheduleApi";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const TYPE_COLORS = {
  DAY:     "#3b82f6",
  NIGHT:   "#6366f1",
  OFF:     "#9ca3af",
  EVENING: "#f59e0b",
};

const TYPE_LABELS = {
  DAY:     "주간",
  NIGHT:   "야간",
  OFF:     "휴무",
  EVENING: "저녁",
};

const STATUS_LABEL = { CONFIRMED: "확정", TEMP: "임시" };

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getMonthRange = (dateStr) => {
  const d     = new Date(dateStr);
  const year  = d.getFullYear();
  const month = d.getMonth();
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const last  = new Date(year, month + 1, 0).getDate();
  const end   = `${year}-${String(month + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { startDate: start, endDate: end };
};

const MySchedulePage = () => {
  const [scheduleList, setScheduleList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [currentMonth, setCurrentMonth] = useState(getTodayString());
  const [loading, setLoading]           = useState(false);
  const calendarRef = useRef(null);

  const fetchSchedule = async (monthDate) => {
    setLoading(true);
    try {
      const { startDate, endDate } = getMonthRange(monthDate);
      const data = await getMySchedule({ startDate, endDate, size: 100 });
      setScheduleList(data.content ?? []);
    } catch (err) { console.error("내 스케줄 조회 실패", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchedule(currentMonth); }, [currentMonth]);

  const events = useMemo(() =>
    scheduleList.map((item) => ({
      title:           item.typeName,
      date:            item.workDate,
      backgroundColor: TYPE_COLORS[item.typeCode] ?? "#6b7280",
      borderColor:     "transparent",
      extendedProps:   { ...item },
    })), [scheduleList]);

  const selectedDaySchedules = useMemo(() =>
    scheduleList.filter((item) => item.workDate === selectedDate),
    [scheduleList, selectedDate]);

  const staffName      = scheduleList[0]?.staffName ?? "";
  const departmentName = scheduleList[0]?.departmentName ?? "";

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          <div>
            <h1 className="text-lg font-bold text-zinc-900">내 스케줄</h1>
            {staffName && (
              <p className="text-xs text-zinc-400">{staffName} · {departmentName}</p>
            )}
          </div>
        </div>
        {loading && <span className="text-xs text-zinc-400">불러오는 중...</span>}
      </div>

      {/* 달력 + 사이드 패널 */}
      <div className="flex gap-4 items-start">
        {/* 달력 */}
        <div className="flex-1 bg-white rounded-xl border border-zinc-200 p-3 shadow-sm">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{ left: "", center: "title", right: "prev,next" }}
            datesSet={(info) => {
              const mid = new Date((info.start.getTime() + info.end.getTime()) / 2);
              const m   = `${mid.getFullYear()}-${String(mid.getMonth() + 1).padStart(2, "0")}-01`;
              setCurrentMonth(m);
            }}
            dateClick={(info) => setSelectedDate(info.dateStr)}
            height="auto"
            fixedWeekCount={false}
            dayMaxEvents={3}
          />
        </div>

        {/* 사이드 패널 */}
        <div className="w-60 shrink-0 bg-white rounded-xl border border-zinc-200 p-4 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-zinc-800">{selectedDate} 일정</p>

          {selectedDaySchedules.length === 0 ? (
            <p className="text-xs text-zinc-400">해당 날짜에 스케줄이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {selectedDaySchedules.map((item) => (
                <div key={item.scheduleId} className="rounded-lg border border-zinc-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: TYPE_COLORS[item.typeCode] ?? "#6b7280" }}
                    >
                      {item.typeName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700">{item.departmentName}</span>
                    <span className="text-zinc-400">{STATUS_LABEL[item.status] ?? item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 범례 */}
          <div className="pt-3 border-t border-zinc-100">
            <p className="text-xs font-semibold text-zinc-400 mb-2">범례</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_COLORS).map(([code, color]) => (
                <div key={code} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                  <span className="text-xs text-zinc-500">{TYPE_LABELS[code] ?? code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySchedulePage;
