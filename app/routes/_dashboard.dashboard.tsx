import { useLoaderData, Form } from 'react-router';
import { supabase, type Mission } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { formatDate, getCurrentWeekDates, getDayOfWeek } from '../lib/utils';
import { Todo } from '../components/Todo';

export async function loader() {
  const userId = await getUserId();
  const today = new Date();
  const weekday = getDayOfWeek(today);
  
  const { data: missions, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('id');
    
  if (error) {
    throw new Error('미션을 불러오는데 실패했습니다');
  }
  
  const weekDates = getCurrentWeekDates();
  
  return { 
    missions: missions as Mission[], 
    today,
    weekday,
    weekDates
  };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const userId = await getUserId();
  const intent = formData.get('intent');
  
  if (intent === 'complete') {
    const id = Number(formData.get('id'));
    const completed = formData.get('completed') === 'true';
    
    const { error } = await supabase
      .from('missions')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      throw new Error('미션 상태 업데이트에 실패했습니다');
    }
    
    // 미션 히스토리 기록
    if (completed) {
      const today = new Date();
      const weekNumber = Math.ceil((today.getDate() - today.getDay() + 1) / 7);
      
      await supabase
        .from('mission_history')
        .insert({
          user_id: userId,
          mission_id: id,
          completed_at: new Date().toISOString(),
          week_number: weekNumber,
          year: today.getFullYear()
        });
        
      // 도전과제 확인 및 배지 부여 로직은 여기에 추가
    }
  }
  
  return { success: true };
}

export default function Dashboard() {
  const { missions, today, weekDates } = useLoaderData<typeof loader>();
  
  const handleComplete = async (id: number, completed: boolean) => {
    const formData = new FormData();
    formData.append('intent', 'complete');
    formData.append('id', id.toString());
    formData.append('completed', completed.toString());
    
    // 폼 서브밋을 통해 액션 호출
    document.createElement('form').submit.call({
      method: 'post',
      action: '/dashboard',
      append: () => {},
      formData: formData
    });
  };
  
  const dayNames = ['월', '화', '수', '목', '금'];
  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-700">오늘의 미션</h1>
        <p className="text-gray-600">{formatDate(today)}</p>
      </header>
      
      <div className="bg-white rounded-3xl shadow-soft p-6 mb-8">
        <div className="grid grid-cols-5 gap-3 mb-4">
          {weekDates.map((date, index) => {
            const isToday = date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear();
            return (
              <div 
                key={date.toString()} 
                className={`text-center p-2 rounded-xl ${
                  isToday ? 'bg-primary-200 text-primary-800 font-bold' : 'bg-gray-100'
                }`}
              >
                <div className="mb-1">{dayNames[index]}</div>
                <div>{date.getDate()}</div>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-4">
          {missions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">도전과제 설정에서 미션을 추가해보세요!</p>
            </div>
          ) : (
            missions.map(mission => (
              <Todo 
                key={mission.id} 
                mission={mission} 
                onComplete={handleComplete} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 