import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { path: "/", label: "대시보드" },
    { path: "/patient", label: "환자 관리" },
    { path: "/reservation", label: "예약" },
    { path: "/reservationconfirm", label: "예약 확인" },
    { path: "/reception", label: "접수" },
    { path: "/medical", label: "진료 관리" },
    { path: "/billing", label: "수납 / 보험" },

    {
      label: "인사관리",
      children: [
        { path: "/staff", label: "직원관리" },
        { path: "/department", label: "부서관리" },
        { path: "/staff_schedule", label: "근무스케줄 관리" },
      ],
    },
    {
      label: "운영관리",
      children: [
        { path: "/operation/schedule_policy", label: "스케줄 운영설정" },
      ],
    },
    {
      label: "관리자",
      children: [
        { path: "/admin/account", label: "계정 / 권한 관리" },
        { path: "/admin/log", label: "로그 관리" },
      ],
    },

    { path: "/communication", label: "커뮤니케이션" },
    { path: "/notification", label: "알림" },
    { path: "/login", label: "로그인" },
    { path: "/chat", label: "채팅" },
    { path: "/inquiry/chatbot", label: "AI 문의하기" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">메뉴</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {

          if (item.children) {
            return (
              <div key={item.label} className="sidebar-group">
   
                <div className="sidebar-link sidebar-group-title">
                  {item.label}
                </div>

                <div className="sidebar-submenu">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        isActive
                          ? "sidebar-sublink active"
                          : "sidebar-sublink"
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }


          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;