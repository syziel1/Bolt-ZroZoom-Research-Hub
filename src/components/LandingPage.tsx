import { useState, useEffect } from 'react';
import { supabase, Resource, Subject } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { 
  BookOpen, 
  Library, 
  Layers, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  Users, 
  Calculator,
  Atom,
  Code,
  Beaker,
  Globe,
  Palette,
  Music,
  Activity,
  Star,
  Quote
} from 'lucide-react';

type LandingPageProps = {
  onNavigateToAuth: () => void;
  onBrowseAsGuest: () => void;
};

type Stats = {
  resourcesCount: number;
  subjectsCount: number;
  levelsCount: number;
  usersCount: number;
};

type RecentActivity = {
  id: string;
  title: string;
  created_at: string;
  subject_name: string;
};

export function LandingPage({ onNavigateToAuth, onBrowseAsGuest }: LandingPageProps) {
  const [stats, setStats] = useState<Stats>({ resourcesCount: 0, subjectsCount: 0, levelsCount: 0, usersCount: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLandingPageData();
  }, []);

  const loadLandingPageData = async () => {
    setLoading(true);
    try {
      const [resourcesCount, subjectsData, levelsCount, latestResourcesData, usersCount, recentActivitiesData] = await Promise.all([
        supabase.from('v_resources_full').select('*', { count: 'exact', head: true }),
        supabase.from('v_subjects_basic').select('*').order('order_index'),
        supabase.from('levels').select('*', { count: 'exact', head: true }),
        supabase
          .from('v_resources_full')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('v_resources_full')
          .select('id, title, created_at, subject_name')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        resourcesCount: resourcesCount.count || 0,
        subjectsCount: subjectsData.data?.length || 0,
        levelsCount: levelsCount.count || 0,
        usersCount: usersCount.count || 0,
      });

      if (subjectsData.data) setSubjects(subjectsData.data);
      if (latestResourcesData.data) setLatestResources(latestResourcesData.data);
      if (recentActivitiesData.data) setRecentActivities(recentActivitiesData.data);
    } catch (error) {
      console.error('Error loading landing page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToResources = () => {
    const element = document.getElementById('latest-resources');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSubjectIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    if (name.includes('matematyka') || name.includes('math')) return Calculator;
    if (name.includes('fizyka') || name.includes('physics')) return Atom;
    if (name.includes('chemia') || name.includes('chemistry')) return Beaker;
    if (name.includes('informatyka') || name.includes('programowanie') || name.includes('computer')) return Code;
    if (name.includes('geografia') || name.includes('geography')) return Globe;
    if (name.includes('sztuka') || name.includes('art')) return Palette;
    if (name.includes('muzyka') || name.includes('music')) return Music;
    if (name.includes('biologia') || name.includes('biology')) return Activity;
    return BookOpen;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'przed chwilą';
    if (diffInMinutes < 60) return `${diffInMinutes} min temu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h temu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'wczoraj';
    if (diffInDays < 7) return `${diffInDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl w-full text-center">
          <div className="mb-8">
            <div className="inline-block bg-blue-100 p-4 rounded-2xl mb-6">
              <Library size={64} className="text-blue-600" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              ZroZoom Research Hub
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Twoja baza wiedzy edukacyjnej
            </p>
            <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
              Odkryj tysiące materiałów edukacyjnych, pogrupowanych według przedmiotów i poziomów.
              Ucz się efektywniej z zaufanymi zasobami wybranymi przez społeczność.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onNavigateToAuth}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Zaloguj się
              <ArrowRight size={20} />
            </button>
            <button
              onClick={scrollToResources}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all hover:scale-105 w-full sm:w-auto"
            >
              Przeglądaj zasoby
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-50 p-3 rounded-full">
                  <BookOpen size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.resourcesCount}</div>
              <div className="text-gray-600">Dostępnych zasobów</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-50 p-3 rounded-full">
                  <Users size={32} className="text-green-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.usersCount}+</div>
              <div className="text-gray-600">Aktywnych użytkowników</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-50 p-3 rounded-full">
                  <Layers size={32} className="text-purple-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.subjectsCount}</div>
              <div className="text-gray-600">Przedmiotów</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-orange-50 p-3 rounded-full">
                  <Award size={32} className="text-orange-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.levelsCount}</div>
              <div className="text-gray-600">Poziomów</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dostępne przedmioty</h2>
            <p className="text-lg text-gray-600">Wybierz przedmiot i rozpocznij naukę</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const SubjectIcon = getSubjectIcon(subject.subject_name);
              return (
                <div
                  key={subject.subject_id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-all hover:scale-105 border border-gray-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <SubjectIcon size={32} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {subject.subject_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {subject.resources_count} {subject.resources_count === 1 ? 'zasób' : 'zasobów'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {subjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Brak dostępnych przedmiotów</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-50 p-3 rounded-full mb-4">
              <Quote size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Co mówią nasi użytkownicy
            </h2>
            <p className="text-lg text-gray-600">Opinie uczniów i nauczycieli korzystających z platformy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Dzięki ZroZoom znalazłam wszystkie materiały potrzebne do matury rozszerzonej. 
                System ocen pomógł mi wybrać najlepsze zasoby. Zdałam z wynikiem 98%!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  AK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Anna Kowalska</p>
                  <p className="text-sm text-gray-600">Uczniowa, matura 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Jako nauczyciel matematyki używam tej platformy do dzielenia się materiałami z uczniami. 
                Hierarchiczna struktura tematów jest genialnie zaprojektowana!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  PN
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Piotr Nowak</p>
                  <p className="text-sm text-gray-600">Nauczyciel matematyki</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Wspaniałe narzędzie do organizacji wiedzy. Możliwość komentowania i oceniania 
                zasobów sprawia, że jakość materiałów jest naprawdę wysoka."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MW
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Maria Wiśniewska</p>
                  <p className="text-sm text-gray-600">Studentka fizyki</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 p-3 rounded-full mb-4">
              <Activity size={32} className="text-green-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Najnowsze aktywności
            </h2>
            <p className="text-lg text-gray-600">Zobacz co dodają inni użytkownicy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.subject_name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-400 whitespace-nowrap ml-4">
                      {formatTimeAgo(activity.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Brak aktywności</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="latest-resources" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-50 p-3 rounded-full mb-4">
              <TrendingUp size={32} className="text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ostatnio dodane materiały
            </h2>
            <p className="text-lg text-gray-600">Odkryj najnowsze zasoby dodane przez społeczność</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {latestResources.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Brak dostępnych zasobów</p>
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={onBrowseAsGuest}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              Przeglądaj materiały jako gość
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <p className="text-sm font-semibold text-white flex items-center gap-2 justify-center">
              <Users size={16} />
              Dołącz do {stats.usersCount}+ aktywnych użytkowników
            </p>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Gotowi do nauki?
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Dołącz do społeczności uczących się i odkryj tysiące sprawdzonych materiałów edukacyjnych
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={onNavigateToAuth}
              className="bg-white text-blue-600 px-10 py-5 rounded-xl text-xl font-bold hover:bg-blue-50 transition-all hover:scale-110 shadow-2xl inline-flex items-center gap-3 group w-full sm:w-auto justify-center"
            >
              Rozpocznij teraz
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBrowseAsGuest}
              className="bg-transparent text-white px-10 py-5 rounded-xl text-xl font-bold border-2 border-white hover:bg-white/10 transition-all hover:scale-105 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Przeglądaj jako gość
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl font-bold mb-2">100% Darmowe</div>
              <div className="text-blue-100">Bez ukrytych opłat</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl font-bold mb-2">Sprawdzone</div>
              <div className="text-blue-100">Oceniane przez użytkowników</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Dostęp w każdej chwili</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="mb-2">ZroZoom Research Hub - Twoja baza wiedzy edukacyjnej</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
