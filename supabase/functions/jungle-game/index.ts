import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fisher-Yates shuffle algorithm for proper randomization
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Question templates by difficulty level
const questionTemplates = {
    1: [ // Easy - basic operations with small numbers
        { op: '+', min: 1, max: 20 },
        { op: '-', min: 1, max: 20 },
        { op: '*', min: 1, max: 10 },
    ],
    2: [ // Medium - larger numbers and division
        { op: '+', min: 10, max: 100 },
        { op: '-', min: 10, max: 100 },
        { op: '*', min: 5, max: 20 },
        { op: '/', min: 2, max: 12 }, // Division with clean results
    ],
    3: [ // Hard - complex operations
        { op: '+', min: 50, max: 500 },
        { op: '-', min: 50, max: 500 },
        { op: '*', min: 10, max: 50 },
        { op: '/', min: 5, max: 20 },
    ],
}

type Difficulty = 1 | 2 | 3;

interface Question {
    id: string;
    content: string;
    correctAnswer: string;
    options: string[];
}

function generateQuestion(level: Difficulty): Question {
    const templates = questionTemplates[level]
    const template = templates[Math.floor(Math.random() * templates.length)]

    let a: number, b: number, result: number

    switch (template.op) {
        case '+':
            a = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            b = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            result = a + b
            break
        case '-':
            a = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            b = Math.floor(Math.random() * Math.min(a, template.max - template.min + 1)) + template.min
            if (b > a) [a, b] = [b, a] // Ensure positive result
            result = a - b
            break
        case '*':
            a = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            b = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            result = a * b
            break
        case '/':
            b = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            result = Math.floor(Math.random() * (template.max - template.min + 1)) + template.min
            a = b * result // Ensure clean division
            break
        default:
            a = 1
            b = 1
            result = 2
    }

    const correctAnswer = result.toString()

    // Generate wrong answers (close to correct answer)
    const wrongAnswers: string[] = []
    const offsets = shuffleArray([-2, -1, 1, 2, 3, -3, 5, -5])

    for (const offset of offsets) {
        const wrongAnswer = (result + offset).toString()
        if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer) && parseInt(wrongAnswer) >= 0) {
            wrongAnswers.push(wrongAnswer)
            if (wrongAnswers.length === 3) break
        }
    }

    // Pad with more if needed
    while (wrongAnswers.length < 3) {
        const wrongAnswer = (result + Math.floor(Math.random() * 10) + 1).toString()
        if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
            wrongAnswers.push(wrongAnswer)
        }
    }

    // Shuffle all options using Fisher-Yates
    const options = shuffleArray([correctAnswer, ...wrongAnswers])

    return {
        id: crypto.randomUUID(),
        content: `${a} ${template.op} ${b} = ?`,
        correctAnswer,
        options,
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized - missing authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Get user from auth
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const body = await req.json()
        const { action } = body

        switch (action) {
            case 'start': {
                const level = body.level as Difficulty || 1
                const totalQuestions = 10

                // Generate first question
                const firstQuestion = generateQuestion(level)

                // Create session in database
                const { data: sessionData, error: sessionError } = await supabaseClient
                    .from('jungle_sessions')
                    .insert({
                        user_id: user.id,
                        level,
                        total_questions: totalQuestions,
                        current_question_index: 1,
                        correct_answers: 0,
                        status: 'active',
                        current_question: firstQuestion,
                    })
                    .select()
                    .single()

                if (sessionError) {
                    console.error('Session creation error:', sessionError)
                    return new Response(JSON.stringify({ error: 'Nie udało się utworzyć sesji' }), {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                return new Response(JSON.stringify({
                    session: {
                        id: sessionData.id,
                        status: sessionData.status,
                        level: sessionData.level,
                        currentQuestionIndex: sessionData.current_question_index,
                        totalQuestions: sessionData.total_questions,
                        correctAnswers: sessionData.correct_answers,
                        startedAt: sessionData.created_at,
                    },
                    question: {
                        id: firstQuestion.id,
                        content: firstQuestion.content,
                        options: firstQuestion.options,
                        questionNumber: 1,
                    },
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            case 'answer': {
                const { sessionId, questionId, answer } = body

                // Get session
                const { data: session, error: getError } = await supabaseClient
                    .from('jungle_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .single()

                if (getError || !session) {
                    return new Response(JSON.stringify({ error: 'Sesja nie znaleziona' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                const currentQuestion = session.current_question as Question
                if (!currentQuestion || currentQuestion.id !== questionId) {
                    return new Response(JSON.stringify({ error: 'Nieprawidłowe pytanie' }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                const isCorrect = answer === currentQuestion.correctAnswer
                const newCorrectAnswers = session.correct_answers + (isCorrect ? 1 : 0)
                const newQuestionIndex = session.current_question_index + 1
                const isFinished = newQuestionIndex > session.total_questions

                let nextQuestion: Question | null = null
                if (!isFinished) {
                    nextQuestion = generateQuestion(session.level as Difficulty)
                }

                // Update session
                const updateData: Record<string, unknown> = {
                    correct_answers: newCorrectAnswers,
                    current_question_index: newQuestionIndex,
                    current_question: isFinished ? null : nextQuestion,
                }

                if (isFinished) {
                    updateData.status = 'finished'
                    updateData.finished_at = new Date().toISOString()
                }

                const { error: updateError } = await supabaseClient
                    .from('jungle_sessions')
                    .update(updateData)
                    .eq('id', sessionId)

                if (updateError) {
                    console.error('Update error:', updateError)
                    return new Response(JSON.stringify({ error: 'Błąd aktualizacji sesji' }), {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                const response: Record<string, unknown> = {
                    correct: isCorrect,
                    correctAnswer: currentQuestion.correctAnswer,
                    session: {
                        id: sessionId,
                        status: isFinished ? 'finished' : 'active',
                        level: session.level,
                        currentQuestionIndex: newQuestionIndex,
                        totalQuestions: session.total_questions,
                        correctAnswers: newCorrectAnswers,
                        startedAt: session.created_at,
                    },
                }

                if (nextQuestion) {
                    response.nextQuestion = {
                        id: nextQuestion.id,
                        content: nextQuestion.content,
                        options: nextQuestion.options,
                        questionNumber: newQuestionIndex,
                    }
                }

                return new Response(JSON.stringify(response), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            case 'finish': {
                const { sessionId } = body

                // Get session
                const { data: session, error: getError } = await supabaseClient
                    .from('jungle_sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .eq('user_id', user.id)
                    .single()

                if (getError || !session) {
                    return new Response(JSON.stringify({ error: 'Sesja nie znaleziona' }), {
                        status: 404,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                // Calculate score
                const score = Math.round((session.correct_answers / session.total_questions) * 100 * session.level)
                const startTime = new Date(session.created_at).getTime()
                const endTime = session.finished_at ? new Date(session.finished_at).getTime() : Date.now()
                const durationSeconds = Math.round((endTime - startTime) / 1000)

                // Update if not already finished
                if (session.status !== 'finished') {
                    await supabaseClient
                        .from('jungle_sessions')
                        .update({
                            status: 'finished',
                            finished_at: new Date().toISOString(),
                            score,
                        })
                        .eq('id', sessionId)
                }

                return new Response(JSON.stringify({
                    sessionId: session.id,
                    correctAnswers: session.correct_answers,
                    totalQuestions: session.total_questions,
                    score,
                    durationSeconds,
                    level: session.level,
                    finishedAt: session.finished_at || new Date().toISOString(),
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            case 'progress': {
                // Get user's game statistics
                const { data: sessions, error: sessionsError } = await supabaseClient
                    .from('jungle_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'finished')

                if (sessionsError) {
                    return new Response(JSON.stringify({ error: 'Błąd pobierania statystyk' }), {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                if (!sessions || sessions.length === 0) {
                    return new Response(JSON.stringify({
                        totalGamesPlayed: 0,
                        totalCorrectAnswers: 0,
                        totalQuestions: 0,
                        averageScore: 0,
                        bestScore: 0,
                        lastPlayedAt: null,
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    })
                }

                const totalGamesPlayed = sessions.length
                const totalCorrectAnswers = sessions.reduce((sum, s) => sum + s.correct_answers, 0)
                const totalQuestions = sessions.reduce((sum, s) => sum + s.total_questions, 0)
                const scores = sessions.map(s => s.score || 0)
                const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                const bestScore = Math.max(...scores)
                const lastPlayedAt = sessions
                    .map(s => s.finished_at)
                    .filter(Boolean)
                    .sort()
                    .pop()

                return new Response(JSON.stringify({
                    totalGamesPlayed,
                    totalCorrectAnswers,
                    totalQuestions,
                    averageScore,
                    bestScore,
                    lastPlayedAt,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            default:
                return new Response(JSON.stringify({ error: 'Unknown action' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
        }
    } catch (error) {
        console.error('Jungle game error:', error)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
