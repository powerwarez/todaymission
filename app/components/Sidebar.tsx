import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/theme-context';
import { 
  CheckSquare, 
  Award, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const menuItems = [
  {
    path: '/dashboard',
    name: '오늘의 미션',
    icon: CheckSquare
  },
  {
    path: '/hall-of-fame',
    name: '명예의 전당',
    icon: Award
  },
  {
    path: '/challenges',
    name: '도전과제 설정',
    icon: Settings
  }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { themeColor, setThemeColor } = useTheme();
  
  return (
    <aside className={cn(
      "h-screen bg-white border-r border-primary-100 transition-all duration-300 flex flex-col", 
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-primary-700">오늘의 미션</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-2 hover:bg-primary-100 text-primary-500"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      
      <nav className="flex-1 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "flex items-center px-4 py-3 text-gray-700 hover:bg-primary-100 hover:text-primary-700 rounded-l-full transition-colors",
                    isActive && "bg-primary-100 text-primary-700 font-medium border-r-4 border-primary-500",
                    collapsed && "justify-center"
                  )
                }
              >
                <item.icon className={collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-primary-100">
        {!collapsed && (
          <select 
            className="w-full rounded-full px-3 py-2 text-sm border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value as any)}
          >
            <option value="pink">핑크 테마</option>
            <option value="blue">파란 테마</option>
            <option value="green">초록 테마</option>
            <option value="purple">보라 테마</option>
            <option value="yellow">노랑 테마</option>
          </select>
        )}
      </div>
    </aside>
  );
} 