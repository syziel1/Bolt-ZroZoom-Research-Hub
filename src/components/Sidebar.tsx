import { Subject, Level, TopicNode } from '../lib/supabase';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { TopicTree } from './TopicTree';

type SidebarProps = {
  subjects: Subject[];
  topicNodes: TopicNode[];
  levels: Level[];
  languages: string[];
  selectedSubject: string | null;
  selectedTopics: string[];
  selectedLevels: string[];
  selectedLanguages: string[];
  onSubjectChange: (subjectId: string | null) => void;
  onTopicToggle: (topicId: string) => void;
  onLevelToggle: (levelId: string) => void;
  onLanguageToggle: (language: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  includeSubtopics?: boolean;
  onIncludeSubtopicsChange?: (include: boolean) => void;
};

export function Sidebar({
  subjects,
  topicNodes,
  levels,
  languages,
  selectedSubject,
  selectedTopics,
  selectedLevels,
  selectedLanguages,
  onSubjectChange,
  onTopicToggle,
  onLevelToggle,
  onLanguageToggle,
  isOpen,
  onClose,
  isLoading = false,
  includeSubtopics = true,
  onIncludeSubtopicsChange,
}: SidebarProps) {
  const [topicsExpanded, setTopicsExpanded] = useState(true);
  const [levelsExpanded, setLevelsExpanded] = useState(true);
  const [languagesExpanded, setLanguagesExpanded] = useState(true);

  // Map language codes to full names
  const getLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
      'pl': 'Polski',
      'en': 'Angielski',
      'de': 'Niemiecki',
      'fr': 'Francuski',
      'es': 'Hiszpański',
      'it': 'Włoski',
      'ru': 'Rosyjski',
      'uk': 'Ukraiński',
    };
    return languageMap[code.toLowerCase()] || code;
  };

  // filteredTopics logic removed as it's handled by useTopics in parent

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar content */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Czego szukasz?</h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Wybierz przedmiot</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onSubjectChange(null);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedSubject === null
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Wszystkie przedmioty
              </button>
              {subjects.map((subject) => (
                <button
                  key={subject.subject_id}
                  onClick={() => {
                    onSubjectChange(subject.subject_id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedSubject === subject.subject_id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {subject.subject_name}
                </button>
              ))}
            </div>
          </div>

          {selectedSubject && (
            <div className="mb-6">
              <button
                onClick={() => setTopicsExpanded(!topicsExpanded)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
              >
                <span>Wybierz interesujący Cię temat</span>
                {topicsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {topicsExpanded && (
                <div className="pl-1">
                  <label className="flex items-center gap-2 mb-3 px-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSubtopics}
                      onChange={(e) => onIncludeSubtopicsChange?.(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Pokaż też podtematy</span>
                  </label>
                  {isLoading ? (
                    <div className="text-sm text-gray-500 px-2 py-1">Ładowanie tematów...</div>
                  ) : (
                    <TopicTree
                      nodes={topicNodes}
                      selectedTopics={selectedTopics}
                      onTopicToggle={onTopicToggle}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setLevelsExpanded(!levelsExpanded)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
            >
              <span>Wybierz poziomy</span>
              {levelsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {levelsExpanded && (
              <div className="space-y-2">
                {levels.map((level) => (
                  <label
                    key={level.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level.id)}
                      onChange={() => onLevelToggle(level.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{level.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => setLanguagesExpanded(!languagesExpanded)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
            >
              <span>Wybierz język</span>
              {languagesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {languagesExpanded && (
              <div className="space-y-2">
                {languages.map((language) => (
                  <label
                    key={language}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language)}
                      onChange={() => onLanguageToggle(language)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{getLanguageName(language)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
