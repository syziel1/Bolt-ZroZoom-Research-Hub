import { Subject, Topic, Level } from '../lib/supabase';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

type SidebarProps = {
  subjects: Subject[];
  topics: Topic[];
  levels: Level[];
  selectedSubject: string | null;
  selectedTopics: string[];
  selectedLevels: string[];
  onSubjectChange: (subjectId: string | null) => void;
  onTopicToggle: (topicId: string) => void;
  onLevelToggle: (levelId: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({
  subjects,
  topics,
  levels,
  selectedSubject,
  selectedTopics,
  selectedLevels,
  onSubjectChange,
  onTopicToggle,
  onLevelToggle,
  isOpen,
  onClose,
}: SidebarProps) {
  const [topicsExpanded, setTopicsExpanded] = useState(true);
  const [levelsExpanded, setLevelsExpanded] = useState(true);

  const filteredTopics = selectedSubject
    ? topics.filter((t) => t.subject_id === selectedSubject)
    : [];

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
            <h2 className="text-xl font-bold text-gray-900">Filtry</h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Przedmiot</h3>
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
                  <div className="flex items-center justify-between">
                    <span>{subject.subject_name}</span>
                    <span className="text-xs text-gray-500">({subject.resources_count})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedSubject && filteredTopics.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setTopicsExpanded(!topicsExpanded)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
              >
                <span>Tematy</span>
                {topicsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {topicsExpanded && (
                <div className="space-y-2">
                  {filteredTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={() => onTopicToggle(topic.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{topic.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setLevelsExpanded(!levelsExpanded)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
            >
              <span>Poziomy</span>
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
        </div>
      </div>
    </>
  );
}
