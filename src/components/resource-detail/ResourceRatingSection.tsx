import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Star } from 'lucide-react';

type Rating = {
    id: string;
    rating_usefulness: number;
    rating_correctness: number;
    difficulty_match: number | null;
    author_nick: string;
    created_at: string;
};

type ResourceRatingSectionProps = {
    resourceId: string;
    isGuestMode: boolean;
    onRatingUpdate?: () => void;
};

export function ResourceRatingSection({ resourceId, isGuestMode, onRatingUpdate }: ResourceRatingSectionProps) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [userHasRated, setUserHasRated] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [ratingData, setRatingData] = useState({
        usefulness: 5,
        correctness: 5,
        difficulty: 3,
    });

    const loadUserData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    }, []);

    const checkUserRating = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('ratings')
                .select('*')
                .eq('resource_id', resourceId)
                .eq('author_id', user.id)
                .maybeSingle();

            setUserHasRated(!!data);
            if (data) {
                setRatingData({
                    usefulness: data.rating_usefulness,
                    correctness: data.rating_correctness,
                    difficulty: data.difficulty_match || 3,
                });
            }
        }
    }, [resourceId]);

    const loadRatings = useCallback(async () => {
        const { data } = await supabase
            .from('ratings')
            .select(`
        id,
        rating_usefulness,
        rating_correctness,
        difficulty_match,
        created_at,
        author:author_id (nick)
      `)
            .eq('resource_id', resourceId)
            .order('created_at', { ascending: false });

        if (data) {
            setRatings(data.map(r => ({
                ...r,
                author_nick: (r.author as unknown as { nick: string })?.nick || 'Nieznany',
            })));
        }
    }, [resourceId]);

    useEffect(() => {
        loadRatings();
        if (!isGuestMode) {
            loadUserData();
            checkUserRating();
        }
    }, [resourceId, isGuestMode, loadRatings, loadUserData, checkUserRating]);

    const handleSubmitRating = async () => {
        if (!currentUserId) return;

        setSubmitting(true);
        const { error } = await supabase
            .from('ratings')
            .upsert({
                resource_id: resourceId,
                author_id: currentUserId,
                rating_usefulness: ratingData.usefulness,
                rating_correctness: ratingData.correctness,
                difficulty_match: ratingData.difficulty,
            }, { onConflict: 'resource_id,author_id' });

        if (!error) {
            setShowRatingForm(false);
            setUserHasRated(true);
            loadRatings();
            onRatingUpdate?.();
        }
        setSubmitting(false);
    };

    return (
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={20} />
                    Oceny ({ratings.length})
                </h4>
                {!isGuestMode && !userHasRated && (
                    <button
                        onClick={() => setShowRatingForm(!showRatingForm)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                        {showRatingForm ? 'Anuluj' : (userHasRated ? 'Edytuj ocenę' : 'Dodaj ocenę')}
                    </button>
                )}
            </div>

            {showRatingForm && (
                <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg mb-4 border border-gray-200 dark:border-slate-700">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Przydatność: {ratingData.usefulness}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={ratingData.usefulness}
                                onChange={(e) => setRatingData({ ...ratingData, usefulness: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Poprawność: {ratingData.correctness}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={ratingData.correctness}
                                onChange={(e) => setRatingData({ ...ratingData, correctness: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dopasowanie trudności: {ratingData.difficulty}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={ratingData.difficulty}
                                onChange={(e) => setRatingData({ ...ratingData, difficulty: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <button
                            onClick={handleSubmitRating}
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Wysyłanie...' : (userHasRated ? 'Zaktualizuj ocenę' : 'Wyślij ocenę')}
                        </button>
                    </div>
                </div>
            )}

            {userHasRated && !showRatingForm && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Twoja ocena została zapisana.
                    <button
                        onClick={() => setShowRatingForm(true)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-1 underline"
                    >
                        Edytuj
                    </button>
                </p>
            )}

            <div className="space-y-3">
                {ratings.map((rating) => (
                    <div key={rating.id} className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{rating.author_nick}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(rating.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <span>Przydatność: {rating.rating_usefulness}/5</span>
                            <span>Poprawność: {rating.rating_correctness}/5</span>
                            {rating.difficulty_match && (
                                <span>Trudność: {rating.difficulty_match}/5</span>
                            )}
                        </div>
                    </div>
                ))}
                {ratings.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Brak ocen. Dodaj pierwszą ocenę!</p>
                )}
            </div>
        </div>
    );
}
