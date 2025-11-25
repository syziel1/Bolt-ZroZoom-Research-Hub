import { useState, useEffect } from 'react';
import { supabase, Resource, Subject } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { BookOpen, Library, Layers, TrendingUp, Award, ArrowRight } from 'lucide-react';

type LandingPageProps = {
  onNavigateToAuth: () => void;
  onBrowseAsGuest: () => void;
};

type Stats = {
  resourcesCount: number;
  subjectsCount: number;
  levelsCount: number;
};

export function LandingPage({ onNavigateToAuth, onBrowseAsGuest }: LandingPageProps) {
  const [stats, setStats] = useState<Stats>({ resourcesCount: 0, subjectsCount: 0, levelsCount: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLandingPageData();
  }, []);

  const loadLandingPageData = async () => {
    setLoading(true);
    try {
      const [resourcesCount, subjectsData, levelsCount, latestResourcesData] = await Promise.all([
        supabase.from('v_resources_full').select('*', { count: 'exact', head: true }),
        supabase.from('v_subjects_basic').select('*').order('order_index'),
        supabase.from('levels').select('*', { count: 'exact', head: true }),
        supabase
          .from('v_resources_full')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      setStats({
        resourcesCount: resourcesCount.count || 0,
        subjectsCount: subjectsData.data?.length || 0,
        levelsCount: levelsCount.count || 0,
      });

      if (subjectsData.data) setSubjects(subjectsData.data);
      if (latestResourcesData.data) setLatestResources(latestResourcesData.data);
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-50 p-3 rounded-full">
                  <BookOpen size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.resourcesCount}</div>
              <div className="text-gray-600">Dostępnych zasobów</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-50 p-3 rounded-full">
                  <Layers size={32} className="text-green-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.subjectsCount}</div>
              <div className="text-gray-600">Przedmiotów</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-50 p-3 rounded-full">
                  <Award size={32} className="text-purple-600" />
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
            {subjects.map((subject) => (
              <div
                key={subject.subject_id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-all hover:scale-105 border border-gray-200 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <BookOpen size={32} className="text-blue-600" />
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
            ))}
          </div>

          {subjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Brak dostępnych przedmiotów</p>
            </div>
          )}
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

      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6"><Gotowi></Gotowi> do nauki?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Dołącz do społeczności uczących się i odkryj tysiące sprawdzonych materiałów edukacyjnych
          </p>
          <button
            onClick={onNavigateToAuth}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            Rozpocznij teraz
            <ArrowRight size={20} />
          </button>
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
