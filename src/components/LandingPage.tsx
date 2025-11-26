import { useState, useEffect } from 'react';
import { supabase, Resource, Subject, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { Navigation } from './Navigation';
import { BookOpen, Library, Layers, TrendingUp, Award, Sparkles, ArrowRight, Calculator, TestTube, Globe, Clock, Languages, Code, Palette, Dumbbell, Music, Microscope, Atom, Beaker } from 'lucide-react';

type LandingPageProps = {
  onNavigateToAuth: () => void;
  onBrowseAsGuest: (subjectId?: string) => void;
};

type Stats = {
  topicsCount: number;
  subjectsCount: number;
  levelsCount: number;
};

export function LandingPage({ onNavigateToAuth, onBrowseAsGuest }: LandingPageProps) {
  const [stats, setStats] = useState<Stats>({ topicsCount: 0, subjectsCount: 0, levelsCount: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceTopics, setResourceTopics] = useState<Map<string, ResourceTopic[]>>(new Map());
  const [resourceLevels, setResourceLevels] = useState<Map<string, ResourceLevel[]>>(new Map());

  useEffect(() => {
    loadLandingPageData();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          if (!element.dataset.animated) {
            element.classList.add('animate-fade-in-up');
            element.classList.remove('opacity-0');
            element.dataset.animated = 'true';
            observer.unobserve(element);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const resourceCards = document.querySelectorAll('.resource-card-animate');
    const subjectCards = document.querySelectorAll('.subject-card-animate');

    resourceCards.forEach((card, index) => {
      const element = card as HTMLElement;
      if (!element.dataset.animated) {
        element.style.animationDelay = `${index * 0.1}s`;
        observer.observe(element);
      }
    });

    subjectCards.forEach((card, index) => {
      const element = card as HTMLElement;
      if (!element.dataset.animated) {
        element.style.animationDelay = `${index * 0.1}s`;
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [latestResources.length, subjects.length]);

  const loadLandingPageData = async () => {
    setLoading(true);
    try {
      const [topicsCount, subjectsData, levelsCount, allResourcesData] = await Promise.all([
        supabase.from('topics').select('*', { count: 'exact', head: true }),
        supabase.from('v_subjects_basic').select('*').order('resources_count', { ascending: false }),
        supabase.from('levels').select('*', { count: 'exact', head: true }),
        supabase
          .from('v_resources_full')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      setStats({
        topicsCount: topicsCount.count || 0,
        subjectsCount: subjectsData.data?.length || 0,
        levelsCount: levelsCount.count || 0,
      });

      if (subjectsData.data) setSubjects(subjectsData.data);

      if (allResourcesData.data) {
        const resourcesBySubject = new Map<string, Resource>();
        allResourcesData.data.forEach((resource: Resource) => {
          if (!resourcesBySubject.has(resource.subject_id)) {
            resourcesBySubject.set(resource.subject_id, resource);
          }
        });
        const latestResourcesList = Array.from(resourcesBySubject.values());

        if (latestResourcesList.length > 0) {
          const resourceIds = latestResourcesList.map(r => r.id);
          const [topicsData, levelsData] = await Promise.all([
            supabase
              .from('v_resource_topics')
              .select('resource_id, topic_id, topic_name, topic_slug, parent_topic_id, subject_slug')
              .in('resource_id', resourceIds),
            supabase
              .from('v_resource_levels')
              .select('resource_id, levels')
              .in('resource_id', resourceIds),
          ]);

          if (topicsData.data) {
            const topicsMap = new Map<string, ResourceTopic[]>();
            topicsData.data.forEach((item: any) => {
              const { resource_id, ...topicData } = item;
              if (!topicsMap.has(resource_id)) {
                topicsMap.set(resource_id, []);
              }
              topicsMap.get(resource_id)!.push(topicData);
            });
            setResourceTopics(topicsMap);
          }

          if (levelsData.data) {
            const levelsMap = new Map<string, ResourceLevel[]>();
            levelsData.data.forEach((item: any) => {
              if (item.levels && Array.isArray(item.levels)) {
                levelsMap.set(item.resource_id, item.levels);
              }
            });
            setResourceLevels(levelsMap);
          }
        }

        setLatestResources(latestResourcesList);
      }
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

  const scrollToSubjects = () => {
    const element = document.getElementById('available-subjects');
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
      <Navigation onNavigateToAuth={onNavigateToAuth} onScrollToSubjects={scrollToSubjects} onBrowseAsGuest={() => onBrowseAsGuest()} />
      <section className="relative min-h-[70vh] bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 flex items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
        <div className="max-w-6xl w-full text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-white text-sm font-medium">AI-powered • Nowoczesna edukacja</span>
            </div>
            <div className="inline-block bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-6 animate-float" style={{ animationDelay: '0.2s' }}>
              <Library size={64} className="text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              Szkoła Przyszłości z AI
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-violet-100 mb-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              ZroZoom AI Hub
            </p>
            <p className="text-lg md:text-xl text-violet-50 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
              Odkryj materiały edukacyjne, pogrupowane według tematów i poziomów.
              Ucz się efektywniej z zasobów wybranych przez społeczność.
            </p>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#ffffff"></path>
        </svg>
      </section>

      <section id="latest-resources" className="py-12 px-4 bg-white">
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
              <div key={resource.id} className="resource-card-animate opacity-0">
                <ResourceCard
                  resource={resource}
                  topics={resourceTopics.get(resource.id) || []}
                  levels={resourceLevels.get(resource.id) || []}
                  variant="hero"
                />
              </div>
            ))}
          </div>

          {latestResources.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Brak dostępnych zasobów</p>
            </div>
          )}
        </div>
      </section>

      <section id="available-subjects" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dostępne przedmioty</h2>
            <p className="text-lg text-gray-600">Wybierz przedmiot i rozpocznij naukę</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-violet-500 to-purple-600',
                'from-pink-500 to-rose-600',
                'from-orange-500 to-amber-600',
                'from-emerald-500 to-green-600',
                'from-cyan-500 to-teal-600',
              ];
              const gradient = gradients[index % gradients.length];

              const getSubjectIcon = (subjectName: string) => {
                const name = subjectName.toLowerCase();
                if (name.includes('sztuczn') || name.includes('ai') || name.includes('inteligencj')) return Sparkles;
                if (name.includes('matematyk')) return Calculator;
                if (name.includes('fizyk')) return Atom;
                if (name.includes('chemi')) return Beaker;
                if (name.includes('geograf')) return Globe;
                if (name.includes('histor')) return Clock;
                if (name.includes('angielski') || name.includes('niemiecki') || name.includes('francuski') || name.includes('język')) return Languages;
                if (name.includes('informatyk') || name.includes('programow')) return Code;
                if (name.includes('plastyk') || name.includes('sztuk')) return Palette;
                if (name.includes('wf') || name.includes('wychowanie fizyczne')) return Dumbbell;
                if (name.includes('muzyk')) return Music;
                if (name.includes('biologi')) return Microscope;
                return BookOpen;
              };

              const SubjectIcon = getSubjectIcon(subject.subject_name);

              return (
                <div
                  key={subject.subject_id}
                  onClick={() => onBrowseAsGuest(subject.subject_id)}
                  className={`subject-card-animate opacity-0 bg-gradient-to-br ${gradient} p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer group`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg group-hover:bg-white/30 transition-colors">
                      <SubjectIcon size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">
                        {subject.subject_name}
                      </h3>
                      <p className="text-sm text-white/80 mt-1">
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

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-blue-50 p-2 rounded-full">
                  <BookOpen size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.topicsCount}</div>
              <div className="text-gray-600 text-sm">Tematów</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-green-50 p-2 rounded-full">
                  <Layers size={24} className="text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.subjectsCount}</div>
              <div className="text-gray-600 text-sm">Przedmiotów</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-center mb-3">
                <div className="bg-purple-50 p-2 rounded-full">
                  <Award size={24} className="text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.levelsCount}</div>
              <div className="text-gray-600 text-sm">Poziomów</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Gotowi do nauki?</h2>
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
          <p className="mb-2">Szkoła Przyszłości AI - ZroZoom Hub - Twoja baza wiedzy edukacyjnej</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} Sylwester Zieliński. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
