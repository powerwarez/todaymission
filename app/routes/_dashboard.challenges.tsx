import { useLoaderData, Form } from 'react-router';
import { Plus, Minus, Save, Trash2 } from 'lucide-react';
import { supabase, type Mission, type Challenge } from '../lib/supabase';
import { getUserId } from '../lib/auth';
import { Button } from '../components/ui/button';

export async function loader() {
  const userId = await getUserId();
  
  // 사용자 미션 정보
  const { data: missions, error: missionsError } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('id');
    
  if (missionsError) {
    throw new Error('미션 정보를 불러오는데 실패했습니다');
  }
  
  // 도전 과제 목록
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select(`
      *,
      badge:badges(*)
    `);
    
  if (challengesError) {
    throw new Error('도전 과제 정보를 불러오는데 실패했습니다');
  }
  
  return { 
    missions: missions as Mission[],
    challenges: challenges as Challenge[],
  };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const userId = await getUserId();
  const intent = formData.get('intent') as string;
  
  // 미션 추가
  if (intent === 'add-mission') {
    const { error } = await supabase
      .from('missions')
      .insert({
        user_id: userId,
        title: '새 미션',
        weekday: formData.get('weekday'),
        completed: false
      });
      
    if (error) {
      throw new Error('미션 추가에 실패했습니다');
    }
  }
  
  // 미션 삭제
  else if (intent === 'delete-mission') {
    const id = Number(formData.get('id'));
    
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      throw new Error('미션 삭제에 실패했습니다');
    }
  }
  
  // 미션 업데이트
  else if (intent === 'update-mission') {
    const id = Number(formData.get('id'));
    const title = formData.get('title') as string;
    
    const { error } = await supabase
      .from('missions')
      .update({ title })
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      throw new Error('미션 업데이트에 실패했습니다');
    }
  }
  
  return { success: true };
}

export default function Challenges() {
  const { missions, challenges } = useLoaderData<typeof loader>();
  
  // 요일별 미션 그룹화
  const missionsByDay: Record<string, Mission[]> = {
    monday: missions.filter(m => m.weekday === 'monday'),
    tuesday: missions.filter(m => m.weekday === 'tuesday'),
    wednesday: missions.filter(m => m.weekday === 'wednesday'),
    thursday: missions.filter(m => m.weekday === 'thursday'),
    friday: missions.filter(m => m.weekday === 'friday')
  };
  
  const weekdayNames = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일'
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-700">도전과제 설정</h1>
        <p className="text-gray-600">매주 할 미션과 도전과제를 설정하세요!</p>
      </header>
      
      <div className="bg-white rounded-3xl shadow-soft p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary-600">주간 미션 설정</h2>
        <p className="text-sm text-gray-500 mb-6">각 요일별로 3~10개 사이의 미션을 설정할 수 있어요.</p>
        
        <div className="space-y-8">
          {Object.entries(missionsByDay).map(([day, dayMissions]) => (
            <div key={day} className="border border-gray-200 rounded-2xl p-4">
              <h3 className="text-lg font-medium mb-3 text-gray-800 flex justify-between items-center">
                <span>{weekdayNames[day as keyof typeof weekdayNames]}</span>
                <div className="flex items-center">
                  <Form method="post">
                    <input type="hidden" name="intent" value="add-mission" />
                    <input type="hidden" name="weekday" value={day} />
                    <Button 
                      type="submit"
                      variant="ghost" 
                      size="sm"
                      disabled={dayMissions.length >= 10}
                      className="mr-2 text-green-500 hover:text-green-600 hover:bg-green-50"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </Form>
                </div>
              </h3>
              
              {dayMissions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400">+ 버튼을 눌러 미션을 추가하세요</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {dayMissions.map(mission => (
                    <li key={mission.id} className="flex items-center">
                      <Form method="post" className="flex-1 flex items-center">
                        <input type="hidden" name="intent" value="update-mission" />
                        <input type="hidden" name="id" value={mission.id} />
                        <input
                          name="title"
                          className="flex-1 py-2 px-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300"
                          defaultValue={mission.title}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-primary-500"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </Form>
                      
                      <Form method="post" className="ml-2">
                        <input type="hidden" name="intent" value="delete-mission" />
                        <input type="hidden" name="id" value={mission.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary-600">달성 가능한 도전과제</h2>
        
        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 설정된 도전과제가 없어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="border border-gray-200 rounded-2xl p-4 flex items-center">
                <div className="bg-primary-100 rounded-full p-3 mr-4">
                  <img 
                    src={challenge.badge?.image_url} 
                    alt={challenge.title}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}