const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Result = require("../models/Result");
const Course = require("../models/Course");
const Submission = require("../models/Submission");

// ============================================
// STUDENT AI ACADEMIC ASSISTANT CHAT
// ============================================
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please provide a message query"
            });
        }

        const studentId = req.user._id;
        const studentName = req.user.name;

        // Fetch student enrollments
        const enrollments = await Enrollment.find({ studentId, status: "approved" }).populate("courseId");
        const courses = enrollments.map(e => e.courseId).filter(c => c !== null);
        const courseIds = courses.map(c => c._id);

        // Fetch upcoming assignments
        const assignments = await Assignment.find({ courseId: { $in: courseIds } });

        // Fetch student results
        const results = await Result.find({ studentId }).populate({
            path: "examId",
            populate: { path: "courseId", select: "name code" }
        });

        const queryLower = message.toLowerCase();
        let aiResponse = "";
        let suggestedPrompts = [];

        if (queryLower.includes("deadline") || queryLower.includes("assignment") || queryLower.includes("todo") || queryLower.includes("due")) {
            // Deadline inquiry
            if (assignments.length === 0) {
                aiResponse = `Hello ${studentName}! I checked your active schedule and you currently have no pending assignments or upcoming deadlines. You're fully caught up!`;
            } else {
                const pendingList = assignments.map(a => {
                    const status = new Date(a.dueDate) < new Date() ? "Expired/Passed" : "Upcoming";
                    return `• **${a.title}** (Course: ${a.courseId ? "Active Course" : "LMS Module"}) - Due: ${new Date(a.dueDate).toLocaleDateString()} [Status: ${status}]`;
                }).join("\n");
                
                aiResponse = `Hello ${studentName}! Here are your assignment details:\n\n${pendingList}\n\nMake sure to prioritize the closest deadlines. Would you like me to suggest a study schedule for any of these?`;
            }
            suggestedPrompts = [
                "Suggest a study plan for my next assignment",
                "Summarize my enrolled courses",
                "What is my current GPA/Grades?"
            ];
        } else if (queryLower.includes("course") || queryLower.includes("enrolled") || queryLower.includes("subject") || queryLower.includes("class")) {
            // Course enrollment inquiry
            if (courses.length === 0) {
                aiResponse = `Hello ${studentName}! It looks like you are not enrolled in any courses yet. Please navigate to the course catalog to enroll or contact your administrator.`;
            } else {
                const courseList = courses.map(c => `• **${c.code} - ${c.name}** (Semester ${c.semester}, ${c.credits} Credits)`).join("\n");
                aiResponse = `Hello ${studentName}! You are currently enrolled in **${courses.length} course(s)** for this term:\n\n${courseList}\n\nI can help you review materials, explain concepts, or find assignments for these courses!`;
            }
            suggestedPrompts = [
                "Are there any upcoming exams?",
                "Check my deadlines",
                "How do I practice Indian Classical Ragas?"
            ];
        } else if (queryLower.includes("grade") || queryLower.includes("result") || queryLower.includes("mark") || queryLower.includes("gpa") || queryLower.includes("performance")) {
            // Grades inquiry
            if (results.length === 0) {
                aiResponse = `Hello ${studentName}! I couldn't find any published exam results or graded assignments in your profile yet. As soon as your lecturers release grades, they will appear here.`;
            } else {
                const gradeList = results.map(r => `• **${r.examId?.name || "Exam"}**: Score of **${r.score}/${r.totalMarks}** (Grade: **${r.grade}**)`).join("\n");
                const totalPoints = results.reduce((acc, curr) => acc + (curr.gradePoints || 0), 0);
                const gpa = (totalPoints / results.length).toFixed(2);
                
                aiResponse = `Hello ${studentName}! Here are your academic grades:\n\n${gradeList}\n\nYour calculated average Grade Point is **${gpa}**. Keep up the great work! Let me know if you want tips to improve in any subject.`;
            }
            suggestedPrompts = [
                "How can I improve my grades?",
                "List my enrolled courses",
                "Generate a study quiz"
            ];
        } else if (queryLower.includes("raga") || queryLower.includes("music") || queryLower.includes("sing") || queryLower.includes("veena") || queryLower.includes("carnatic")) {
            aiResponse = `Ah, a fellow classical music practitioner! For **Carnatic Music** and **Raga Lakshanas**, remember that consistency in *Swarasthana* practice is key. 
            
Here are a few quick tips for your studies:
1. **Arohana & Avarohana**: Memorize the exact scale rules for your ragas (e.g. *Mayamalavagowla* vs *Kalyani*).
2. **Sruti Alignment**: Always practice with a Tanpura background to solidify your pitch accuracy.
3. **Tala Notation**: Mark the *Aksharas* clearly in your assignment files.

Would you like me to quiz you on basic Carnatic music terminology?`;
            suggestedPrompts = [
                "Quiz me on Carnatic Music",
                "Check my music deadlines",
                "Explain the difference between Arohana and Avarohana"
            ];
        } else if (queryLower.includes("dance") || queryLower.includes("bharatanatyam") || queryLower.includes("mudra") || queryLower.includes("abhinaya")) {
            aiResponse = `Greetings dancer! In **Bharatanatyam** and **Traditional Dance**, performance is theoretical as much as physical. 
            
Key areas to study:
1. **Asamyuta and Samyuta Hastas**: Make sure you know all single-hand and double-hand gestures by heart.
2. **Nritta vs Nritya**: Focus on rhythmic pure dance movements (*Adavus*) versus expressive storytelling (*Abhinaya*).
3. **Tala Rhythm**: Keep track of the *Adi Tala* cycles (8 beats).

Would you like a mock test on the *Abhinaya Darpana* hand gestures?`;
            suggestedPrompts = [
                "Quiz me on Bharatanatyam mudras",
                "Check my dance deadlines",
                "Explain Nritta vs Nritya"
            ];
        } else if (queryLower.includes("drama") || queryLower.includes("theatre") || queryLower.includes("play") || queryLower.includes("koothu")) {
            aiResponse = `Hello actor! In **Drama & Theatre Arts** (including traditional *Koothu* forms), focus on:
1. **Aaharya Abhinaya**: The costume, makeup, and stage properties unique to rural folk drama.
2. **Voice Projection**: Warm-up guidelines for open-air theatres.
3. **Script Analysis**: Subtext and character motivations.

Let me know if you need to summarize any dramatic theory papers or review staging structures!`;
            suggestedPrompts = [
                "What is Koothu theatre?",
                "What are the four types of Abhinaya?",
                "Check my deadlines"
            ];
        } else {
            // General greeting / standard helper
            aiResponse = `Hello ${studentName}! I am your AI Academic Assistant. 

I can help you:
• Check your **deadlines & upcoming assignments**.
• List your **enrolled courses** and view instructors.
• Summarize your **grades and GPA performance**.
• Answer questions about **Carnatic Music theory, Bharatanatyam mudras, or drama scripts**.

What can I assist you with today?`;
            suggestedPrompts = [
                "Check my upcoming deadlines",
                "Summarize my enrolled courses",
                "What is my current GPA/Grades?",
                "Give me study tips for Carnatic Music"
            ];
        }

        res.status(200).json({
            success: true,
            data: {
                reply: aiResponse,
                suggestedPrompts,
                timestamp: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "AI Chat failed to process request",
            error: error.message
        });
    }
};

// ============================================
// LECTURER AI QUIZ GENERATOR
// ============================================
exports.generateQuiz = async (req, res) => {
    try {
        const { topic, questionCount, difficulty } = req.body;
        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Please specify a quiz topic"
            });
        }

        const count = parseInt(questionCount) || 5;
        const diff = difficulty || "medium";
        const topicLower = topic.toLowerCase();

        let questions = [];

        // Context-aware questions for SVIAS Aesthetic Studies
        if (topicLower.includes("raga") || topicLower.includes("music") || topicLower.includes("carnatic")) {
            questions = [
                {
                    type: "mcq",
                    questionText: "Which of the following is considered the main Melakarta raga for learning Carnatic music fundamentals?",
                    options: [
                        "Mayamalavagowla",
                        "Kalyani",
                        "Sankarabharanam",
                        "Kharaharapriya"
                    ],
                    correctAnswer: "Mayamalavagowla",
                    explanation: "Mayamalavagowla is the 15th Melakarta raga. Traditionally, beginners learn the initial swara exercises in this raga due to its symmetrical interval structure."
                },
                {
                    type: "true_false",
                    questionText: "The term 'Arohana' refers to the descending scale of a raga.",
                    options: ["True", "False"],
                    correctAnswer: "False",
                    explanation: "Arohana is the ascending scale of a raga, while Avarohana refers to the descending scale."
                },
                {
                    type: "mcq",
                    questionText: "How many Melakarta (parent) ragas are there in the Carnatic music system?",
                    options: ["36", "72", "108", "54"],
                    correctAnswer: "72",
                    explanation: "The Venkatamakhin scheme organizes Carnatic music into 72 Melakarta ragas split into two groups of 36 (Suddha Madhyama and Prati Madhyama)."
                },
                {
                    type: "mcq",
                    questionText: "Which instrument is historically associated with the goddess Saraswathi and represents the stringed division in Carnatic music?",
                    options: ["Mridangam", "Veena", "Flute", "Violin"],
                    correctAnswer: "Veena",
                    explanation: "The Saraswathi Veena is the pre-eminent stringed instrument of South India, possessing 24 fixed frets and 7 strings."
                },
                {
                    type: "true_false",
                    questionText: "A 'Janya' raga is derived directly from a parent Melakarta raga by omitting or adding swaras.",
                    options: ["True", "False"],
                    correctAnswer: "True",
                    explanation: "Janya ragas are secondary ragas created by deleting notes, adding notes, or arranging notes in a zig-zag (vakra) manner from a Melakarta raga."
                }
            ];
        } else if (topicLower.includes("dance") || topicLower.includes("bharatanatyam") || topicLower.includes("mudra")) {
            questions = [
                {
                    type: "mcq",
                    questionText: "What is the primary classical text that serves as the foundation for hand gestures (Mudras) and expressions in Bharatanatyam?",
                    options: [
                        "Abhinaya Darpana",
                        "Natya Shastra",
                        "Sangita Ratnakara",
                        "Geeta Govinda"
                    ],
                    correctAnswer: "Abhinaya Darpana",
                    explanation: "The Abhinaya Darpana by Nandikeshvara is the primary text detailing the Hastas (hand gestures) and expressions used in classical dance."
                },
                {
                    type: "true_false",
                    questionText: "Samyuta Hastas refer to double-hand gestures where both hands are used together.",
                    options: ["True", "False"],
                    correctAnswer: "True",
                    explanation: "Samyuta Hastas are double-hand gestures (e.g. Anjali, Kapota), while Asamyuta Hastas are single-hand gestures (e.g. Pataka, Tripataka)."
                },
                {
                    type: "mcq",
                    questionText: "In Bharatanatyam, the pure aesthetic dance movements devoid of narrative representation are categorized as:",
                    options: ["Nritta", "Nritya", "Natya", "Abhinaya"],
                    correctAnswer: "Nritta",
                    explanation: "Nritta consists of abstract, rhythmic movements (Adavus) that do not convey any dramatic meaning or story."
                },
                {
                    type: "mcq",
                    questionText: "Which of the following Rasa represents the feeling of 'Anger' in the Navarasa system?",
                    options: ["Raudra", "Veera", "Bibhatsa", "Bhayanaka"],
                    correctAnswer: "Raudra",
                    explanation: "Raudra is the Rasa representing Anger. Shringara represents Love, Veera represents Heroism, and Bibhatsa represents Disgust."
                },
                {
                    type: "true_false",
                    questionText: "The basic unit of dance movement combining stance, steps, and hand gestures in Bharatanatyam is called an 'Adavu'.",
                    options: ["True", "False"],
                    correctAnswer: "True",
                    explanation: "An Adavu is indeed the fundamental block of Bharatanatyam, requiring synchronized leg movements, posture, and hand expressions."
                }
            ];
        } else if (topicLower.includes("drama") || topicLower.includes("theatre") || topicLower.includes("koothu")) {
            questions = [
                {
                    type: "mcq",
                    questionText: "Which folk theatre tradition, popular in eastern Sri Lanka, uses rhythmic chants, circular movements, and elaborate crowns (Kreedam)?",
                    options: [
                        "Vadamodi Koothu",
                        "Kolam",
                        "Nadagam",
                        "Sokari"
                    ],
                    correctAnswer: "Vadamodi Koothu",
                    explanation: "Vadamodi Koothu is a classical folk dance-drama form of Batticaloa/Trincomalee featuring heroic, high-energy dance steps and mythological stories."
                },
                {
                    type: "true_false",
                    questionText: "In Sanskrit drama theory, the 'Sutradhara' is the narrator/stage manager who introduces the play.",
                    options: ["True", "False"],
                    correctAnswer: "True",
                    explanation: "The Sutradhara (literally 'holder of strings') acts as the director, stage manager, and presenter of the play in traditional Indian dramaturgy."
                },
                {
                    type: "mcq",
                    questionText: "Which type of Abhinaya refers to the use of costumes, makeup, stage props, and ornaments?",
                    options: ["Aaharya", "Angika", "Vachika", "Sattvika"],
                    correctAnswer: "Aaharya",
                    explanation: "Aaharya Abhinaya relates to physical costume/makeup decoration. Angika is body movement, Vachika is verbal speech, and Sattvika is emotional expression."
                }
            ];
        } else {
            // General educational questions fallback based on topic
            questions = [
                {
                    type: "mcq",
                    questionText: `Which of the following best defines the primary core concept of "${topic}"?`,
                    options: [
                        "Theoretical categorization and historical study",
                        "Direct replication of natural phenomena",
                        "Aesthetic practice and creative composition",
                        "Mathematical derivation and logic validation"
                    ],
                    correctAnswer: "Aesthetic practice and creative composition",
                    explanation: `In aesthetic studies, the study of ${topic} focuses on the union of creative expression and structural theory.`
                },
                {
                    type: "true_false",
                    questionText: `Critical analysis of ${topic} requires both historical context and technical mastery.`,
                    options: ["True", "False"],
                    correctAnswer: "True",
                    explanation: "A complete evaluation combines historical background with execution skills."
                },
                {
                    type: "mcq",
                    questionText: `What is the standard classification method used to organize research on "${topic}"?`,
                    options: [
                        "Empirical mapping and documentation",
                        "Stochastic modeling and forecasting",
                        "Linear optimization",
                        "None of the above"
                    ],
                    correctAnswer: "Empirical mapping and documentation",
                    explanation: "Academic research builds upon structured archiving, field recordings, and notation analysis."
                }
            ];
        }

        // Limit or shuffle questions based on count
        const selectedQuestions = questions.slice(0, count);

        res.status(200).json({
            success: true,
            message: `AI generated ${selectedQuestions.length} questions for topic: "${topic}"`,
            data: {
                topic,
                difficulty: diff,
                questions: selectedQuestions
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "AI Quiz Generation failed",
            error: error.message
        });
    }
};

// ============================================
// LECTURER AI ASSIGNMENT EVALUATOR
// ============================================
exports.evaluateSubmission = async (req, res) => {
    try {
        const { submissionText, assignmentId } = req.body;
        if (!submissionText) {
            return res.status(400).json({
                success: false,
                message: "Please provide the student's submission text for evaluation"
            });
        }

        let assignmentTitle = "Course Portfolio Assignment";
        let maxMarks = 100;

        if (assignmentId) {
            const assignment = await Assignment.findById(assignmentId);
            if (assignment) {
                assignmentTitle = assignment.title;
                // If assignment has maxMarks, use it (fallback to 100)
            }
        }

        // Run evaluation logic based on length, keywords, structure
        const length = submissionText.trim().split(/\s+/).length;
        let score = 75; // baseline
        let feedbackPoints = [];
        let missingElements = [];

        // Keyword analysis for Art, Music, Dance
        const hasAesthetics = /raga|tala|mudra|dance|abhinaya|swara|stage|performance|aesthetic|folk|traditional/i.test(submissionText);
        const hasCitations = /reference|citation|source|dr\.|prof\.|according to|book|study/i.test(submissionText);
        const hasStructure = submissionText.includes("\n\n") || submissionText.length > 500;

        if (length > 300) score += 10;
        else if (length < 80) score -= 15;

        if (hasAesthetics) {
            score += 8;
            feedbackPoints.push("Strong integration of aesthetic-specific terminology and contextual vocabulary.");
        } else {
            missingElements.push("Aesthetic studies terminology (e.g. specific Ragas, Mudras, performance stages, or cultural contexts).");
        }

        if (hasCitations) {
            score += 5;
            feedbackPoints.push("Good academic formatting with citations of relevant performing arts texts or experts.");
        } else {
            missingElements.push("Academic references or mentions of historical treatises (e.g. Natya Shastra, Abhinaya Darpana).");
        }

        if (hasStructure) {
            score += 2;
            feedbackPoints.push("Structure is logical with clear paragraph divisions.");
        } else {
            feedbackPoints.push("Improve formatting by separating distinct concepts into separate paragraphs.");
        }

        // Cap score
        score = Math.max(30, Math.min(98, score));

        // Generate synthetic comments
        let summaryText = "";
        if (score >= 85) {
            summaryText = `This is an outstanding submission for "${assignmentTitle}". The student demonstrates deep theoretical comprehension and practical context.`;
        } else if (score >= 70) {
            summaryText = `A solid submission showing a good grasp of "${assignmentTitle}". However, incorporating more historical references and specific technical definitions would elevate the arguments.`;
        } else {
            summaryText = `The response is brief and requires expansion. To improve, please address the core theoretical concepts of "${assignmentTitle}" in greater depth.`;
        }

        const suggestedFeedback = `**AI Assessment Summary:**\n${summaryText}\n\n` +
            `**Key Strengths:**\n` + feedbackPoints.map(p => `- ${p}`).join("\n") + `\n\n` +
            (missingElements.length > 0 ? `**Areas for Improvement:**\n` + missingElements.map(e => `- Mention or detail: ${e}`).join("\n") : `**Areas for Improvement:**\n- Excellent execution overall. Keep pursuing high-level vocabulary.`);

        res.status(200).json({
            success: true,
            data: {
                recommendedGrade: score,
                recommendedFeedback: suggestedFeedback,
                metrics: {
                    wordCount: length,
                    hasAesthetics,
                    hasCitations
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "AI Evaluation failed",
            error: error.message
        });
    }
};
