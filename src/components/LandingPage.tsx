import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Resource, Subject, ResourceTopic, ResourceLevel } from '../lib/supabase';
import { ResourceCard } from './ResourceCard';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { BookOpen, Layers, TrendingUp, Award, Sparkles, ArrowRight, Calculator, Globe, Clock, Languages, Code, Palette, Dumbbell, Music, Microscope, Atom, Beaker, ChevronDown, ShieldCheck, Users, Search } from 'lucide-react';
import { SEO } from './SEO';

type Stats = {
  topicsCount: number;
  subjectsCount: number;
  levelsCount: number;
};

export function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ topicsCount: 0, subjectsCount: 0, levelsCount: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceTopics, setResourceTopics] = useState<Map<string, ResourceTopic[]>>(new Map());
  const [resourceLevels, setResourceLevels] = useState<Map<string, ResourceLevel[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  const mottos = [
    "Baza wiedzy i narzędzi",
    "Odkrywaj świat nauki z AI",
    "Ucz się mądrzej, nie ciężej",
    "Wspieramy Twój rozwój"
  ];
  const [currentMottoIndex, setCurrentMottoIndex] = useState(0);
  const [isMottoVisible, setIsMottoVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMottoVisible(false);
      setTimeout(() => {
        setCurrentMottoIndex((prev) => (prev + 1) % mottos.length);
        setIsMottoVisible(true);
      }, 500); // Wait for fade out
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // Check if query matches a subject name
      const matchedSubject = subjects.find(s =>
        s.subject_name.toLowerCase() === query.toLowerCase()
      );

      if (matchedSubject) {
        navigate(`/zasoby/${matchedSubject.subject_slug}`);
      } else {
        navigate(`/zasoby?q=${encodeURIComponent(query)}`);
      }
    }
  };

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
        supabase.from('v_subjects_basic').select('*').order('topics_count', { ascending: false }),
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
            // Define type for resource topic data
            type ResourceTopicData = {
              resource_id: string;
              topic_id: string;
              topic_name: string;
              topic_slug: string;
              parent_topic_id: string | null;
              subject_slug: string;
            };
            const topicsMap = new Map<string, ResourceTopic[]>();
            (topicsData.data as ResourceTopicData[]).forEach((item) => {
              const { resource_id, ...topicData } = item;
              if (!topicsMap.has(resource_id)) {
                topicsMap.set(resource_id, []);
              }
              topicsMap.get(resource_id)!.push(topicData);
            });
            setResourceTopics(topicsMap);
          }

          if (levelsData.data) {
            // Define type for resource level data
            type ResourceLevelData = {
              resource_id: string;
              levels: ResourceLevel[];
            };
            const levelsMap = new Map<string, ResourceLevel[]>();
            (levelsData.data as ResourceLevelData[]).forEach((item) => {
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

  const scrollToSubjects = () => {
    const element = document.getElementById('available-subjects');
    element?.scrollIntoView({ behavior: 'smooth' });
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
      <SEO
        title="Darmowe zasoby edukacyjne: Matematyka, Fizyka, AI"
        description="Szkoła Przyszłości z AI to największa baza darmowych materiałów edukacyjnych. Przygotuj się do matury i egzaminu ósmoklasisty z pomocą sztucznej inteligencji."
      />
      <Navigation onNavigateToAuth={() => navigate('/auth')} onScrollToSubjects={scrollToSubjects} onBrowseAsGuest={() => navigate('/zasoby')} />
      <section className="relative min-h-[70vh] bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 flex items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
        <div className="max-w-6xl w-full text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              Szkoła Przyszłości z AI
              <sup className="inline-block ml-2">
                <Sparkles size={32} className="text-yellow-300 animate-pulse" />
              </sup>
            </h1>
            <p
              className={`text-2xl md:text-3xl lg:text-4xl text-violet-100 mb-6 max-w-3xl mx-auto transition-opacity duration-500 ${isMottoVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              {mottos[currentMottoIndex]}
            </p>
            <p className="text-lg md:text-xl text-violet-50 max-w-2xl mx-auto animate-fade-in-up mb-8" style={{ animationDelay: '0.5s', opacity: 0 }}>
              Odkrywaj materiały edukacyjne, pogrupowane według tematów i poziomów.
              Ucz się efektywniej z zasobów polecanych przez społeczność.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12 animate-fade-in-up relative z-20" style={{ animationDelay: '0.6s', opacity: 0 }}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Czego chcesz się dzisiaj nauczyć?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-full text-gray-900 text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 pl-14"
                />
                <Search className="absolute left-5 text-gray-400" size={24} />
                <button
                  type="submit"
                  className="absolute right-2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  Szukaj
                </button>
              </div>
            </form>

            <button
              onClick={scrollToResources}
              className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors animate-fade-in-up mx-auto"
              style={{ animationDelay: '0.7s', opacity: 0 }}
            >
              <span className="text-sm font-medium">Zobacz ostatnio dodane materiały</span>
              <ChevronDown size={32} className="animate-bounce" />
            </button>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '120px' }}>
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#ffffff"></path>
        </svg>
      </section>

      <section className="py-8 bg-white border-b border-gray-100 relative z-20 -mt-8 mx-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">{stats.topicsCount}</div>
                <div className="text-gray-600 text-sm">Tematów</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
              <div className="bg-green-50 p-3 rounded-full">
                <Layers size={24} className="text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">{stats.subjectsCount}</div>
                <div className="text-gray-600 text-sm">Przedmiotów</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
              <div className="bg-purple-50 p-3 rounded-full">
                <Award size={24} className="text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">{stats.levelsCount}</div>
                <div className="text-gray-600 text-sm">Poziomów</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dlaczego warto?</h2>
            <p className="text-lg text-gray-600">Tworzymy edukację przyszłości razem... ze sztuczną inteligencją!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sprawdzone materiały</h3>
              <p className="text-gray-600">Wszystkie zasoby są weryfikowane przez społeczność i ekspertów.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Oszczędność czasu</h3>
              <p className="text-gray-600">Szybko znajdź gotowe materiały na lekcje dzięki zaawansowanym filtrom.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Społeczność</h3>
              <p className="text-gray-600">Wymieniaj się doświadczeniami i inspiracjami z innymi nauczycielami.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="latest-resources" className="py-12 px-4 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <TrendingUp size={32} className="text-blue-600" />
              Ostatnio dodane materiały
            </h2>
            <p className="text-lg text-gray-600">Odkryj najnowsze zasoby dodane przez społeczność</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestResources.map((resource) => (
              <div key={resource.id}>
                <ResourceCard
                  resource={resource}
                  topics={resourceTopics.get(resource.id) || []}
                  levels={resourceLevels.get(resource.id) || []}
                  variant="hero"
                  onCardClick={(res) => {
                    const subject = subjects.find(s => s.subject_id === res.subject_id);
                    if (subject) {
                      navigate(`/zasoby/${subject.subject_slug}`);
                    }
                  }}
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

      <section id="available-subjects" className="py-20 px-4 bg-gray-50 scroll-mt-24">
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
                  onClick={() => navigate(`/zasoby/${subject.subject_slug}`)}
                  className={`bg-gradient-to-br ${gradient} p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer group`}
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
                        {subject.topics_count} {subject.topics_count === 1 ? 'temat' : subject.topics_count < 5 ? 'tematy' : 'tematów'}
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



      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Gotowi do nauki?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Dołącz do społeczności uczących się i odkrywaj sprawdzone materiały edukacyjne
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            Zarejestruj się teraz
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <Footer theme="dark" />
    </div >
  );
}
