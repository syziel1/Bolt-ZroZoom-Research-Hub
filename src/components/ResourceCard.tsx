import { Resource } from '../lib/supabase';
import { Video, FileText, Presentation, Beaker, Wrench, Star, ExternalLink } from 'lucide-react';

type ResourceCardProps = {
  resource: Resource;
};

const typeIcons: Record<string, any> = {
  video: Video,
  article: FileText,
  pdf: FileText,
  presentation: Presentation,
  quiz: FileText,
  simulation: Beaker,
  tool: Wrench,
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || FileText;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 border border-gray-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Icon size={24} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-600">{resource.subject_name}</p>
        </div>
      </div>

      {resource.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {resource.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {resource.level_names?.map((level, idx) => (
          <span
            key={idx}
            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {level}
          </span>
        ))}
      </div>

      {resource.topic_names && resource.topic_names.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.topic_names.slice(0, 3).map((topic, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
            >
              {topic}
            </span>
          ))}
          {resource.topic_names.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{resource.topic_names.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span>{resource.avg_rating?.toFixed(1) || 'N/A'}</span>
        </div>
        <div className="text-xs text-gray-500">
          by {resource.contributor_nick}
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
        >
          Open
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
