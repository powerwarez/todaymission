import { useLoaderData } from "react-router";
import {
  supabase,
  type UserBadge,
  type Badge,
  type MissionHistory,
} from "../lib/server";
import { getUserId } from "../lib/auth";
import { getWeekNumber } from "../lib/utils";

export async function loader() {
  const userId = await getUserId();

  // 사용자 획득 배지 목록
  const { data: userBadges, error: badgeError } = await supabase
    .from("user_badges")
    .select(
      `
      *,
      badge:badges(*)
    `
    )
    .eq("user_id", userId);

  if (badgeError) {
    throw new Error("배지 정보를 불러오는데 실패했습니다");
  }

  // 주별 미션 이력 불러오기
  const currentYear = new Date().getFullYear();
  const currentWeek = getWeekNumber(new Date());

  const { data: weeklyHistory, error: historyError } = await supabase
    .from("mission_history")
    .select(
      `
      *,
      mission:missions(*)
    `
    )
    .eq("user_id", userId)
    .eq("year", currentYear)
    .order("week_number", { ascending: false })
    .order("completed_at", { ascending: false });

  if (historyError) {
    throw new Error("미션 이력을 불러오는데 실패했습니다");
  }

  // 주별로 미션 이력 그룹화
  const weeklyMissions: Record<number, MissionHistory[]> = {};
  weeklyHistory.forEach((history) => {
    if (!weeklyMissions[history.week_number]) {
      weeklyMissions[history.week_number] = [];
    }
    weeklyMissions[history.week_number].push(history);
  });

  return {
    userBadges: userBadges as (UserBadge & { badge: Badge })[],
    weeklyMissions,
    currentWeek,
  };
}

export default function HallOfFame() {
  const { userBadges, weeklyMissions, currentWeek } =
    useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-700">명예의 전당</h1>
        <p className="text-gray-600">지금까지 달성한 업적을 확인하세요!</p>
      </header>

      <div className="bg-white rounded-3xl shadow-soft p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary-600">
          내 배지 컬렉션
        </h2>

        {userBadges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              아직 획득한 배지가 없어요. 도전과제를 달성해보세요!
            </p>
          </div>
        ) : (
          <div className="honeycomb-grid">
            {userBadges.map((userBadge, index) => (
              <div
                key={userBadge.id}
                className="honeycomb-cell"
                style={
                  {
                    "--i": index,
                  } as React.CSSProperties
                }
              >
                <div className="honeycomb-content">
                  <img
                    src={userBadge.badge.image_url}
                    alt={userBadge.badge.name}
                    className="w-16 h-16 object-contain"
                  />
                  <span className="text-sm font-medium mt-2 text-center">
                    {userBadge.badge.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-soft p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary-600">
          주간 미션 달성 기록
        </h2>

        <div className="space-y-6">
          {Object.keys(weeklyMissions).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                아직 완료한 미션이 없어요. 오늘의 미션을 완료해보세요!
              </p>
            </div>
          ) : (
            Object.entries(weeklyMissions).map(([week, missions]) => (
              <div
                key={week}
                className="border border-gray-200 rounded-2xl p-4"
              >
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  {currentWeek === Number(week) ? "이번 주" : `${week}주차`}{" "}
                  (완료 미션: {missions.length}개)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {missions.map((history) => (
                    <div
                      key={history.id}
                      className="bg-gray-50 rounded-xl p-3 flex items-center"
                    >
                      <div className="bg-primary-100 rounded-full p-2 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-primary-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{history.mission?.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(history.completed_at).toLocaleDateString(
                            "ko-KR",
                            {
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
